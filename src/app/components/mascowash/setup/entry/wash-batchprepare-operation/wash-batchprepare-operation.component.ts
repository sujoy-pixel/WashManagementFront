import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { de, tr } from 'date-fns/locale';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SizeQuantityComponent } from '../../../../advanced-ui/modals/size-quantity/size-quantity.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';


interface DropdownItem {
  label: string;
  value: number | string;
}
interface SizeDetail {
  sizeId?: number | null;
  size: string;
  qty: number;
}

interface WashBatchRow {
  fromUnitId: number;
  fromUnitName: string;

  buyerNo: number;
  buyerName: string;

  jobId: number;
  jobInfo: string;

  styleNo: number;
  styleName: string;

  orderId: number;
  orderNo: string;

  type: string;

  fabricationId: number;
  fabricationName: string;
  composition: string;

  colorId: number;
  color: string;
  icleid: number;

  dressPartId: number;
  dressPartName: string;
  receiveNo: string;
  uomId: number;
  uomName: string;

  shipmentDate: Date | null;
  probableDeliveryDate: Date | null;

  alreadyPreparedQty: number;
  remainingQty: number;
  totalQty: number;
  iszid: number;
  gsm: string;
  trackingNo: string;

  gsmId: number;
  sizeDetails: SizeDetail[];
  colorList: any[];
  fabricationList: any[];
  dressPartList: any[];
  uomList: any[];
  uomDetailsId: number;
}
@Component({
  standalone: true,
  imports: [CommonModule, SizeQuantityComponent, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  selector: 'app-wash-batchprepare-operation',
  templateUrl: './wash-batchprepare-operation.component.html',
  styleUrls: ['./wash-batchprepare-operation.component.scss']
})
export class WashBatchPrepareOperationComponent implements OnInit {


  Model = {
    UnitId: null as number | null,
    BuyerId: null as number | null,
    JobId: null as number | null,
    StyleId: null as number | null,
    OrderId: null as number | null
  };
  /* ===================== GRID ===================== */
  detailList: WashBatchRow[] = [];

  UnitList: any[] = [];

  /* ===================== DROPDOWNS ===================== */
  buyerList: DropdownItem[] = [];
  jobList: DropdownItem[] = [];
  styleList: DropdownItem[] = [];
  orderList: DropdownItem[] = [];
  fabricationList: DropdownItem[] = [];
  colorList: DropdownItem[] = [];
  dressPartList: DropdownItem[] = [];
  uomList: DropdownItem[] = [];
  /* ===================== SIZE POPUP ===================== */
  sizePopupVisible = false;
  selectedRow!: WashBatchRow;
  sizeList: SizeDetail[] = [];
  totalSizeQty = 0;

  saveButtonTitle = 'Save';
  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  //   ngOnInit(): void {
  //     this.loadDropdowns();

  //   }

  //   loadDropdowns(): void {

  //   this.service.GetUnitName().subscribe(res => {
  //     this.UnitList = res.map((x: any) => ({
  //       label: x.DisplayName ?? x.displayName,
  //       value: x.ID ?? x.id
  //     }));

  //     const found = this.UnitList.find(x => x.value === 60);
  //       if (found) {
  //         this.Model.UnitId = 60;
  //       }

  //   });


  //   this.service.GetBuyerNameDDL().subscribe(res => {
  //     this.buyerList = res.map((x: any) => ({
  //       label: x.DisplayName ?? x.displayName ?? x.BuyerName,
  //       value: x.ID ?? x.id ?? x.BuyerNo
  //     }));

  //     // ✅ AUTO SELECT BUYER
  //     if (this.buyerList.length === 1) {
  // this.Model.BuyerId = Number(this.buyerList[0].value);
  //       this.onBuyerChange(); // 🔥 auto trigger
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.loadUnits();
  }

  /* ===================== LOAD UNIT ===================== */
  loadUnits(): void {
    this.service.GetUnitName().subscribe(res => {

      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));

      // ✅ AUTO SELECT UNIT
      const found = this.UnitList.find(x => x.value === 60);
      if (found) {
        this.Model.UnitId = found.value;

        // 🔥 IMPORTANT: trigger change manually
        this.onUnitChange();
      }
    });


  }
  onUnitChange(): void {

    if (!this.Model.UnitId) return;

    this.service.GetBuyerNameDDL().subscribe(res => {

      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.BuyerName,
        value: x.ID ?? x.id ?? x.BuyerNo
      }));

      // ✅ AUTO SELECT BUYER
      if (this.buyerList.length === 1) {
        this.Model.BuyerId = Number(this.buyerList[0].value);

        // 🔥 trigger next dependency
        this.onBuyerChange();
      }
    });
  }
  /* ===================== BUYER CHANGE → LOAD JOB ===================== */
  onBuyerChange(): void {

    this.jobList = [];
    this.styleList = [];
    this.orderList = [];

    this.Model.JobId = null;
    this.Model.StyleId = null;
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId) {
      return;
    }

    this.service.GetJobNoWithParameterDDL({
      unitId: this.Model.UnitId,
      buyerId: this.Model.BuyerId
    }).subscribe(res => {

      this.jobList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.jobInfo,
        value: x.ID ?? x.id ?? x.JobId
      }));

      // ✅ AUTO SELECT JOB
      if (this.jobList.length === 1) {
        this.Model.JobId = Number(this.jobList[0].value);
        this.onJobChange();
      }
    });
  }


  /* ===================== JOB CHANGE → LOAD STYLE ===================== */
  onJobChange(): void {

    this.styleList = [];
    this.orderList = [];

    this.Model.StyleId = null;
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId) {
      return;
    }

    this.service.GetStyleNoWithParameterDDL({
      unitId: this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId: this.Model.JobId
    }).subscribe(res => {

      this.styleList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id ?? x.StyleId
      }));

      // ✅ AUTO SELECT STYLE
      if (this.styleList.length === 1) {
        this.Model.StyleId = Number(this.styleList[0].value);
        this.onStyleChange();
      }
    });
  }

  /* ===================== STYLE CHANGE → LOAD ORDER ===================== */
  onStyleChange(): void {

    this.orderList = [];
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId || !this.Model.StyleId) {
      return;
    }

    this.service.GetOrderNoWithParameterDDL({
      unitId: this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId: this.Model.JobId,
      styleId: this.Model.StyleId
    }).subscribe(res => {

      this.orderList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id ?? x.OrderId
      }));

      // ✅ AUTO SELECT ORDER
      if (this.orderList.length === 1) {
        this.Model.OrderId = Number(this.orderList[0].value);
      }
    });
  }


  /* ===================== SEARCH ===================== */
  onSearch(): void {
    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId ||
      !this.Model.StyleId || !this.Model.OrderId) {
      this.toastr.warning('Please select all fields before searching');
      return;
    }

    const params = {
      unitId: this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId: this.Model.JobId,
      styleId: this.Model.StyleId,
      orderId: this.Model.OrderId
    };



    this.service.getWashBatchPrepareGrid(params).subscribe({

      next: (res: any[]) => {
        debugger;
        console.log('WashBatchPrepareGrid Response:', res); // 👈 see DB data
        this.bindDetailRows(res);
        // ✅ Only reset model selections, keep all dropdown lists intact
        this.Model.BuyerId = null;
        this.Model.JobId = null;
        this.Model.StyleId = null;
        this.Model.OrderId = null;

        // 🔥 Auto-select unit 60 and reload buyers only
        this.loadUnits();
      },


      error: (err) => {
        console.error('WashBatchPrepareGrid Error:', err);
        this.toastr.error('Failed to load grid data');
      }
    });

  }

  /* ===================== GRID BIND ===================== */
  bindDetailRows(rows: any[]): void {
debugger;
    const map = new Map<string, any>();

    rows.forEach(item => {

      // ✅ GROUP KEY (IMPORTANT)
      const key = [
        item.buyerNo,
        item.jobId,
        item.styleNo,
        item.orderId,
        item.icleid,
        item.dressPartId,
      ].join('|');

      // ✅ FIRST TIME CREATE
      if (!map.has(key)) {
        map.set(key, {
          ...item,

          // reset values for accumulation
          // totalQty: 0,
          // remainingQty: 0,
         totalQty: Number(item.totalQty || 0),
        remainingQty: Number(item.remainingQty || 0),
        alreadyPreparedQty: Number(item.alreadyPreparedQty || 0),
          sizeDetails: [],

          // dropdowns
          colorList: [{ value: item.icleid, label: item.color }],
          fabricationList: [{ value: item.fabricationId, label: item.fabricationName }],
          dressPartList: [{ value: item.dressPartId, label: item.dressPart }],
          uomList: [{ value: item.uomDetailsId, label: item.uom }]
        });
      }

      const row = map.get(key);
      
      // ✅ CUMULATIVE SUM
      // row.totalQty += Number(item.qty || 0);
     // row.remainingQty += Number(item.remainingQty || 0);

      // ✅ SIZE ADD (important for popup)
      row.sizeDetails.push({
        sizeId: item.iszid,
        size: item.size,
        qty: Number(item.qty || 0)
      });

    });

    // ✅ FINAL LIST (ONLY GROUPED ROWS)
    this.detailList = Array.from(map.values());

    /* ===== Dropdowns ===== */
    this.buyerList = this.unique(this.detailList, 'buyerNo', 'buyerName');
    this.jobList = this.unique(this.detailList, 'jobId', 'jobInfo');
    this.styleList = this.unique(this.detailList, 'styleNo', 'styleName');
    this.orderList = this.unique(this.detailList, 'orderId', 'orderNo');
    this.colorList = this.unique(this.detailList, 'icleid', 'color');
    this.dressPartList = this.unique(this.detailList, 'dressPartId', 'dressPart');

    console.log("✅ FINAL GROUPED LIST:", this.detailList);
  }
  // bindDetailRows(rows: any[]): void {
  //   debugger;
  //   const map = new Map<string, WashBatchRow>();



  //   this.detailList = rows.map((item) => ({
  //     ...item,
  //     colorList: [{ value: item.icleid, label: item.color }],
  //     fabricationList: [{ value: item.fabricationId, label: item.fabricationName }],
  //     dressPartList: [{ value: item.dressPartId, label: item.dressPart }],
  //     uomList: [{ value: item.uomDetailsId, label: item.uom }]

  //   }));

  //   /* ===== Populate dropdowns ===== */
  //   this.buyerList = this.unique(this.detailList, 'buyerNo', 'buyerName');
  //   this.jobList = this.unique(this.detailList, 'jobId', 'jobInfo'); ``
  //   this.styleList = this.unique(this.detailList, 'styleNo', 'styleName');
  //   this.orderList = this.unique(this.detailList, 'orderId', 'orderNo');
  //   // this.fabricationList = this.unique(this.detailList, 'fabricationId', 'fabricationName');
  //   this.colorList = this.unique(this.detailList, 'icleid', 'color');
  //   // this.dressPartList = this.unique(this.detailList, 'dressPartId', 'dressPart');
  //   // this.uomList = this.unique(this.detailList, 'uomDetailsId', 'uom');
  //   console.log("Binded Detail List:", this.detailList);



  // }

  unique(arr: any[], value: string, label: string): DropdownItem[] {
    const map = new Map<any, DropdownItem>();
    arr.forEach(x => map.set(x[value], { value: x[value], label: x[label] }));
    return Array.from(map.values());
  }



  // openSizePopup(row: any) {

  //   this.selectedRow = row;

  //   const grouped = row.sizeDetails.reduce((acc: any, item: any) => {

  //     if (!acc[item.sizeId]) {
  //       acc[item.sizeId] = {
  //         sizeId: item.sizeId,
  //         size: item.size,
  //         qty: 0
  //       };
  //     }

  //     acc[item.sizeId].qty += Number(item.qty);

  //     return acc;

  //   }, {});

  //   this.sizeList = Object.values(grouped);

  //   console.log('Unique Size List:', this.sizeList);

  //   this.calculateTotal();

  //   this.sizePopupVisible = true;
  // }


  // calculateTotal() {
  //   this.totalSizeQty = this.sizeList.reduce((s, x) => s + (+x.qty || 0), 0);
  // }

  // confirmSizeQty() {
  //   this.selectedRow.totalQty = this.totalSizeQty;
  //   this.selectedRow.sizeDetails = [...this.sizeList];

  //   this.sizePopupVisible = false;
  // }

