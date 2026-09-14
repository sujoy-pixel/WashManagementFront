-- ============================================================================
-- OBJECT : [dbo].[SP_Get_Wash_OrderWiseBalanceDashboard]
-- REQ    : BRD -Wash- Order-wise Balance Dashboard (Fabric & Garments) v1.0, 30-Aug-2026
-- GRAIN  : one row per (Buyer, Job, Order, Style, Color, DressPart)  (BRD FR-1.2)
--
-- FORMULAS (BRD section 5.2 / 5.3 - confirmed from the BRD PDF; do not change without
--           a BRD update):
--   ReceiveBalance   = OrderQty        - TotalReceiveQty
--   ReadyForDelivery = TotalQCQty      - TotalDeliveryQty
--   DeliveryBalance  = TotalReceiveQty - TotalDeliveryQty
--
-- DISPLAY MAPPING ("IMPORTANT MAPPING" carried over from the previously-live version -
--   PLEASE RE-CONFIRM WITH THE BUSINESS TEAM: an earlier draft of this SP in this same
--   folder had it reversed):
--     Receive.StyleId  -> tbl_OrderInformation.BuyerReferenceId  -> shown as [Style]
--     Receive.OrderId  -> tbl_OrderInformation.StyleId           -> shown as [Order]
--
-- CHANGE LOG (this revision):
--   1. OrderQtyPcs was OI.TotalQty (the WHOLE order's qty, identical for every Color/
--      DressPart row, and #OrderInfo never matched on JobNo at all) -> rebuilt via
--      tbl_OrderInformation -> GarmentsProductionDB.Garp.TemporaryOrderBookingSize
--      (joined on OrderIdAuto + ColorId), SUM(SizeQty), grouped to
--      Buyer/Job/Order/Style/Color (DressPart intentionally excluded - see STEP 3 note).
--   2. ReceiveBalance / ReadyForDelivery / DeliveryBalance corrected to match BRD 5.2/5.3
--      exactly. Previously: ReceiveBalancePcs used Receive-Delivery instead of
--      Order-Receive; ReadyForDeliveryPcs and DeliveryBalanceQtyPcs were IDENTICAL
--      formulas (both Receive-Delivery-ApprovalTrail, with ApprovalTrail hard-coded to 0)
--      even though #QCAgg (QC.TotalQCQty) was already being computed and joined but
--      never actually used. Same duplication existed for ReadyForDeliveryKg.
--   3. Delivery is now matched/grouped on Buyer/Job/Order/Style/Color ONLY - DressPartId
--      is dropped entirely from the delivery match/group (confirmed: DressPartId is
--      frequently NULL on real tbl_DispatchSlipGenerationDetails rows and was silently
--      dropping valid delivery rows). DD.BuyerNo stays NULL-safe (matched when present,
--      ignored when NULL, same reason). NOTE: a Buyer/Job/Order/Style/Color group that
--      spans more than one DressPart will show the SAME delivery totals on every
--      DressPart row - accepted simplification, not a bug.
--   4. Delivery now requires GateWay = 'Wash Dispatch Slip' (via tbl_TrackingDispatchNo,
--      matched on TrackingNo + ChallanId = DispatchSlipGenerationId) and excludes
--      cancelled dispatch slips (tbl_DispatchSlipGenerationMaster.IsCancel = 1).
--   5. OrderQtyKg / FabricConPerDzn: still no confirmed Kg-quantity source table/column
--      -> left NULL, flagged TODO-DBA. Provide the source and this gets wired in.
--   6. Dia, ReceiveRoll (Pcs view has none), ApprovalTrail: still no confirmed source,
--      left as 0 / NULL placeholders as in the prior version (TODO-DBA).
--   7. CUMULATIVE (LIFE-TO-DATE) BALANCES: #FilteredReceive is no longer restricted to
--      @FromDate..@ToDate - it's now everything up to @ToDate (@FromDate lower bound
--      removed), and QC (#QCAgg) matches the same change. Delivery already had no lower
--      bound. A new #WindowGroups (STEP 0B) captures which Buyer/Job/Order/Style/Color
--      groups actually had receive activity in the selected @FromDate-@ToDate window -
--      that's what decides which rows appear in the grid. So @FromDate/@ToDate now mean
--      "show me groups active in this window" while every quantity/date column shown
--      (TotalReceiveQty, FirstReceiveDate, TotalDeliveryQty, TotalQCQty, balances, etc.)
--      reflects the true life-to-date figure through @ToDate - not just the window.
-- ============================================================================
CREATE OR ALTER PROCEDURE [dbo].[SP_Get_Wash_OrderWiseBalanceDashboard]
(
    @UnitId     INT,
    @FromDate   DATE,
    @ToDate     DATE,
    @ViewType   TINYINT = 1       -- 1 = Garments (Pcs), 2 = Fabric & Cutting Parts (Kg)
)
AS
BEGIN
    SET NOCOUNT ON;

    /* ================================================================
       PARAMETER VALIDATION
       ================================================================ */

    IF @UnitId IS NULL
       OR @FromDate IS NULL
       OR @ToDate IS NULL
    BEGIN
        RAISERROR(
            'SP_Get_Wash_OrderWiseBalanceDashboard: @UnitId, @FromDate and @ToDate are all mandatory.',
            16,
            1
        );
        RETURN;
    END;

    IF @FromDate > @ToDate
    BEGIN
        RAISERROR(
            'SP_Get_Wash_OrderWiseBalanceDashboard: @FromDate cannot be after @ToDate.',
            16,
            1
        );
        RETURN;
    END;

    IF @ViewType NOT IN (1, 2)
        SET @ViewType = 1;


    /* ================================================================
       STEP 0   *** FIXED: now cumulative (life-to-date) through @ToDate ***

       @FromDate is no longer a lower bound on the receive data itself -
       it only decides which Buyer/Job/Order/Style/Color groups are "in
       scope" for this run (see STEP 0B, #WindowGroups). Every quantity/
       date aggregate below (Receive, Delivery, QC, WashType, BatchLot,
       representative row, etc.) is computed from the FULL history up to
       @ToDate, so ReceiveBalance/DeliveryBalance/ReadyForDelivery reflect
       the true life-to-date balance, not just activity inside the
       selected window.
       ================================================================ */

    CREATE TABLE #FilteredReceive
    (
        TrackingNo      NVARCHAR(50),
        ReceiveDate     DATE,
        FromUnitId      INT,
        BuyerId         INT,
        JobId           INT,
        OrderId         INT,
        StyleId         INT,
        ColorId         INT,
        DressPartId     INT,
        FabricationId   INT,
        GSMId           INT,
        Dia             INT,
        ReceiveRoll     INT,
        ReceiveQty      DECIMAL(18, 2),
        ShipmentDate    DATE
    );


    INSERT INTO #FilteredReceive
    (
        TrackingNo,
        ReceiveDate,
        FromUnitId,
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,
        FabricationId,
        GSMId,
        Dia,
        ReceiveRoll,
        ReceiveQty,
        ShipmentDate
    )
    SELECT
        D.TrackingBatchNo,
        CAST(M.CreateDate AS DATE),
        D.FromUnitId,
        D.BuyerId,
        D.JobId,
        D.OrderId,
        D.StyleId,
        D.ColorId,
        D.DressPartId,
        D.FabricationId,
        D.GSMId,

        0 AS Dia,               -- TODO-DBA: no confirmed Dia source
        0 AS ReceiveRoll,       -- TODO-DBA: no confirmed roll-count source on receive

        D.TotalQty,
        D.ShipmentDate

    FROM dbo.tbl_Wash_Order_Raceive_Operation_Details D WITH (NOLOCK)

    INNER JOIN dbo.tbl_Wash_Order_Raceive_Operation_Master M WITH (NOLOCK)
        ON M.MasterId = D.MasterId
       AND M.IsActive = 1

    WHERE M.UnitId = @UnitId
      AND CAST(M.CreateDate AS DATE) <= @ToDate;   -- cumulative: no @FromDate lower bound


    /* ================================================================
       STEP 0B   *** NEW ***
       WINDOW SCOPE

       The set of Buyer/Job/Order/Style/Color groups that actually had
       receive activity inside the user-selected @FromDate-@ToDate
       window. This is what decides which rows appear in the final grid
       (joined in at the very end) - it does NOT limit the cumulative
       totals computed above, which stay life-to-date through @ToDate.

       DressPart is intentionally excluded from this key (matches the
       Delivery/OrderInfo grouping below) - if any DressPart under a
       Buyer/Job/Order/Style/Color combo was active in the window, every
       DressPart row for that combo is shown.
       ================================================================ */

    CREATE TABLE #WindowGroups
    (
        BuyerId   INT,
        JobId     INT,
        OrderId   INT,
        StyleId   INT,
        ColorId   INT
    );


    INSERT INTO #WindowGroups
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId
    )
    SELECT DISTINCT
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId

    FROM #FilteredReceive

    WHERE ReceiveDate BETWEEN @FromDate AND @ToDate;


    /* ================================================================
       STEP 1
       BATCH / WASH TYPE
       ================================================================ */

    CREATE TABLE #BatchDim
    (
        TrackingNo  NVARCHAR(50),
        BatchNo     NVARCHAR(50)
    );


    INSERT INTO #BatchDim
    (
        TrackingNo,
        BatchNo
    )
    SELECT DISTINCT
        FR.TrackingNo,
        WBPM.AutoBatchNo

    FROM #FilteredReceive FR

    INNER JOIN dbo.WashBatchPrepareMaster WBPM WITH (NOLOCK)
        ON WBPM.TackingBatchNo = FR.TrackingNo;


    CREATE TABLE #WashCategoryByBatch
    (
        BatchNo     NVARCHAR(50),
        WashType    NVARCHAR(500)
    );


    INSERT INTO #WashCategoryByBatch
    (
        BatchNo,
        WashType
    )
    SELECT
        WC.BatchNo,

        STUFF
        (
            (
                SELECT DISTINCT
                    ', ' + WC2.ProcessName

                FROM
                (
                    SELECT
                        WBPM.AutoBatchNo AS BatchNo,
                        PNE.ProcessName

                    FROM dbo.WashBatchPrepareMaster WBPM WITH (NOLOCK)

                    CROSS APPLY dbo.SplitString
                    (
                        WBPM.ProcessIds,
                        ','
                    ) SP

                    INNER JOIN dbo.tbl_ProcessNameEntry PNE WITH (NOLOCK)
                        ON PNE.ProcessId = TRY_CAST(SP.Value AS INT)

                    WHERE WBPM.ProcessIds IS NOT NULL
                      AND WBPM.ProcessIds <> ''
                      AND WBPM.AutoBatchNo = WC.BatchNo

                ) WC2

                FOR XML PATH(''), TYPE

            ).value('.', 'NVARCHAR(MAX)'),

            1,
            2,
            ''
        )

    FROM
    (
        SELECT DISTINCT
            BatchNo
        FROM #BatchDim
    ) WC;


    /* ================================================================
       STEP 2A
       FABRIC COMPOSITION
       ================================================================ */

    CREATE TABLE #FabricComp
    (
        FabricationId       INT,
        FabricComposition   NVARCHAR(500)
    );


    INSERT INTO #FabricComp
    (
        FabricationId,
        FabricComposition
    )
    SELECT DISTINCT
        FR.FabricationId,
        I.ItemName

    FROM #FilteredReceive FR

    INNER JOIN SCM..tbl_Item I WITH (NOLOCK)
        ON I.ITEMID = FR.FabricationId;


    /* ================================================================
       STEP 2B
       GSM
       ================================================================ */

    CREATE TABLE #GSMLookup
    (
        GSMId   INT,
        GSM     NVARCHAR(100)
    );


    INSERT INTO #GSMLookup
    (
        GSMId,
        GSM
    )
    SELECT DISTINCT
        FR.GSMId,
        ISZ.ItemSizeName

    FROM #FilteredReceive FR

    INNER JOIN SCM..tbl_ItemSize ISZ WITH (NOLOCK)
        ON ISZ.ISZID = FR.GSMId;


    /* ================================================================
       STEP 2C
       DIA
       ================================================================ */

    CREATE TABLE #DiaLookup
    (
        FabricationId   INT,
        Dia             INT
    );


    INSERT INTO #DiaLookup
    (
        FabricationId,
        Dia
    )
    SELECT DISTINCT
        FR.FabricationId,
        0

    FROM #FilteredReceive FR;


    /* ================================================================
       STEP 3   *** FIXED ***
       ORDER INFORMATION / ORDER QTY (PCS)

       Was: OI.TotalQty (whole-order total, identical for every Color/
            DressPart row; #OrderInfo never matched on JobNo either).

       Now: tbl_OrderInformation (Buyer + BuyerReferenceId + StyleId + JobNo)
            -> GarmentsProductionDB.Garp.TemporaryOrderBookingSize
               (joined on OrderIdAuto + ColorId, SUM SizeQty)
            grouped to Buyer/Job/Order/Style/Color - DressPart intentionally
            excluded (per instruction, same simplification as the Delivery
            match in STEP 5) even though TemporaryOrderBookingSize also
            carries DressPartId. NOTE: this means every DressPart row on the
            final grid under the same Buyer/Job/Order/Style/Color shows the
            SAME OrderQtyPcs (BRD FR-1.2 nominally partitions by DressPart
            too - flagging the deviation, not silently diverging from it).

       IMPORTANT MAPPING (see header comment - please re-confirm):
           D.StyleId  -> tbl_OrderInformation.BuyerReferenceId
           D.OrderId  -> tbl_OrderInformation.StyleId
       ================================================================ */

    CREATE TABLE #OrderInfo
    (
        BuyerId         INT,
        JobId           INT,
        OrderId         INT,
        StyleId         INT,
        ColorId         INT,
        OrderQtyPcs     DECIMAL(18, 2),
        OrderQtyKg      DECIMAL(18, 2)   -- TODO-DBA: no confirmed Kg source yet; stays NULL.
    );


    INSERT INTO #OrderInfo
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        OrderQtyPcs
    )
    SELECT
        FR.BuyerId,
        FR.JobId,
        FR.OrderId,
        FR.StyleId,
        FR.ColorId,

        SUM(ISNULL(TOBS.SizeQty, 0))

    FROM
    (
        SELECT DISTINCT
            BuyerId,
            JobId,
            OrderId,
            StyleId,
            ColorId

        FROM #FilteredReceive
    ) FR

    INNER JOIN MerchandisingDB..tbl_OrderInformation OI WITH (NOLOCK)
        ON OI.BuyerId = FR.BuyerId
       AND OI.BuyerReferenceId = FR.StyleId
       AND OI.StyleId = FR.OrderId
       AND OI.JobNo = FR.JobId

    INNER JOIN GarmentsProductionDB.Garp.TemporaryOrderBookingSize TOBS WITH (NOLOCK)
        ON TOBS.OrderIdAuto = OI.OrderIdAuto
       AND TOBS.ColorId = FR.ColorId

    GROUP BY
        FR.BuyerId,
        FR.JobId,
        FR.OrderId,
        FR.StyleId,
        FR.ColorId;


    /* ================================================================
       STEP 4
       RECEIVE GROUP AGGREGATION
       ================================================================ */

    CREATE TABLE #GroupAgg
    (
        BuyerId           INT,
        JobId             INT,
        OrderId           INT,
        StyleId           INT,
        ColorId           INT,
        DressPartId       INT,
        FirstReceiveDate  DATE,
        LastReceiveDate   DATE,
        TotalReceiveQty   DECIMAL(18, 2),
        TotalReceiveRoll  INT
    );


    INSERT INTO #GroupAgg
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,
        FirstReceiveDate,
        LastReceiveDate,
        TotalReceiveQty,
        TotalReceiveRoll
    )
    SELECT
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,

        MIN(ReceiveDate),
        MAX(ReceiveDate),

        SUM(ReceiveQty),
        SUM(ISNULL(ReceiveRoll, 0))

    FROM #FilteredReceive

    GROUP BY
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId;


    /* ================================================================
       STEP 4B
       REPRESENTATIVE RECEIVE ROW
       ================================================================ */

    CREATE TABLE #GroupRep
    (
        BuyerId           INT,
        JobId             INT,
        OrderId           INT,
        StyleId           INT,
        ColorId           INT,
        DressPartId       INT,
        TrackingNo        NVARCHAR(50),
        FabricationId     INT,
        GSMId             INT,
        ShipmentDate      DATE,
        ReceiveFromUnitId INT
    );


    INSERT INTO #GroupRep
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,
        TrackingNo,
        FabricationId,
        GSMId,
        ShipmentDate,
        ReceiveFromUnitId
    )
    SELECT
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,
        TrackingNo,
        FabricationId,
        GSMId,
        ShipmentDate,
        FromUnitId

    FROM
    (
        SELECT
            FR.*,

            ROW_NUMBER() OVER
            (
                PARTITION BY
                    BuyerId,
                    JobId,
                    OrderId,
                    StyleId,
                    ColorId,
                    DressPartId

                ORDER BY
                    ReceiveDate DESC,
                    TrackingNo DESC
            ) AS rn

        FROM #FilteredReceive FR
    ) X

    WHERE X.rn = 1;


    /* ================================================================
       STEP 4C
       WASH TYPE BY GROUP
       ================================================================ */

    CREATE TABLE #GroupWashType
    (
        BuyerId       INT,
        JobId         INT,
        OrderId       INT,
        StyleId       INT,
        ColorId       INT,
        DressPartId   INT,
        WashType      NVARCHAR(500)
    );


    INSERT INTO #GroupWashType
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,
        WashType
    )
    SELECT
        X.BuyerId,
        X.JobId,
        X.OrderId,
        X.StyleId,
        X.ColorId,
        X.DressPartId,

        STUFF
        (
            (
                SELECT DISTINCT
                    ', ' + WC.WashType

                FROM #FilteredReceive FR2

                INNER JOIN #BatchDim BD2
                    ON BD2.TrackingNo = FR2.TrackingNo

                INNER JOIN #WashCategoryByBatch WC
                    ON WC.BatchNo = BD2.BatchNo

                WHERE FR2.BuyerId = X.BuyerId
                  AND FR2.JobId = X.JobId
                  AND FR2.OrderId = X.OrderId
                  AND FR2.StyleId = X.StyleId
                  AND FR2.ColorId = X.ColorId
                  AND FR2.DressPartId = X.DressPartId

                  AND WC.WashType IS NOT NULL
                  AND WC.WashType <> N''

                FOR XML PATH(''), TYPE

            ).value('.', 'NVARCHAR(MAX)'),

            1,
            2,
            ''
        )

    FROM
    (
        SELECT DISTINCT
            BuyerId,
            JobId,
            OrderId,
            StyleId,
            ColorId,
            DressPartId

        FROM #FilteredReceive
    ) X;


    /* ================================================================
       STEP 4D
       BATCH / LOT
       ================================================================ */

    CREATE TABLE #GroupBatchLot
    (
        BuyerId       INT,
        JobId         INT,
        OrderId       INT,
        StyleId       INT,
        ColorId       INT,
        DressPartId   INT,
        BatchLot      NVARCHAR(1000)
    );


    INSERT INTO #GroupBatchLot
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,
        BatchLot
    )
    SELECT
        X.BuyerId,
        X.JobId,
        X.OrderId,
        X.StyleId,
        X.ColorId,
        X.DressPartId,

        STUFF
        (
            (
                SELECT DISTINCT
                    ', ' + BD2.BatchNo

                FROM #FilteredReceive FR2

                INNER JOIN #BatchDim BD2
                    ON BD2.TrackingNo = FR2.TrackingNo

                WHERE FR2.BuyerId = X.BuyerId
                  AND FR2.JobId = X.JobId
                  AND FR2.OrderId = X.OrderId
                  AND FR2.StyleId = X.StyleId
                  AND FR2.ColorId = X.ColorId
                  AND FR2.DressPartId = X.DressPartId

                  AND BD2.BatchNo IS NOT NULL
                  AND BD2.BatchNo <> N''

                FOR XML PATH(''), TYPE

            ).value('.', 'NVARCHAR(MAX)'),

            1,
            2,
            ''
        )

    FROM
    (
        SELECT DISTINCT
            BuyerId,
            JobId,
            OrderId,
            StyleId,
            ColorId,
            DressPartId

        FROM #FilteredReceive
    ) X;


    /* ================================================================
       STEP 5   *** FIXED ***
       DELIVERY AGGREGATION

       Fixes applied (see header comment for detail):
        - Delivery is now matched/grouped on Buyer/Job/Order/Style/Color
          ONLY (DressPartId dropped entirely - it is unreliable/NULL on
          real tbl_DispatchSlipGenerationDetails rows, per confirmation).
          NOTE: if a Buyer/Job/Order/Style/Color group spans more than one
          DressPart in the main grid, every DressPart row for that group
          will show the SAME delivery totals (delivery is not split by
          DressPart) - this is an accepted simplification, not a bug.
        - DD.BuyerNo match is NULL-safe (frequently NULL on real rows and
          was silently dropping valid delivery rows when required exactly).
        - Added GateWay = 'Wash Dispatch Slip' filter via tbl_TrackingDispatchNo.
        - Added ISNULL(DM.IsCancel,0) = 0 to exclude cancelled dispatch slips.
       ================================================================ */

    CREATE TABLE #DeliveryAgg
    (
        BuyerId             INT,
        JobId               INT,
        OrderId             INT,
        StyleId             INT,
        ColorId             INT,
        FirstDeliveryDate   DATE,
        LastDeliveryDate    DATE,
        TotalDeliveryQty    DECIMAL(18, 2),
        TotalDeliveryRoll   INT,
        TotalApprovalTrail  DECIMAL(18, 2),
        DeliveryRemarks     NVARCHAR(2000)
    );


    ;WITH DeliveryLines AS
    (
        SELECT
            FR.BuyerId,
            FR.JobId,
            FR.OrderId,
            FR.StyleId,
            FR.ColorId,

            CAST(DM.CreatedDate AS DATE) AS DeliveryDate,

            ISNULL
            (
                TRY_CAST(DD.Qty AS DECIMAL(18, 2)),
                0
            ) AS Qty,

            ISNULL
            (
                TRY_CAST(DD.RollCount AS INT),
                0
            ) AS RollCount,

            0 AS ApprovalTrailQty,      -- TODO-DBA: no confirmed "approval trail" source

            DD.Remarks

        FROM GatePassDB..tbl_DispatchSlipGenerationDetails DD WITH (NOLOCK)

        INNER JOIN GatePassDB..tbl_DispatchSlipGenerationMaster DM WITH (NOLOCK)
            ON DM.DispatchSlipGenerationId =
               DD.DispatchSlipGenerationId
           AND ISNULL(DM.IsCancel, 0) = 0

        INNER JOIN GatePassDB..tbl_TrackingDispatchNo TDN WITH (NOLOCK)
            ON TDN.TrackingNo = DD.TrackingNo
           AND TDN.ChallanId = DD.DispatchSlipGenerationId
           AND TDN.GateWay = N'Wash Dispatch Slip'

        INNER JOIN
        (
            SELECT DISTINCT
                TrackingNo,
                BuyerId,
                JobId,
                OrderId,
                StyleId,
                ColorId

            FROM #FilteredReceive

        ) FR

            ON FR.TrackingNo = DD.TrackingNo

           AND
           (
               DD.BuyerNo IS NULL
               OR TRY_CAST(DD.BuyerNo AS INT) = FR.BuyerId
           )

           AND TRY_CAST(DD.JobNo AS INT) = FR.JobId

           AND TRY_CAST(DD.OrderNo AS INT) = FR.OrderId

           AND TRY_CAST(DD.StyleNo AS INT) = FR.StyleId

           AND DD.ICLEID = FR.ColorId
    )


    INSERT INTO #DeliveryAgg
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        FirstDeliveryDate,
        LastDeliveryDate,
        TotalDeliveryQty,
        TotalDeliveryRoll,
        TotalApprovalTrail,
        DeliveryRemarks
    )
    SELECT
        DL.BuyerId,
        DL.JobId,
        DL.OrderId,
        DL.StyleId,
        DL.ColorId,

        MIN(DL.DeliveryDate),
        MAX(DL.DeliveryDate),

        SUM(DL.Qty),
        SUM(DL.RollCount),

        SUM(DL.ApprovalTrailQty),

        RM.RemarksOut

    FROM DeliveryLines DL

    CROSS APPLY
    (
        SELECT
            STUFF
            (
                (
                    SELECT DISTINCT
                        '; ' + X.Remarks

                    FROM DeliveryLines X

                    WHERE X.BuyerId = DL.BuyerId
                      AND X.JobId = DL.JobId
                      AND X.OrderId = DL.OrderId
                      AND X.StyleId = DL.StyleId
                      AND X.ColorId = DL.ColorId

                      AND X.Remarks IS NOT NULL
                      AND X.Remarks <> N''

                    FOR XML PATH(''), TYPE

                ).value('.', 'NVARCHAR(MAX)'),

                1,
                2,
                ''
            )
    ) RM (RemarksOut)

    GROUP BY
        DL.BuyerId,
        DL.JobId,
        DL.OrderId,
        DL.StyleId,
        DL.ColorId,
        RM.RemarksOut;


    /* ================================================================
       STEP 6   *** FIXED: cumulative through @ToDate, matching Receive ***
       QC AGGREGATION
       ================================================================ */

    CREATE TABLE #QCAgg
    (
        BuyerId       INT,
        JobId         INT,
        OrderId       INT,
        StyleId       INT,
        ColorId       INT,
        DressPartId   INT,
        TotalQCQty    DECIMAL(18, 2)
    );


    INSERT INTO #QCAgg
    (
        BuyerId,
        JobId,
        OrderId,
        StyleId,
        ColorId,
        DressPartId,
        TotalQCQty
    )
    SELECT
        M.BuyerId,
        M.JobId,
        M.OrderId,
        M.StyleId,
        M.ColorId,
        M.DressPartId,

        SUM(ISNULL(QSD.Qty, 0))

    FROM dbo.QC_Master M WITH (NOLOCK)

    INNER JOIN
    (
        SELECT DISTINCT
            BuyerId,
            JobId,
            OrderId,
            StyleId,
            ColorId,
            DressPartId

        FROM #FilteredReceive

    ) FR

        ON FR.BuyerId = M.BuyerId
       AND FR.JobId = M.JobId
       AND FR.OrderId = M.OrderId
       AND FR.StyleId = M.StyleId
       AND FR.ColorId = M.ColorId
       AND FR.DressPartId = M.DressPartId

    LEFT JOIN dbo.QC_SizeDetails QSD WITH (NOLOCK)
        ON QSD.MasterId = M.MasterId

    WHERE CAST(M.CreatedDate AS DATE) <= @ToDate   -- cumulative: no @FromDate lower bound

    GROUP BY
        M.BuyerId,
        M.JobId,
        M.OrderId,
        M.StyleId,
        M.ColorId,
        M.DressPartId;


    /* ================================================================
       STEP 7
       WASH STATUS   (unchanged - dynamic table/column discovery)
       ================================================================ */

    CREATE TABLE #WashStatusAgg
    (
        BuyerId       INT,
        JobId         INT,
        OrderId       INT,
        StyleId       INT,
        ColorId       INT,
        DressPartId   INT,
        WashStatus    NVARCHAR(100)
    );


    DECLARE @StatusTable NVARCHAR(261);
    DECLARE @StatusCol   NVARCHAR(128);
    DECLARE @BatchCol    NVARCHAR(128);
    DECLARE @DateCol     NVARCHAR(128);
    DECLARE @StatusSQL   NVARCHAR(MAX);


    SELECT TOP 1
        @StatusTable =
            QUOTENAME(t.TABLE_SCHEMA)
            + N'.'
            + QUOTENAME(t.TABLE_NAME)

    FROM INFORMATION_SCHEMA.TABLES t

    WHERE t.TABLE_CATALOG = DB_NAME()

      AND
      (
            (
                t.TABLE_SCHEMA = N'dbo'
                AND t.TABLE_NAME IN
                (
                    N'tbl_WashFloorStatus',
                    N'tbl_WashFloorStatusMaster',
                    N'tbl_FloorStatus',
                    N'WashFloorStatus',
                    N'tbl_WashBatchStatus',
                    N'tbl_WashBatchStatusMaster'
                )
            )

            OR t.TABLE_NAME LIKE N'%FloorStatus%'
            OR t.TABLE_NAME LIKE N'%WashStatus%'
            OR t.TABLE_NAME LIKE N'%WashBatchStatus%'
      )

    ORDER BY
        CASE t.TABLE_NAME

            WHEN N'tbl_WashFloorStatus'
                THEN 1

            WHEN N'tbl_WashFloorStatusMaster'
                THEN 2

            WHEN N'tbl_FloorStatus'
                THEN 3

            WHEN N'WashFloorStatus'
                THEN 4

            WHEN N'tbl_WashBatchStatus'
                THEN 5

            WHEN N'tbl_WashBatchStatusMaster'
                THEN 6

            ELSE 100

        END;


    IF @StatusTable IS NOT NULL
    BEGIN

        DECLARE @SchemaName NVARCHAR(128) =
            PARSENAME(@StatusTable, 2);

        DECLARE @TableName NVARCHAR(128) =
            PARSENAME(@StatusTable, 1);


        SELECT TOP 1
            @StatusCol = QUOTENAME(c.COLUMN_NAME)

        FROM INFORMATION_SCHEMA.COLUMNS c

        WHERE c.TABLE_SCHEMA = @SchemaName
          AND c.TABLE_NAME = @TableName

          AND c.COLUMN_NAME IN
          (
              N'Status',
              N'StatusName',
              N'WashStatus',
              N'FloorStatus',
              N'CurrentStatus'
          )

        ORDER BY
            CASE c.COLUMN_NAME

                WHEN N'Status'
                    THEN 1

                WHEN N'StatusName'
                    THEN 2

                WHEN N'WashStatus'
                    THEN 3

                WHEN N'FloorStatus'
                    THEN 4

                WHEN N'CurrentStatus'
                    THEN 5

                ELSE 100

            END;


        SELECT TOP 1
            @BatchCol = QUOTENAME(c.COLUMN_NAME)

        FROM INFORMATION_SCHEMA.COLUMNS c

        WHERE c.TABLE_SCHEMA = @SchemaName
          AND c.TABLE_NAME = @TableName

          AND c.COLUMN_NAME IN
          (
              N'BatchNo',
              N'AutoBatchNo',
              N'BatchNoText'
          )

        ORDER BY
            CASE c.COLUMN_NAME

                WHEN N'BatchNo'
                    THEN 1

                WHEN N'AutoBatchNo'
                    THEN 2

                WHEN N'BatchNoText'
                    THEN 3

                ELSE 100

            END;


        SELECT TOP 1
            @DateCol = QUOTENAME(c.COLUMN_NAME)

        FROM INFORMATION_SCHEMA.COLUMNS c

        WHERE c.TABLE_SCHEMA = @SchemaName
          AND c.TABLE_NAME = @TableName

          AND c.COLUMN_NAME IN
          (
              N'StatusDate',
              N'CreatedDate',
              N'EntryDate',
              N'TransactionDate'
          )

        ORDER BY
            CASE c.COLUMN_NAME

                WHEN N'StatusDate'
                    THEN 1

                WHEN N'CreatedDate'
                    THEN 2

                WHEN N'EntryDate'
                    THEN 3

                WHEN N'TransactionDate'
                    THEN 4

                ELSE 100

            END;


        IF @StatusCol IS NOT NULL
           AND @BatchCol IS NOT NULL
        BEGIN

            DECLARE @OrderByClause NVARCHAR(MAX);


            IF @DateCol IS NOT NULL
                SET @OrderByClause =
                    N'ORDER BY FS.' + @DateCol + N' DESC';

            ELSE
                SET @OrderByClause =
                    N'ORDER BY (SELECT NULL)';


            SET @StatusSQL = N'

                INSERT INTO #WashStatusAgg
                (
                    BuyerId,
                    JobId,
                    OrderId,
                    StyleId,
                    ColorId,
                    DressPartId,
                    WashStatus
                )

                SELECT
                    X.BuyerId,
                    X.JobId,
                    X.OrderId,
                    X.StyleId,
                    X.ColorId,
                    X.DressPartId,
                    X.WashStatus

                FROM
                (
                    SELECT
                        FR.BuyerId,
                        FR.JobId,
                        FR.OrderId,
                        FR.StyleId,
                        FR.ColorId,
                        FR.DressPartId,

                        FS.' + @StatusCol + N' AS WashStatus,

                        ROW_NUMBER() OVER
                        (
                            PARTITION BY
                                FR.BuyerId,
                                FR.JobId,
                                FR.OrderId,
                                FR.StyleId,
                                FR.ColorId,
                                FR.DressPartId

                            ' + @OrderByClause + N'
                        ) AS rn

                    FROM #FilteredReceive FR

                    INNER JOIN #BatchDim BD
                        ON BD.TrackingNo = FR.TrackingNo

                    INNER JOIN ' + @StatusTable + N' FS WITH (NOLOCK)
                        ON FS.' + @BatchCol + N' = BD.BatchNo
                ) X

                WHERE X.rn = 1;
            ';


            EXEC sp_executesql @StatusSQL;

        END;

    END;


    /* ================================================================
       FINAL RESULT   *** FIXED FORMULAS + OrderInfo JOIN ***
       @ViewType = 1 : GARMENTS / PCS
       ================================================================ */

    IF @ViewType = 1
    BEGIN

        SELECT

            /* Receive From */
            U.USCode AS [ReceiveFrom],

            /* Buyer */
            BU.BuyerName AS [Buyer],

            /* Job */
            J.JobInfo AS [Job],

            /* ========================================================
               IMPORTANT: see header comment - please re-confirm.

               D.StyleId -> tbl_BuyerReference.BuyerReferenceId
               D.OrderId -> tbl_StyleInformation.StyleId

               Therefore: StyleName = BuyerReferenceNo, OrderNo = StyleInfo
               ======================================================== */

            br.BuyerReferenceNo AS [Style],

            ISNULL(sty.StyleInfo, '') AS [Order],

            /* Color */
            IC.ItemColorName AS [Color],

            /* Dress Part */
            DP.PartName AS [DressPart],

            /* Wash */
            WT.WashType AS [WashType],

            /* Fabric */
            FC.FabricComposition AS [FabricComposition],

            /* GSM */
            GS.GSM AS [GSM],

            /* Fabric Consumption (still NULL until OrderQtyKg source is confirmed) */
            CASE
                WHEN OI.OrderQtyPcs IS NULL
                     OR OI.OrderQtyPcs = 0
                THEN NULL

                ELSE
                    CAST
                    (
                        OI.OrderQtyKg
                        /
                        (OI.OrderQtyPcs / 12.0)
                        AS DECIMAL(18, 2)
                    )
            END AS [FabricConPerDzn],

            /* Order Quantity (FIXED: sized/color/dresspart-level SizeQty sum) */
            OI.OrderQtyPcs AS [OrderQtyPcs],

            /* Shipment */
            GR.ShipmentDate AS [ShipmentDate],

            /* Receive Dates */
            GA.FirstReceiveDate AS [FirstReceiveDate],
            GA.LastReceiveDate AS [LastReceiveDate],

            /* Receive */
            GA.TotalReceiveQty AS [TotalReceiveQtyPcs],

            /* Receive Balance (BRD 5.2: OrderQtyPcs - TotalReceiveQty) */
            (
                ISNULL(OI.OrderQtyPcs, 0)
                - GA.TotalReceiveQty
            ) AS [ReceiveBalancePcs],

            /* Delivery Dates */
            DA.FirstDeliveryDate AS [FirstDeliveryDate],
            DA.LastDeliveryDate AS [LastDeliveryDate],

            /* Delivery */
            ISNULL(
                DA.TotalDeliveryQty,
                0
            ) AS [TotalDeliveryQtyPcs],

            /* Ready For Delivery (BRD 5.2: TotalQCQty - TotalDeliveryQty) */
            (
                ISNULL(QC.TotalQCQty, 0)
                - ISNULL(DA.TotalDeliveryQty, 0)
            ) AS [ReadyForDeliveryPcs],

            /* Approval Trail */
            ISNULL(
                DA.TotalApprovalTrail,
                0
            ) AS [ApprovalTrail],

            /* Delivery Balance (BRD 5.2: TotalReceiveQty - TotalDeliveryQty) */
            (
                GA.TotalReceiveQty
                - ISNULL(DA.TotalDeliveryQty, 0)
            ) AS [DeliveryBalanceQtyPcs],

            /* Wash Status */
            WS.WashStatus AS [WashStatus],

            /* Remarks */
            DA.DeliveryRemarks AS [Remarks]


        FROM #GroupAgg GA


        /* Window scope: only Buyer/Job/Order/Style/Color combos active
           inside the selected @FromDate-@ToDate range appear at all -
           see STEP 0B. GA's own totals stay life-to-date regardless. */
        INNER JOIN #WindowGroups WG

            ON WG.BuyerId = GA.BuyerId
           AND WG.JobId = GA.JobId
           AND WG.OrderId = GA.OrderId
           AND WG.StyleId = GA.StyleId
           AND WG.ColorId = GA.ColorId


        /* Representative Receive */
        LEFT JOIN #GroupRep GR

            ON GR.BuyerId = GA.BuyerId
           AND GR.JobId = GA.JobId
           AND GR.OrderId = GA.OrderId
           AND GR.StyleId = GA.StyleId
           AND GR.ColorId = GA.ColorId
           AND GR.DressPartId = GA.DressPartId


        /* Wash Type */
        LEFT JOIN #GroupWashType WT

            ON WT.BuyerId = GA.BuyerId
           AND WT.JobId = GA.JobId
           AND WT.OrderId = GA.OrderId
           AND WT.StyleId = GA.StyleId
           AND WT.ColorId = GA.ColorId
           AND WT.DressPartId = GA.DressPartId


        /* Delivery (matched on Buyer/Job/Order/Style/Color only - see STEP 5 note) */
        LEFT JOIN #DeliveryAgg DA

            ON DA.BuyerId = GA.BuyerId
           AND DA.JobId = GA.JobId
           AND DA.OrderId = GA.OrderId
           AND DA.StyleId = GA.StyleId
           AND DA.ColorId = GA.ColorId


        /* QC */
        LEFT JOIN #QCAgg QC

            ON QC.BuyerId = GA.BuyerId
           AND QC.JobId = GA.JobId
           AND QC.OrderId = GA.OrderId
           AND QC.StyleId = GA.StyleId
           AND QC.ColorId = GA.ColorId
           AND QC.DressPartId = GA.DressPartId


        /* Wash Status */
        LEFT JOIN #WashStatusAgg WS

            ON WS.BuyerId = GA.BuyerId
           AND WS.JobId = GA.JobId
           AND WS.OrderId = GA.OrderId
           AND WS.StyleId = GA.StyleId
           AND WS.ColorId = GA.ColorId
           AND WS.DressPartId = GA.DressPartId


        /* Fabric */
        LEFT JOIN #FabricComp FC
            ON FC.FabricationId = GR.FabricationId


        /* GSM */
        LEFT JOIN #GSMLookup GS
            ON GS.GSMId = GR.GSMId


        /* Order Info (matched on Buyer/Job/Order/Style/Color - see STEP 3 note) */
        LEFT JOIN #OrderInfo OI

            ON OI.BuyerId = GA.BuyerId
           AND OI.JobId = GA.JobId
           AND OI.OrderId = GA.OrderId
           AND OI.StyleId = GA.StyleId
           AND OI.ColorId = GA.ColorId


        /* Buyer */
        LEFT JOIN MerchandisingDB..tbl_BuyerInformation BU WITH (NOLOCK)
            ON BU.BuyerId = GA.BuyerId


        /* Job */
        LEFT JOIN MerchandisingDB..tbl_JobInfo J WITH (NOLOCK)
            ON J.JobNo = GA.JobId


        /* ============================================================
           CORRECT STYLE JOIN
           GA.StyleId = tbl_BuyerReference.BuyerReferenceId
           ============================================================ */
        LEFT JOIN MerchandisingDB..tbl_BuyerReference br WITH (NOLOCK)
            ON br.BuyerReferenceId = GA.StyleId


        /* ============================================================
           CORRECT ORDER JOIN
           GA.OrderId = tbl_StyleInformation.StyleId
           ============================================================ */
        LEFT JOIN MerchandisingDB..tbl_StyleInformation sty WITH (NOLOCK)
            ON sty.StyleId = GA.OrderId


        /* Color */
        LEFT JOIN SCM..tbl_ItemColor IC WITH (NOLOCK)
            ON IC.ICLEID = GA.ColorId


        /* Dress Part */
        LEFT JOIN MerchandisingDB..tbl_DressPart DP WITH (NOLOCK)
            ON DP.DressId = GA.DressPartId


        /* Receive From Unit */
        LEFT JOIN [DB-MASCOGROUP]..tblUnitInfo U WITH (NOLOCK)
            ON U.UnitId = GR.ReceiveFromUnitId


        ORDER BY
            GA.BuyerId,
            GA.JobId,
            GA.OrderId,
            GA.StyleId,
            GA.ColorId,
            GA.DressPartId;

    END


    /* ================================================================
       FINAL RESULT   *** FIXED: ReadyForDeliveryKg + OrderInfo JOIN ***
       @ViewType = 2 : FABRIC & CUTTING PARTS / KG
       ================================================================ */

    ELSE
    BEGIN

        SELECT

            /* Receive From */
            U.USCode AS [ReceiveFrom],

            /* Buyer */
            BU.BuyerName AS [Buyer],

            /* Job */
            J.JobInfo AS [Job],

            /* ========================================================
               CORRECT STYLE / ORDER MAPPING - see header comment
               ======================================================== */

            br.BuyerReferenceNo AS [Style],

            ISNULL(sty.StyleInfo, '') AS [Order],

            /* Color */
            IC.ItemColorName AS [Color],

            /* Dress Part */
            DP.PartName AS [DressPart],

            /* Wash */
            WT.WashType AS [WashType],

            /* Fabric Composition */
            FC.FabricComposition AS [FabricComposition],

            /* Batch / Lot */
            GBL.BatchLot AS [BatchLot],

            /* GSM */
            GS.GSM AS [GSM],

            /* Dia */
            DL.Dia AS [Dia],

            /* Order Qty (TODO-DBA: no confirmed Kg source yet -> NULL) */
            OI.OrderQtyKg AS [OrderQtyKg],

            /* Shipment */
            GR.ShipmentDate AS [ShipmentDate],

            /* Receive Dates */
            GA.FirstReceiveDate AS [FirstReceiveDate],
            GA.LastReceiveDate AS [LastReceiveDate],

            /* Receive Roll */
            GA.TotalReceiveRoll AS [TotalReceiveRoll],

            /* Receive Qty */
            GA.TotalReceiveQty AS [TotalReceiveQtyKg],

            /* Receive Balance (BRD 5.3: OrderQtyKg - TotalReceiveQtyKg) */
            (
                ISNULL(OI.OrderQtyKg, 0)
                -
                GA.TotalReceiveQty
            ) AS [ReceiveBalanceKg],

            /* Delivery Dates */
            DA.FirstDeliveryDate AS [FirstDeliveryDate],
            DA.LastDeliveryDate AS [LastDeliveryDate],

            /* Delivery Roll */
            ISNULL(
                DA.TotalDeliveryRoll,
                0
            ) AS [TotalDeliveryRoll],

            /* Delivery Qty */
            ISNULL(
                DA.TotalDeliveryQty,
                0
            ) AS [TotalDeliveryQtyKg],

            /* Ready For Delivery (BRD 5.3: TotalQCQty - TotalDeliveryQtyKg) */
            (
                ISNULL(QC.TotalQCQty, 0)
                -
                ISNULL(DA.TotalDeliveryQty, 0)
            ) AS [ReadyForDeliveryKg],

            /* Delivery Balance (BRD 5.3: TotalReceiveQtyKg - TotalDeliveryQtyKg) */
            (
                GA.TotalReceiveQty
                -
                ISNULL(DA.TotalDeliveryQty, 0)
            ) AS [DeliveryBalanceKg],

            /* Wash Status */
            WS.WashStatus AS [WashStatus],

            /* Remarks */
            DA.DeliveryRemarks AS [Remarks]


        FROM #GroupAgg GA


        /* Window scope: only Buyer/Job/Order/Style/Color combos active
           inside the selected @FromDate-@ToDate range appear at all -
           see STEP 0B. GA's own totals stay life-to-date regardless. */
        INNER JOIN #WindowGroups WG

            ON WG.BuyerId = GA.BuyerId
           AND WG.JobId = GA.JobId
           AND WG.OrderId = GA.OrderId
           AND WG.StyleId = GA.StyleId
           AND WG.ColorId = GA.ColorId


        /* Representative Receive */
        LEFT JOIN #GroupRep GR

            ON GR.BuyerId = GA.BuyerId
           AND GR.JobId = GA.JobId
           AND GR.OrderId = GA.OrderId
           AND GR.StyleId = GA.StyleId
           AND GR.ColorId = GA.ColorId
           AND GR.DressPartId = GA.DressPartId


        /* Wash Type */
        LEFT JOIN #GroupWashType WT

            ON WT.BuyerId = GA.BuyerId
           AND WT.JobId = GA.JobId
           AND WT.OrderId = GA.OrderId
           AND WT.StyleId = GA.StyleId
           AND WT.ColorId = GA.ColorId
           AND WT.DressPartId = GA.DressPartId


        /* Batch Lot */
        LEFT JOIN #GroupBatchLot GBL

            ON GBL.BuyerId = GA.BuyerId
           AND GBL.JobId = GA.JobId
           AND GBL.OrderId = GA.OrderId
           AND GBL.StyleId = GA.StyleId
           AND GBL.ColorId = GA.ColorId
           AND GBL.DressPartId = GA.DressPartId


        /* Delivery (matched on Buyer/Job/Order/Style/Color only - see STEP 5 note) */
        LEFT JOIN #DeliveryAgg DA

            ON DA.BuyerId = GA.BuyerId
           AND DA.JobId = GA.JobId
           AND DA.OrderId = GA.OrderId
           AND DA.StyleId = GA.StyleId
           AND DA.ColorId = GA.ColorId


        /* QC */
        LEFT JOIN #QCAgg QC

            ON QC.BuyerId = GA.BuyerId
           AND QC.JobId = GA.JobId
           AND QC.OrderId = GA.OrderId
           AND QC.StyleId = GA.StyleId
           AND QC.ColorId = GA.ColorId
           AND QC.DressPartId = GA.DressPartId


        /* Wash Status */
        LEFT JOIN #WashStatusAgg WS

            ON WS.BuyerId = GA.BuyerId
           AND WS.JobId = GA.JobId
           AND WS.OrderId = GA.OrderId
           AND WS.StyleId = GA.StyleId
           AND WS.ColorId = GA.ColorId
           AND WS.DressPartId = GA.DressPartId


        /* Fabric */
        LEFT JOIN #FabricComp FC
            ON FC.FabricationId = GR.FabricationId


        /* GSM */
        LEFT JOIN #GSMLookup GS
            ON GS.GSMId = GR.GSMId


        /* Dia */
        LEFT JOIN #DiaLookup DL
            ON DL.FabricationId = GR.FabricationId


        /* Order Info (matched on Buyer/Job/Order/Style/Color - see STEP 3 note) */
        LEFT JOIN #OrderInfo OI

            ON OI.BuyerId = GA.BuyerId
           AND OI.JobId = GA.JobId
           AND OI.OrderId = GA.OrderId
           AND OI.StyleId = GA.StyleId
           AND OI.ColorId = GA.ColorId


        /* Buyer */
        LEFT JOIN MerchandisingDB..tbl_BuyerInformation BU WITH (NOLOCK)
            ON BU.BuyerId = GA.BuyerId


        /* Job */
        LEFT JOIN MerchandisingDB..tbl_JobInfo J WITH (NOLOCK)
            ON J.JobNo = GA.JobId


        /* ============================================================
           CORRECT STYLE JOIN
           ============================================================ */
        LEFT JOIN MerchandisingDB..tbl_BuyerReference br WITH (NOLOCK)
            ON br.BuyerReferenceId = GA.StyleId


        /* ============================================================
           CORRECT ORDER JOIN
           ============================================================ */
        LEFT JOIN MerchandisingDB..tbl_StyleInformation sty WITH (NOLOCK)
            ON sty.StyleId = GA.OrderId


        /* Color */
        LEFT JOIN SCM..tbl_ItemColor IC WITH (NOLOCK)
            ON IC.ICLEID = GA.ColorId


        /* Dress Part */
        LEFT JOIN MerchandisingDB..tbl_DressPart DP WITH (NOLOCK)
            ON DP.DressId = GA.DressPartId


        /* Receive From */
        LEFT JOIN [DB-MASCOGROUP]..tblUnitInfo U WITH (NOLOCK)
            ON U.UnitId = GR.ReceiveFromUnitId


        ORDER BY
            GA.BuyerId,
            GA.JobId,
            GA.OrderId,
            GA.StyleId,
            GA.ColorId,
            GA.DressPartId;

    END;


    /* ================================================================
       CLEANUP
       ================================================================ */

    IF OBJECT_ID('tempdb..#FilteredReceive') IS NOT NULL
        DROP TABLE #FilteredReceive;

    IF OBJECT_ID('tempdb..#WindowGroups') IS NOT NULL
        DROP TABLE #WindowGroups;

    IF OBJECT_ID('tempdb..#BatchDim') IS NOT NULL
        DROP TABLE #BatchDim;

    IF OBJECT_ID('tempdb..#WashCategoryByBatch') IS NOT NULL
        DROP TABLE #WashCategoryByBatch;

    IF OBJECT_ID('tempdb..#FabricComp') IS NOT NULL
        DROP TABLE #FabricComp;

    IF OBJECT_ID('tempdb..#GSMLookup') IS NOT NULL
        DROP TABLE #GSMLookup;

    IF OBJECT_ID('tempdb..#DiaLookup') IS NOT NULL
        DROP TABLE #DiaLookup;

    IF OBJECT_ID('tempdb..#OrderInfo') IS NOT NULL
        DROP TABLE #OrderInfo;

    IF OBJECT_ID('tempdb..#GroupAgg') IS NOT NULL
        DROP TABLE #GroupAgg;

    IF OBJECT_ID('tempdb..#GroupRep') IS NOT NULL
        DROP TABLE #GroupRep;

    IF OBJECT_ID('tempdb..#GroupWashType') IS NOT NULL
        DROP TABLE #GroupWashType;

    IF OBJECT_ID('tempdb..#GroupBatchLot') IS NOT NULL
        DROP TABLE #GroupBatchLot;

    IF OBJECT_ID('tempdb..#DeliveryAgg') IS NOT NULL
        DROP TABLE #DeliveryAgg;

    IF OBJECT_ID('tempdb..#QCAgg') IS NOT NULL
        DROP TABLE #QCAgg;

    IF OBJECT_ID('tempdb..#WashStatusAgg') IS NOT NULL
        DROP TABLE #WashStatusAgg;

END;
GO
