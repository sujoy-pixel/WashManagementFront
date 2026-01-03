import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';

@Component({
  selector: 'app-receive-operation',
  templateUrl: './receive-operation.component.html',
  styleUrls: ['./receive-operation.component.scss']
})
export class ReceiveOperationComponent implements OnInit {

  // ================= FLAGS =================
  isReviewMode = false;
  saveButtonTitle = 'Save';
  // ================= MASTER =================
  Model: any = {
    UnitId: null,
    trackingNo: '',
    dyeingBatchNo: '',
    manualNo: '',
    isTrackingActive: true,
    isDyeingActive: false,
    isManualActive: false
  };

  review: any = {
    UnitId: null,
    fromDate: null,
    toDate: null
  };


  // ================= GRID =================
  detailList: any[] = [];

  // ================= DROPDOWNS =================
  UnitList: any[] = [];
  fromUnitList: any[] = [];
  buyerList: any[] = [];
  jobList: any[] = [];
  styleList: any[] = [];
  orderList: any[] = [];
  fabricationList: any[] = [];
  gsmList: any[] = [];
  colorList: any[] = [];
  dressPartList: any[] = [];
  uomList: any[] = [];

  // ================= SIZE POPUP =================
  sizePopupVisible = false;
  selectedRow: any;
  sizeList: any[] = [];
  totalSizeQty = 0;
  master: any;
  details: any[] = [];

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  // ================= HEADER =================
  onNew() {
    this.isReviewMode = false;
    this.clearAll();
  }

  onReview() {
    this.isReviewMode = !this.isReviewMode;
  }

  // ================= LOAD MASTER DROPDOWNS =================
  loadDropdowns() {

    this.service.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
      this.fromUnitList = [...this.UnitList];
    });

    this.service.GetBuyerNameDDL().subscribe(res => {
      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.BuyerName,
        value: x.ID ?? x.id ?? x.BuyerNo
      }));
    });
  }

  // ================= TRACKING SEARCH =================
  onTrackingEnter() {
    if (!this.Model.trackingNo) {
      this.toastr.warning('Tracking No required');
      return;
    }

    this.service.getReceiveByTrackingNo(this.Model.trackingNo)
      .subscribe(res => {
        if (!res || !res.length) {
          this.toastr.info('No data found');
          this.detailList = [];
          return;
        }
        this.bindDetailRows(res);
      });
  }

  // ================= GRID BINDING (GROUPING LOGIC) =================
  bindDetailRows(rows: any[]) {

    const map = new Map<string, any>();

    rows.forEach(r => {

      const key = [
        r.fromUnitId,
        r.buyerNo,
        r.jobId,
        r.styleNo,
        r.orderId,
        r.icleid,
        r.dressPartId
      ].join('|');

      if (!map.has(key)) {
        map.set(key, {
          trackingNo: r.trackingNo,
          fromUnitId: r.fromUnitId,
          receiveDate: r.receiveDate ? new Date(r.receiveDate) : null,

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
          composition: r.composition,

          gsmId: r.iszid,
          gsmName: r.gsm,

          colorId: r.icleid,
          colorName: r.color,

          dressPartId: r.dressPartId,
          dressPartName: r.dressPart,

          operationTypes: r.operationType,

          uomId: r.uomDetailsId,
          uomName: r.uom,

          probableDeliveryDate: r.probableDeliveryDate
            ? new Date(r.probableDeliveryDate)
            : null,

          shipmentDate: r.shipmentDate
            ? new Date(r.shipmentDate)
            : null,

          sizeDetails: [],
          totalQty: 0
        });
      }

      const row = map.get(key);

      row.sizeDetails.push({
        size: r.size,
        qty: r.qty
      });

      row.totalQty += r.qty;
    });

    this.detailList = Array.from(map.values());

    // ===== Populate dependent dropdowns (unique) =====
    this.jobList = this.unique(this.detailList, 'jobId', 'jobInfo');
    this.buyerList = this.unique(this.detailList, 'buyerNo', 'buyerName');
    this.styleList = this.unique(this.detailList, 'styleNo', 'styleName');
    this.orderList = this.unique(this.detailList, 'orderId', 'orderNo');
    this.fabricationList = this.unique(this.detailList, 'fabricationId', 'fabricationName');
    this.gsmList = this.unique(this.detailList, 'gsmId', 'gsmName');
    this.colorList = this.unique(this.detailList, 'colorId', 'colorName');
    this.dressPartList = this.unique(this.detailList, 'dressPartId', 'dressPartName');
    this.uomList = this.unique(this.detailList, 'uomId', 'uomName');
  }

  unique(arr: any[], val: string, label: string) {
    const m = new Map();
    arr.forEach(x => m.set(x[val], { value: x[val], label: x[label] }));
    return Array.from(m.values());
  }

  // ================= SIZE POPUP =================
  openSizePopup(row: any) {
    this.selectedRow = row;
    this.sizeList = JSON.parse(JSON.stringify(row.sizeDetails));
    this.calculateTotal();
    this.sizePopupVisible = true;
  }

  calculateTotal() {
    this.totalSizeQty = this.sizeList.reduce((s, x) => s + (+x.qty || 0), 0);
  }

  confirmSizeQty() {
    this.selectedRow.sizeDetails = [...this.sizeList];
    this.selectedRow.totalQty = this.totalSizeQty;
    this.sizePopupVisible = false;
  }

  // ================= CLEAR =================
  clearAll() {
    this.Model.trackingNo = '';
    this.detailList = [];
  }

   onSubmit() {

  if (!this.Model.UnitId) {
    this.toastr.warning('Please Select Unit');
    return;
  }

  if (!this.detailList.length) {
    this.toastr.warning('No data to save');
    return;
  }

  const payload = this.buildSavePayload();
  console.log('SAVE PAYLOAD', payload);

  this.service.saveReceiveOperation(payload)

  
    .subscribe({
      next: () => {
        this.toastr.success('Saved Successfully');
        this.clearAll();
      },
      error: () => {
        this.toastr.error('Save Failed');
      }
    });
}


  buildSavePayload(): any {
console.log('DETAIL LIST', this.detailList);
  const master = {
    Operation: 'INSERT',
    unitId: this.Model.UnitId,
    TrackingNo: this.Model.trackingNo,
    createdBy: 'SYSTEM'
  };

  const details = this.detailList.map(d => ({
    trackingBatchNo: d.trackingNo,
    fromUnitId: d.fromUnitId,
    receiveDate: d.receiveDate,
    typeName: d.type,

    fabricationId: d.fabricationId,
    composition: d.composition,
    iszId: d.gsmId,
    colorId: d.colorId,
    dressPartId: d.dressPartId,

    operationType: d.operationTypes,
    uomId: d.uomId,
    totalQty: d.totalQty,

    probableDeliveryDate: d.probableDeliveryDate,
    shipmentDate: d.shipmentDate,

    sizeDetails: d.sizeDetails.map((s: any) => ({
      size: s.size,
      qty: s.qty
    }))
  }));

  return { master, details };
}

}