openSizePopup(row: any) {

  this.selectedRow = row;

  const grouped = row.sizeDetails.reduce((acc: any, item: any) => {

    if (!acc[item.sizeId]) {
      acc[item.sizeId] = {
        sizeId: item.sizeId,
        size: item.size,
        qty: 0,
        isZid: item.isZid
      };
    }

    // If isZid = 0, qty must always be 0
    if (Number(item.isZid) === 0) {
      acc[item.sizeId].qty = 0;
    } else {
      acc[item.sizeId].qty += Number(item.qty) || 0;
    }

    return acc;

  }, {});

  this.sizeList = Object.values(grouped);

  console.log('Unique Size List:', this.sizeList);

  this.calculateTotal();

  this.sizePopupVisible = true;
}


calculateTotal() {
  this.totalSizeQty = this.sizeList.reduce(
    (s, x) => s + (+x.qty || 0),
    0
  );
}


confirmSizeQty() {

  // Final safety check before saving
  this.sizeList.forEach((x: any) => {
    if (Number(x.isZid) === 0) {
      x.qty = 0;
    }
  });

  this.selectedRow.totalQty = this.totalSizeQty;
  this.selectedRow.sizeDetails = [...this.sizeList];

  this.sizePopupVisible = false;
}


  /* ===================== ACTIONS ===================== */
