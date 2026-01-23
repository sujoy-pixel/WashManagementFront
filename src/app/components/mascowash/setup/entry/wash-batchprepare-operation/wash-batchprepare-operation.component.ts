import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { de } from 'date-fns/locale';
import { Router } from '@angular/router';



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
  colorName: string;

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
iszid:number;
gsm:string;

gsmId:number;
  sizeDetails: SizeDetail[];
}
@Component({
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
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  /* ===================== LOAD UNIT & BUYER ===================== */
  loadDropdowns(): void {

  this.service.GetUnitName().subscribe(res => {
    this.UnitList = res.map((x: any) => ({
      label: x.DisplayName ?? x.displayName,
      value: x.ID ?? x.id
    }));

    // ✅ AUTO SELECT UNIT
    if (this.UnitList.length === 1) {
      this.Model.UnitId = this.UnitList[0].value;
    }
  });

  this.service.GetBuyerNameDDL().subscribe(res => {
    this.buyerList = res.map((x: any) => ({
      label: x.DisplayName ?? x.displayName ?? x.BuyerName,
      value: x.ID ?? x.id ?? x.BuyerNo
    }));

    // ✅ AUTO SELECT BUYER
    if (this.buyerList.length === 1) {
this.Model.BuyerId = Number(this.buyerList[0].value);
      this.onBuyerChange(); // 🔥 auto trigger
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
    console.log('WashBatchPrepareGrid Response:', res); // 👈 see DB data
    this.bindDetailRows(res);
  },
  error: (err) => {
    console.error('WashBatchPrepareGrid Error:', err);
    this.toastr.error('Failed to load grid data');
  }
});

  }

  /* ===================== GRID BIND ===================== */
  bindDetailRows(rows: any[]): void {

    const map = new Map<string, WashBatchRow>();

    rows.forEach(r => {

      const key = [
        r.fromUnitId,
        r.buyerNo,
        r.jobId,
        r.styleNo,
        r.orderId,
        r.colorId,
        r.dressPartId
      ].join('|');

      if (!map.has(key)) {
        map.set(key, {
          buyerNo: r.buyerNo,
          buyerName: r.buyerName,

          jobId: r.jobId,
          jobInfo: r.jobInfo,

          styleNo: r.styleNo,
          styleName: r.styleName,

          orderId: r.orderId,
          orderNo: r.orderNo,

          type: r.type,

          fabricationId: r.fabrication,
          fabricationName: r.fabricationName,
          composition:r.composition,
          colorId: r.icleid,
          colorName: r.color,

          dressPartId: r.dressPartId,
          dressPartName: r.dressPart,

          uomId: r.uomDetailsId,
          uomName: r.uom,
          alreadyPreparedQty: r.alreadyPreparedQty || 0,
          remainingQty: r.remainingQty || 0,

          shipmentDate: r.shipmentDate ? new Date(r.shipmentDate) : null,
          probableDeliveryDate: r.probableDeliveryDate ? new Date(r.probableDeliveryDate) : null,
           fromUnitId: r.fromUnitId,
          fromUnitName: r.fromUnitName,
          receiveNo: r.receiveNo,
          sizeDetails: [],
          totalQty: 0,
          iszid: r.iszid,
          gsm: r.gsm,
          gsmId:r.gsmId
        });
      }
      const row = map.get(key)!;

      row.sizeDetails.push({ sizeId: r.iszid, size: r.size, qty: r.qty });
      row.totalQty += r.qty;
    });

    this.detailList = Array.from(map.values());

    /* ===== Populate dropdowns ===== */
    this.buyerList = this.unique(this.detailList, 'buyerNo', 'buyerName');
    this.jobList = this.unique(this.detailList, 'jobId', 'jobInfo');
    this.styleList = this.unique(this.detailList, 'styleNo', 'styleName');
    this.orderList = this.unique(this.detailList, 'orderId', 'orderNo');
    this.fabricationList = this.unique(this.detailList, 'fabricationId', 'fabricationName');
    this.colorList = this.unique(this.detailList, 'colorId', 'colorName');
    this.dressPartList = this.unique(this.detailList, 'dressPartId', 'dressPartName');
    this.uomList = this.unique(this.detailList, 'uomId', 'uomName');
    console.log("Binded Detail List:", this.detailList);
  }

  unique(arr: any[], value: string, label: string): DropdownItem[] {
    const map = new Map<any, DropdownItem>();
    arr.forEach(x => map.set(x[value], { value: x[value], label: x[label] }));
    return Array.from(map.values());
  }

  /* ===================== SIZE POPUP ===================== */
  openSizePopup(row: WashBatchRow): void {
    this.selectedRow = row;
    this.sizeList = JSON.parse(JSON.stringify(row.sizeDetails));
    this.calculateTotal();
    this.sizePopupVisible = true;
  }

  calculateTotal(): void {
    this.totalSizeQty = this.sizeList.reduce((s, x) => s + (+x.qty || 0), 0);
  }

  confirmSizeQty(): void {
    this.selectedRow.sizeDetails = [...this.sizeList];
    this.selectedRow.totalQty = this.totalSizeQty;
    this.sizePopupVisible = false;
  }

  /* ===================== ACTIONS ===================== */

openPrepareTab(row: WashBatchRow): void {

  if (!row?.orderId) return;

  const navState = {

    // ===== MASTER IDS =====
    buyerId: row.buyerNo,
    jobId: row.jobId,
    styleId: row.styleNo,
    orderId: row.orderId,
    fabricationId: row.fabricationId,
    colorId: row.colorId,
    dressPartId: row.dressPartId,
    uomId: row.uomId,
    fromUnitId: row.fromUnitId,
    iszid:row.iszid,
    
    // ===== DISPLAY =====
    buyer: row.buyerName ?? '',
    jobNo: row.jobInfo ?? '',
    styleNo: row.styleName ?? '',
    orderNo: row.orderNo ?? '',
    documentNo: row.receiveNo ?? '',
    fabrication: row.fabricationName ?? '',
    composition: row.composition ?? '',
    color: row.colorName ?? '',
    gsm:row.gsm,
    date: new Date().toISOString().split('T')[0],

    // ===== CHILD =====
    sizeDetails: row.sizeDetails ?? [],
    totalQty: row.totalQty ?? 0
  };

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
}

}