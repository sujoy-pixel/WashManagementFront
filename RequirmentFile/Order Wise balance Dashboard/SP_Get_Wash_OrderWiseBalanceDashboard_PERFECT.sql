-- ============================================================================
-- OBJECT : [dbo].[SP_Get_Wash_OrderWiseBalanceDashboard] -- SIMPLE + READABLE
-- REQ    : BRD Order-wise Balance Dashboard (Fabric & Garments) v1.0 30-Aug-2026
-- UI     : @ViewType comes from UI radio: 1 = Garments (Pcs), 2 = Fabric (Kg)
-- GRAIN  : one row per (Buyer, Job, Order, Style, Color, DressPart) (FR-1.2)
-- FORMULAS (BRD 5.2 / 5.3):
--   ReceiveBalance   = OrderQty        - TotalReceiveQty
--   ReadyForDelivery = TotalQCQty      - TotalDeliveryQty
--   DeliveryBalance  = TotalReceiveQty - TotalDeliveryQty
--   FabricConPerDzn  = OrderQtyKg / (OrderQtyPcs / 12.0), NULL when Pcs = 0/NULL
-- DISPLAY SWAP (matches V1 + StyleWise SPs):
--   [Order] = BuyerReferenceNo (via Receive.StyleId)
--   [Style] = StyleInfo        (via Receive.OrderId)
-- TODO for DBA (safe defaults until confirmed, search "TODO-DBA"):
--   1. Order Kg column in MerchandisingDB..tbl_OrderInformation
--   2. Dia (fabric width) source  |  3. Receive/Delivery Roll source
--   4. ApprovalTrailQty column in GatePassDB dispatch details
--   5. Floor-status table for WashStatus (none in script.sql)
-- ============================================================================
CREATE OR ALTER PROCEDURE [dbo].[SP_Get_Wash_OrderWiseBalanceDashboard]
(
    @UnitId            INT,
    @FromDate          DATE,
    @ToDate            DATE,
    @ViewType          TINYINT = 1    -- 1 = Garments (Pcs), 2 = Fabric (Kg)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- ---- Validation (ViewType comes from UI; any other value -> 1) ----
    IF @UnitId IS NULL OR @FromDate IS NULL OR @ToDate IS NULL
    BEGIN
        RAISERROR('SP_Get_Wash_OrderWiseBalanceDashboard: @UnitId, @FromDate and @ToDate are mandatory.', 16, 1);
        RETURN;
    END;
    IF @FromDate > @ToDate
    BEGIN
        RAISERROR('SP_Get_Wash_OrderWiseBalanceDashboard: @FromDate cannot be after @ToDate.', 16, 1);
        RETURN;
    END;
    IF @ViewType NOT IN (1, 2)
        SET @ViewType = 1;

    -- ---- STEP 0: Receive rows. Unit + Date filter HERE ONLY (FR-1.3).
    -- M.UnitId    = wash unit running the dashboard (mandatory).
    -- D.FromUnitId = source unit shown as [ReceiveFrom] (dimension only).
    -- ReceiveDate  = CAST(M.CreateDate AS DATE), like all existing SPs.
    CREATE TABLE #FilteredReceive
    (
        TrackingNo    NVARCHAR(50),
        ReceiveDate   DATE,
        FromUnitId    INT,
        BuyerId       INT,
        JobId         INT,
        OrderId       INT,
        StyleId       INT,
        ColorId       INT,
        DressPartId   INT,
        FabricationId INT,
        GSMId         INT,
        ReceiveQty    DECIMAL(18, 2),
        ShipmentDate  DATE
    );

    INSERT INTO #FilteredReceive
        (TrackingNo, ReceiveDate, FromUnitId, BuyerId, JobId, OrderId, StyleId,
         ColorId, DressPartId, FabricationId, GSMId, ReceiveQty, ShipmentDate)
    SELECT
        D.TrackingBatchNo,
        CAST(M.CreateDate AS DATE),
        D.FromUnitId,
        D.BuyerId, D.JobId, D.OrderId, D.StyleId, D.ColorId, D.DressPartId,
        D.FabricationId, D.GSMId,
        D.TotalQty,
        D.ShipmentDate
    FROM [dbo].[tbl_Wash_Order_Raceive_Operation_Details] D WITH (NOLOCK)
    INNER JOIN [dbo].[tbl_Wash_Order_Raceive_Operation_Master] M WITH (NOLOCK)
        ON M.MasterId = D.MasterId AND M.IsActive = 1
    WHERE M.UnitId = @UnitId
      AND CAST(M.CreateDate AS DATE) BETWEEN @FromDate AND @ToDate;

        -- Empty filter result -> return empty typed grid (UI shows "No data found").
    IF NOT EXISTS (SELECT 1 FROM #FilteredReceive)
    BEGIN
        IF @ViewType = 1
        BEGIN
            SELECT TOP 0
                CAST(NULL AS VARCHAR(10))      AS [ReceiveFrom], CAST(NULL AS NVARCHAR(200))  AS [Buyer],
                CAST(NULL AS NVARCHAR(100))    AS [Job], CAST(NULL AS NVARCHAR(100)) AS [Order],
                CAST(NULL AS NVARCHAR(100))    AS [Style], CAST(NULL AS NVARCHAR(100)) AS [Color],
                CAST(NULL AS NVARCHAR(100))    AS [DressPart], CAST(NULL AS NVARCHAR(500)) AS [WashType],
                CAST(NULL AS NVARCHAR(500))    AS [FabricComposition], CAST(NULL AS NVARCHAR(100)) AS [GSM],
                CAST(NULL AS DECIMAL(18,2))    AS [FabricConPerDzn], CAST(NULL AS DECIMAL(18,2)) AS [OrderQtyPcs],
                CAST(NULL AS DATE)             AS [ShipmentDate], CAST(NULL AS DATE) AS [FirstReceiveDate],
                CAST(NULL AS DATE)             AS [LastReceiveDate], CAST(NULL AS DECIMAL(18,2)) AS [TotalReceiveQtyPcs],
                CAST(NULL AS DECIMAL(18,2))    AS [ReceiveBalancePcs], CAST(NULL AS DATE) AS [FirstDeliveryDate],
                CAST(NULL AS DATE)             AS [LastDeliveryDate], CAST(NULL AS DECIMAL(18,2)) AS [TotalDeliveryQtyPcs],
                CAST(NULL AS DECIMAL(18,2))    AS [ReadyForDeliveryPcs], CAST(NULL AS DECIMAL(18,2)) AS [ApprovalTrail],
                CAST(NULL AS DECIMAL(18,2))    AS [DeliveryBalanceQtyPcs], CAST(NULL AS NVARCHAR(100)) AS [WashStatus],
                CAST(NULL AS NVARCHAR(2000))   AS [Remarks];
        END
        ELSE
        BEGIN
            SELECT TOP 0
                CAST(NULL AS VARCHAR(10))      AS [ReceiveFrom], CAST(NULL AS NVARCHAR(200))  AS [Buyer],
                CAST(NULL AS NVARCHAR(100))    AS [Job], CAST(NULL AS NVARCHAR(100)) AS [Order],
                CAST(NULL AS NVARCHAR(100))    AS [Style], CAST(NULL AS NVARCHAR(100)) AS [Color],
                CAST(NULL AS NVARCHAR(100))    AS [DressPart], CAST(NULL AS NVARCHAR(500)) AS [WashType],
                CAST(NULL AS NVARCHAR(500))    AS [FabricComposition], CAST(NULL AS NVARCHAR(1000)) AS [BatchLot],
                CAST(NULL AS NVARCHAR(100))    AS [GSM], CAST(NULL AS INT) AS [Dia],
                CAST(NULL AS DECIMAL(18,2))    AS [OrderQtyKg], CAST(NULL AS DATE) AS [ShipmentDate],
                CAST(NULL AS DATE)             AS [FirstReceiveDate], CAST(NULL AS DATE) AS [LastReceiveDate],
                CAST(NULL AS INT)              AS [TotalReceiveRoll], CAST(NULL AS DECIMAL(18,2)) AS [TotalReceiveQtyKg],
                CAST(NULL AS DECIMAL(18,2))    AS [ReceiveBalanceKg], CAST(NULL AS DATE) AS [FirstDeliveryDate],
                CAST(NULL AS DATE)             AS [LastDeliveryDate], CAST(NULL AS INT) AS [TotalDeliveryRoll],
                CAST(NULL AS DECIMAL(18,2))    AS [TotalDeliveryQtyKg], CAST(NULL AS DECIMAL(18,2)) AS [ReadyForDeliveryKg],
                CAST(NULL AS DECIMAL(18,2))    AS [DeliveryBalanceKg], CAST(NULL AS NVARCHAR(100)) AS [WashStatus],
                CAST(NULL AS NVARCHAR(2000))   AS [Remarks];
        END;
        RETURN;
    END;

    -- ---- STEP 1: Batch + WashType.
    -- TrackingBatchNo -> WashBatchPrepareMaster.AutoBatchNo -> ProcessIds
    -- -> tbl_ProcessNameEntry.ProcessName (comma-separated per batch).
    CREATE TABLE #BatchDim (TrackingNo NVARCHAR(50), BatchNo NVARCHAR(50));

    INSERT INTO #BatchDim (TrackingNo, BatchNo)
    SELECT DISTINCT FR.TrackingNo, WBPM.AutoBatchNo
    FROM #FilteredReceive FR
    INNER JOIN [dbo].[WashBatchPrepareMaster] WBPM WITH (NOLOCK)
        ON WBPM.TackingBatchNo = FR.TrackingNo;

    CREATE TABLE #WashCategoryByBatch (BatchNo NVARCHAR(50), WashType NVARCHAR(500));

    INSERT INTO #WashCategoryByBatch (BatchNo, WashType)
    SELECT
        WC.BatchNo,
        STUFF((
            SELECT DISTINCT ', ' + PNE.ProcessName
            FROM [dbo].[WashBatchPrepareMaster] WBPM WITH (NOLOCK)
            CROSS APPLY [dbo].[SplitString](WBPM.ProcessIds, ',') SP
            INNER JOIN [dbo].[tbl_ProcessNameEntry] PNE WITH (NOLOCK)
                ON PNE.ProcessId = TRY_CAST(SP.Value AS INT)
            WHERE WBPM.ProcessIds IS NOT NULL AND WBPM.ProcessIds <> ''
              AND WBPM.AutoBatchNo = WC.BatchNo
            FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 2, '')
    FROM (SELECT DISTINCT BatchNo FROM #BatchDim) WC;

    -- STEP 2: simple lookups (Fabric, GSM).
    -- TODO-DBA: Dia source unknown -> 0. Roll source unknown -> 0.
    CREATE TABLE #FabricComp (FabricationId INT, FabricComposition NVARCHAR(500));
    INSERT INTO #FabricComp (FabricationId, FabricComposition)
    SELECT DISTINCT FR.FabricationId, I.ItemName
    FROM #FilteredReceive FR
    INNER JOIN SCM..tbl_Item I WITH (NOLOCK) ON I.ITEMID = FR.FabricationId;
    CREATE TABLE #GSMLookup (GSMId INT, GSM NVARCHAR(100));
    INSERT INTO #GSMLookup (GSMId, GSM)
    SELECT DISTINCT FR.GSMId, ISZ.ItemSizeName
    FROM #FilteredReceive FR
    INNER JOIN SCM..tbl_ItemSize ISZ WITH (NOLOCK) ON ISZ.ISZID = FR.GSMId;
    CREATE TABLE #DiaLookup (FabricationId INT, Dia INT);
    INSERT INTO #DiaLookup (FabricationId, Dia)
    SELECT DISTINCT FabricationId, 0 FROM #FilteredReceive;
    -- STEP 3: Order Qty Pcs from Merchandising (SUM, grouped grain).
    -- TODO-DBA: Kg column unconfirmed -> OrderQtyKg = NULL (NULL-safe).
    CREATE TABLE #OrderInfo (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     OrderQtyPcs DECIMAL(18,2), OrderQtyKg DECIMAL(18,2));
    INSERT INTO #OrderInfo (BuyerId, JobId, OrderId, StyleId, OrderQtyPcs, OrderQtyKg)
    SELECT FR.BuyerId, FR.JobId, FR.OrderId, FR.StyleId,
     SUM(TRY_CAST(OI.TotalQty AS DECIMAL(18,2))), CAST(NULL AS DECIMAL(18,2))
    FROM (SELECT DISTINCT BuyerId, JobId, OrderId, StyleId FROM #FilteredReceive) FR
    INNER JOIN MerchandisingDB..tbl_OrderInformation OI WITH (NOLOCK)
     ON OI.BuyerId = FR.BuyerId AND OI.BuyerReferenceId = FR.OrderId
     AND OI.JobNo = FR.JobId AND OI.StyleId = FR.StyleId
    GROUP BY FR.BuyerId, FR.JobId, FR.OrderId, FR.StyleId;

    -- STEP 4: group receive totals at BRD grain FR-1.2.
    CREATE TABLE #GroupAgg (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, FirstReceiveDate DATE, LastReceiveDate DATE,
     TotalReceiveQty DECIMAL(18,2), TotalReceiveRoll INT);
    INSERT INTO #GroupAgg
     (BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId,
      FirstReceiveDate, LastReceiveDate, TotalReceiveQty, TotalReceiveRoll)
    SELECT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId,
     MIN(ReceiveDate), MAX(ReceiveDate), SUM(ReceiveQty), 0
    FROM #FilteredReceive
    GROUP BY BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId;
    -- Representative receive row per group (latest) for text fields.
    CREATE TABLE #GroupRep (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, FabricationId INT, GSMId INT,
     ShipmentDate DATE, ReceiveFromUnitId INT);
    INSERT INTO #GroupRep
     (BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId,
      FabricationId, GSMId, ShipmentDate, ReceiveFromUnitId)
    SELECT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId,
     FabricationId, GSMId, ShipmentDate, FromUnitId
    FROM (SELECT FR.*,
     ROW_NUMBER() OVER (PARTITION BY BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId
     ORDER BY ReceiveDate DESC, TrackingNo DESC) AS rn
     FROM #FilteredReceive FR) X WHERE X.rn = 1;
    -- WashType per group: every batch touching the group.
    CREATE TABLE #GroupWashType (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, WashType NVARCHAR(500));
    INSERT INTO #GroupWashType (BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId, WashType)
    SELECT X.BuyerId, X.JobId, X.OrderId, X.StyleId, X.ColorId, X.DressPartId,
     STUFF((SELECT DISTINCT ', ' + WC.WashType
      FROM #FilteredReceive FR2
      INNER JOIN #BatchDim BD2 ON BD2.TrackingNo = FR2.TrackingNo
      INNER JOIN #WashCategoryByBatch WC ON WC.BatchNo = BD2.BatchNo
      WHERE FR2.BuyerId = X.BuyerId AND FR2.JobId = X.JobId AND FR2.OrderId = X.OrderId
      AND FR2.StyleId = X.StyleId AND FR2.ColorId = X.ColorId AND FR2.DressPartId = X.DressPartId
      AND WC.WashType IS NOT NULL AND WC.WashType <> N''
      FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '')
    FROM (SELECT DISTINCT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId FROM #FilteredReceive) X;
    -- BatchLot per group (Fabric view).
    CREATE TABLE #GroupBatchLot (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, BatchLot NVARCHAR(1000));
    INSERT INTO #GroupBatchLot (BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId, BatchLot)
    SELECT X.BuyerId, X.JobId, X.OrderId, X.StyleId, X.ColorId, X.DressPartId,
     STUFF((SELECT DISTINCT ', ' + BD2.BatchNo
      FROM #FilteredReceive FR2
      INNER JOIN #BatchDim BD2 ON BD2.TrackingNo = FR2.TrackingNo
      WHERE FR2.BuyerId = X.BuyerId AND FR2.JobId = X.JobId AND FR2.OrderId = X.OrderId
      AND FR2.StyleId = X.StyleId AND FR2.ColorId = X.ColorId AND FR2.DressPartId = X.DressPartId
      AND BD2.BatchNo IS NOT NULL AND BD2.BatchNo <> N''
      FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '')
    FROM (SELECT DISTINCT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId FROM #FilteredReceive) X;

    -- STEP 5: Delivery from GatePassDB (plain T-SQL, no dynamic SQL).
    -- Qty/RollCount are NVARCHAR -> TRY_CAST first (fixes Msg 8117).
    -- Match: TrackingNo + cast Buyer/Job/Order/Style + Color + DressPart.
    -- TODO-DBA: ApprovalTrail column unconfirmed -> 0 for now.
    CREATE TABLE #DeliveryLines (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, DeliveryDate DATE,
     Qty DECIMAL(18,2), RollCount INT, Remarks NVARCHAR(500));
    INSERT INTO #DeliveryLines
     (BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId, DeliveryDate, Qty, RollCount, Remarks)
    SELECT FR.BuyerId, FR.JobId, FR.OrderId, FR.StyleId, FR.ColorId, FR.DressPartId,
     CAST(DM.CreatedDate AS DATE),
     ISNULL(TRY_CAST(DD.Qty AS DECIMAL(18,2)), 0),
     ISNULL(TRY_CAST(DD.RollCount AS INT), 0),
     DD.Remarks
    FROM [GatePassDB]..[tbl_DispatchSlipGenerationDetails] DD WITH (NOLOCK)
    INNER JOIN [GatePassDB]..[tbl_DispatchSlipGenerationMaster] DM WITH (NOLOCK)
     ON DM.DispatchSlipGenerationId = DD.DispatchSlipGenerationId
    INNER JOIN (SELECT DISTINCT TrackingNo, BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId
     FROM #FilteredReceive) FR
     ON FR.TrackingNo = DD.TrackingNo
     AND TRY_CAST(DD.BuyerNo AS INT) = FR.BuyerId
     AND TRY_CAST(DD.JobNo AS INT) = FR.JobId
     AND TRY_CAST(DD.OrderNo AS INT) = FR.OrderId
     AND TRY_CAST(DD.StyleNo AS INT) = FR.StyleId
     AND DD.ICLEID = FR.ColorId AND DD.DressPartId = FR.DressPartId;
    CREATE TABLE #DeliveryAgg (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, FirstDeliveryDate DATE, LastDeliveryDate DATE,
     TotalDeliveryQty DECIMAL(18,2), TotalDeliveryRoll INT,
     TotalApprovalTrail DECIMAL(18,2), DeliveryRemarks NVARCHAR(2000));
    INSERT INTO #DeliveryAgg
     (BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId,
      FirstDeliveryDate, LastDeliveryDate, TotalDeliveryQty, TotalDeliveryRoll,
      TotalApprovalTrail, DeliveryRemarks)
    SELECT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId,
     MIN(DeliveryDate), MAX(DeliveryDate),
     SUM(Qty), SUM(RollCount), CAST(0 AS DECIMAL(18,2)), NULL
    FROM #DeliveryLines
    GROUP BY BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId;
    -- Remarks per group: one row-safe update (no CROSS APPLY self-ref).
    UPDATE DA SET DeliveryRemarks = R.RemarksOut
    FROM #DeliveryAgg DA
    LEFT JOIN (SELECT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId,
     STUFF((SELECT DISTINCT '; ' + X.Remarks FROM #DeliveryLines X
      WHERE X.BuyerId = DL.BuyerId AND X.JobId = DL.JobId AND X.OrderId = DL.OrderId
      AND X.StyleId = DL.StyleId AND X.ColorId = DL.ColorId AND X.DressPartId = DL.DressPartId
      AND X.Remarks IS NOT NULL AND LTRIM(RTRIM(X.Remarks)) <> ''
      FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS RemarksOut
     FROM (SELECT DISTINCT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId
      FROM #DeliveryLines) DL) R
     ON R.BuyerId = DA.BuyerId AND R.JobId = DA.JobId AND R.OrderId = DA.OrderId
     AND R.StyleId = DA.StyleId AND R.ColorId = DA.ColorId AND R.DressPartId = DA.DressPartId;

    -- STEP 6: Total QC Qty = SUM(QC_SizeDetails.Qty) per group (Pcs).
    CREATE TABLE #QCAgg (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, TotalQCQty DECIMAL(18,2));
    INSERT INTO #QCAgg (BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId, TotalQCQty)
    SELECT M.BuyerId, M.JobId, M.OrderId, M.StyleId, M.ColorId, M.DressPartId,
     SUM(ISNULL(TRY_CAST(QSD.Qty AS DECIMAL(18,2)), 0))
    FROM [dbo].[QC_Master] M WITH (NOLOCK)
    INNER JOIN (SELECT DISTINCT BuyerId, JobId, OrderId, StyleId, ColorId, DressPartId
     FROM #FilteredReceive) FR
     ON FR.BuyerId = M.BuyerId AND FR.JobId = M.JobId AND FR.OrderId = M.OrderId
     AND FR.StyleId = M.StyleId AND FR.ColorId = M.ColorId AND FR.DressPartId = M.DressPartId
    LEFT JOIN [dbo].[QC_SizeDetails] QSD WITH (NOLOCK) ON QSD.MasterId = M.MasterId
    WHERE TRY_CAST(M.CreatedDate AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY M.BuyerId, M.JobId, M.OrderId, M.StyleId, M.ColorId, M.DressPartId;
    -- STEP 7: WashStatus. No floor-status table in script.sql -> NULL for now.
    -- TODO-DBA: give me the real status table + columns and I will wire latest-status here.
    CREATE TABLE #WashStatusAgg (BuyerId INT, JobId INT, OrderId INT, StyleId INT,
     ColorId INT, DressPartId INT, WashStatus NVARCHAR(100));

    -- FINAL Garments Pcs for UI 1 (formulas BRD 5.2).
    IF @ViewType = 1
    BEGIN
        SELECT U.USCode AS [ReceiveFrom], BU.BuyerName AS [Buyer], J.JobInfo AS [Job],
         BR.BuyerReferenceNo AS [Order], STY.StyleInfo AS [Style],
         IC.ItemColorName AS [Color], DP.PartName AS [DressPart],
         WT.WashType AS [WashType], FC.FabricComposition AS [FabricComposition],
         GS.GSM AS [GSM],
         CASE WHEN OI.OrderQtyPcs IS NULL OR OI.OrderQtyPcs = 0 THEN NULL
          ELSE CAST(ISNULL(OI.OrderQtyKg, 0) / (OI.OrderQtyPcs / 12.0) AS DECIMAL(18,2)) END AS [FabricConPerDzn],
         OI.OrderQtyPcs AS [OrderQtyPcs], GR.ShipmentDate AS [ShipmentDate],
         GA.FirstReceiveDate AS [FirstReceiveDate], GA.LastReceiveDate AS [LastReceiveDate],
         GA.TotalReceiveQty AS [TotalReceiveQtyPcs],
         (ISNULL(OI.OrderQtyPcs, 0) - GA.TotalReceiveQty) AS [ReceiveBalancePcs],
         DA.FirstDeliveryDate AS [FirstDeliveryDate], DA.LastDeliveryDate AS [LastDeliveryDate],
         ISNULL(DA.TotalDeliveryQty, 0) AS [TotalDeliveryQtyPcs],
         (ISNULL(QC.TotalQCQty, 0) - ISNULL(DA.TotalDeliveryQty, 0)) AS [ReadyForDeliveryPcs],
         ISNULL(DA.TotalApprovalTrail, 0) AS [ApprovalTrail],
         (GA.TotalReceiveQty - ISNULL(DA.TotalDeliveryQty, 0)) AS [DeliveryBalanceQtyPcs],
         WS.WashStatus AS [WashStatus], DA.DeliveryRemarks AS [Remarks]
        FROM #GroupAgg GA
        LEFT JOIN #GroupRep GR ON GR.BuyerId = GA.BuyerId AND GR.JobId = GA.JobId
         AND GR.OrderId = GA.OrderId AND GR.StyleId = GA.StyleId
         AND GR.ColorId = GA.ColorId AND GR.DressPartId = GA.DressPartId
        LEFT JOIN #GroupWashType WT ON WT.BuyerId = GA.BuyerId AND WT.JobId = GA.JobId
         AND WT.OrderId = GA.OrderId AND WT.StyleId = GA.StyleId
         AND WT.ColorId = GA.ColorId AND WT.DressPartId = GA.DressPartId
        LEFT JOIN #DeliveryAgg DA ON DA.BuyerId = GA.BuyerId AND DA.JobId = GA.JobId
         AND DA.OrderId = GA.OrderId AND DA.StyleId = GA.StyleId
         AND DA.ColorId = GA.ColorId AND DA.DressPartId = GA.DressPartId
        LEFT JOIN #QCAgg QC ON QC.BuyerId = GA.BuyerId AND QC.JobId = GA.JobId
         AND QC.OrderId = GA.OrderId AND QC.StyleId = GA.StyleId
         AND QC.ColorId = GA.ColorId AND QC.DressPartId = GA.DressPartId
        LEFT JOIN #WashStatusAgg WS ON WS.BuyerId = GA.BuyerId AND WS.JobId = GA.JobId
         AND WS.OrderId = GA.OrderId AND WS.StyleId = GA.StyleId
         AND WS.ColorId = GA.ColorId AND WS.DressPartId = GA.DressPartId
        LEFT JOIN #FabricComp FC ON FC.FabricationId = GR.FabricationId
        LEFT JOIN #GSMLookup GS ON GS.GSMId = GR.GSMId
        LEFT JOIN #OrderInfo OI ON OI.BuyerId = GA.BuyerId AND OI.JobId = GA.JobId
         AND OI.OrderId = GA.OrderId AND OI.StyleId = GA.StyleId
        LEFT JOIN MerchandisingDB..tbl_BuyerInformation BU WITH (NOLOCK) ON BU.BuyerId = GA.BuyerId
        LEFT JOIN MerchandisingDB..tbl_JobInfo J WITH (NOLOCK) ON J.JobNo = GA.JobId
        LEFT JOIN MerchandisingDB..tbl_StyleInformation STY WITH (NOLOCK) ON STY.StyleId = GA.OrderId
        LEFT JOIN MerchandisingDB..tbl_BuyerReference BR WITH (NOLOCK) ON BR.BuyerReferenceId = GA.StyleId
        LEFT JOIN scm..tbl_ItemColor IC WITH (NOLOCK) ON IC.ICLEID = GA.ColorId
        LEFT JOIN MerchandisingDB..tbl_DressPart DP WITH (NOLOCK) ON DP.DressId = GA.DressPartId
        LEFT JOIN [DB-MASCOGROUP]..tblUnitInfo U WITH (NOLOCK) ON U.UnitId = GR.ReceiveFromUnitId
        ORDER BY GA.BuyerId, GA.JobId, GA.OrderId, GA.StyleId, GA.ColorId, GA.DressPartId;
    END;

    -- FINAL Fabric Kg for UI 2 (formulas BRD 5.3) + cleanup.
    ELSE
    BEGIN
        SELECT U.USCode AS [ReceiveFrom], BU.BuyerName AS [Buyer], J.JobInfo AS [Job],
         BR.BuyerReferenceNo AS [Order], STY.StyleInfo AS [Style],
         IC.ItemColorName AS [Color], DP.PartName AS [DressPart],
         WT.WashType AS [WashType], FC.FabricComposition AS [FabricComposition],
         GBL.BatchLot AS [BatchLot], GS.GSM AS [GSM], DL.Dia AS [Dia],
         OI.OrderQtyKg AS [OrderQtyKg], GR.ShipmentDate AS [ShipmentDate],
         GA.FirstReceiveDate AS [FirstReceiveDate], GA.LastReceiveDate AS [LastReceiveDate],
         GA.TotalReceiveRoll AS [TotalReceiveRoll], GA.TotalReceiveQty AS [TotalReceiveQtyKg],
         (ISNULL(OI.OrderQtyKg, 0) - GA.TotalReceiveQty) AS [ReceiveBalanceKg],
         DA.FirstDeliveryDate AS [FirstDeliveryDate], DA.LastDeliveryDate AS [LastDeliveryDate],
         ISNULL(DA.TotalDeliveryRoll, 0) AS [TotalDeliveryRoll],
         ISNULL(DA.TotalDeliveryQty, 0) AS [TotalDeliveryQtyKg],
         (ISNULL(QC.TotalQCQty, 0) - ISNULL(DA.TotalDeliveryQty, 0)) AS [ReadyForDeliveryKg],
         (GA.TotalReceiveQty - ISNULL(DA.TotalDeliveryQty, 0)) AS [DeliveryBalanceKg],
         WS.WashStatus AS [WashStatus], DA.DeliveryRemarks AS [Remarks]
        FROM #GroupAgg GA
        LEFT JOIN #GroupRep GR ON GR.BuyerId = GA.BuyerId AND GR.JobId = GA.JobId
         AND GR.OrderId = GA.OrderId AND GR.StyleId = GA.StyleId
         AND GR.ColorId = GA.ColorId AND GR.DressPartId = GA.DressPartId
        LEFT JOIN #GroupWashType WT ON WT.BuyerId = GA.BuyerId AND WT.JobId = GA.JobId
         AND WT.OrderId = GA.OrderId AND WT.StyleId = GA.StyleId
         AND WT.ColorId = GA.ColorId AND WT.DressPartId = GA.DressPartId
        LEFT JOIN #GroupBatchLot GBL ON GBL.BuyerId = GA.BuyerId AND GBL.JobId = GA.JobId
         AND GBL.OrderId = GA.OrderId AND GBL.StyleId = GA.StyleId
         AND GBL.ColorId = GA.ColorId AND GBL.DressPartId = GA.DressPartId
        LEFT JOIN #DeliveryAgg DA ON DA.BuyerId = GA.BuyerId AND DA.JobId = GA.JobId
         AND DA.OrderId = GA.OrderId AND DA.StyleId = GA.StyleId
         AND DA.ColorId = GA.ColorId AND DA.DressPartId = GA.DressPartId
        LEFT JOIN #QCAgg QC ON QC.BuyerId = GA.BuyerId AND QC.JobId = GA.JobId
         AND QC.OrderId = GA.OrderId AND QC.StyleId = GA.StyleId
         AND QC.ColorId = GA.ColorId AND QC.DressPartId = GA.DressPartId
        LEFT JOIN #WashStatusAgg WS ON WS.BuyerId = GA.BuyerId AND WS.JobId = GA.JobId
         AND WS.OrderId = GA.OrderId AND WS.StyleId = GA.StyleId
         AND WS.ColorId = GA.ColorId AND WS.DressPartId = GA.DressPartId
        LEFT JOIN #FabricComp FC ON FC.FabricationId = GR.FabricationId
        LEFT JOIN #GSMLookup GS ON GS.GSMId = GR.GSMId
        LEFT JOIN #DiaLookup DL ON DL.FabricationId = GR.FabricationId
        LEFT JOIN #OrderInfo OI ON OI.BuyerId = GA.BuyerId AND OI.JobId = GA.JobId
         AND OI.OrderId = GA.OrderId AND OI.StyleId = GA.StyleId
        LEFT JOIN MerchandisingDB..tbl_BuyerInformation BU WITH (NOLOCK) ON BU.BuyerId = GA.BuyerId
        LEFT JOIN MerchandisingDB..tbl_JobInfo J WITH (NOLOCK) ON J.JobNo = GA.JobId
        LEFT JOIN MerchandisingDB..tbl_StyleInformation STY WITH (NOLOCK) ON STY.StyleId = GA.OrderId
        LEFT JOIN MerchandisingDB..tbl_BuyerReference BR WITH (NOLOCK) ON BR.BuyerReferenceId = GA.StyleId
        LEFT JOIN scm..tbl_ItemColor IC WITH (NOLOCK) ON IC.ICLEID = GA.ColorId
        LEFT JOIN MerchandisingDB..tbl_DressPart DP WITH (NOLOCK) ON DP.DressId = GA.DressPartId
        LEFT JOIN [DB-MASCOGROUP]..tblUnitInfo U WITH (NOLOCK) ON U.UnitId = GR.ReceiveFromUnitId
        ORDER BY GA.BuyerId, GA.JobId, GA.OrderId, GA.StyleId, GA.ColorId, GA.DressPartId;
    END;
    DROP TABLE #FilteredReceive; DROP TABLE #BatchDim; DROP TABLE #WashCategoryByBatch;
    DROP TABLE #FabricComp; DROP TABLE #GSMLookup; DROP TABLE #DiaLookup;
    DROP TABLE #OrderInfo; DROP TABLE #GroupAgg; DROP TABLE #GroupRep;
    DROP TABLE #GroupWashType; DROP TABLE #GroupBatchLot;
    DROP TABLE #DeliveryLines; DROP TABLE #DeliveryAgg; DROP TABLE #QCAgg; DROP TABLE #WashStatusAgg;
END;
GO