openPrepareTab(row: WashBatchRow): void {

  if (row.iszid == 0) {
    // If IsZid = 0, size quantity must always be 0
    row.sizeDetails?.forEach((x: any) => {
      x.qty = 0;
    });
  }

  if (row.totalQty == row.alreadyPreparedQty) {
    this.toastr.warning('All quantity already prepared for this batch.');
    return;
  }

  debugger;

  if (!row?.orderId) return;

  // Calculate size quantity
  // If iszid = 0, sizeSum must be 0
  const sizeSum = row.iszid == 0
    ? 0
    : (row.sizeDetails || []).reduce(
        (acc, curr) => acc + (Number(curr.qty) || 0),
        0
      );

  const navState = {

    // ===== MASTER IDS =====
    buyerId: row.buyerNo,
    jobId: row.jobId,
    styleId: row.styleNo,
    orderId: row.orderId,
    fabricationId: row.fabricationId,
    colorId: row.icleid,
    dressPartId: row.dressPartId,
    uomId: row.uomId,
    fromUnitId: row.fromUnitId,
    iszid: row.iszid,

    // ===== DISPLAY =====
    buyer: row.buyerName ?? '',
    jobNo: row.jobInfo ?? '',
    styleNo: row.styleName ?? '',
    orderNo: row.orderNo ?? '',
    documentNo: row.receiveNo ?? '',
    fabrication: row.fabricationName ?? '',
    composition: row.composition ?? '',
    color: row.color ?? '',
    gsm: row.gsm,
    date: new Date().toISOString().split('T')[0],
    trackingNo: row.trackingNo ?? '',
    type: row.type ?? '',
    RemainingQty: row.remainingQty ?? 0,

    // ===== CHILD =====
    sizeDetails: row.sizeDetails ?? [],

    // ===== TOTAL =====
    totalQty: row.totalQty - row.alreadyPreparedQty,

  };
  // openPrepareTab(row: WashBatchRow): void {

  //   if (row.totalQty == row.alreadyPreparedQty) {
  //     this.toastr.warning('All quantity already prepared for this batch.');
  //     return;
  //   }
  //   debugger;
  //   if (!row?.orderId) return;

  //   // ✅ Calculate sum from size details
  //   const sizeSum = (row.sizeDetails || []).reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);

  //   const navState = {

  //     // ===== MASTER IDS =====
  //     buyerId: row.buyerNo,
  //     jobId: row.jobId,
  //     styleId: row.styleNo,
  //     orderId: row.orderId,
  //     fabricationId: row.fabricationId,
  //     colorId: row.icleid,
  //     dressPartId: row.dressPartId,
  //     uomId: row.uomId,
  //     fromUnitId: row.fromUnitId,
  //     iszid: row.iszid,

  //     // ===== DISPLAY =====
  //     buyer: row.buyerName ?? '',
  //     jobNo: row.jobInfo ?? '',
  //     styleNo: row.styleName ?? '',
  //     orderNo: row.orderNo ?? '',
  //     documentNo: row.receiveNo ?? '',
  //     fabrication: row.fabricationName ?? '',
  //     composition: row.composition ?? '',
  //     color: row.color ?? '',
  //     gsm: row.gsm,
  //     date: new Date().toISOString().split('T')[0],
  //     trackingNo: row.trackingNo ?? '',
  //     type: row.type ?? '',
  //     RemainingQty: row.remainingQty ?? 0,
     
  //     // ===== CHILD =====
  //     sizeDetails: row.sizeDetails ?? [],
  //     // ✅ Use sum of sizes if available, otherwise fallback to existing logic
  //     totalQty: row.totalQty - row.alreadyPreparedQty
  //     // sizeSum > 0 ? sizeSum : ((row.remainingQty ?? 0) === 0 ? row.totalQty : row.remainingQty)
  //   };

    localStorage.setItem(
      'WASH_PREPARE_NAV_STATE',
      JSON.stringify(navState)
    );

    const url = this.router.serializeUrl(
      this.router.createUrlTree([
        '/mascowash/setup/entry/wash-prepare-action'
      ])
    );

    window.open(url, '_blank', 'noopener');
    this.resetForm();
    this.loadUnits();
  }
  resetForm(): void {

    // ===== CLEAR MODEL =====
    this.Model = {
      UnitId: null,
      BuyerId: null,
      JobId: null,
      StyleId: null,
      OrderId: null
    };

    // ===== CLEAR DROPDOWNS =====
    this.buyerList = [];
    this.jobList = [];
    this.styleList = [];
    this.orderList = [];

    // (Optional: keep UnitList if static)
    // this.UnitList = [];

    // ===== CLEAR GRID =====
    this.detailList = [];

    // ===== CLEAR EXTRA =====
    this.sizeList = [];
    this.sizePopupVisible = false;
  }


}