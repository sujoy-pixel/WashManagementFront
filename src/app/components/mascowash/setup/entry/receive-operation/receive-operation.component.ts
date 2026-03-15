import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
//import { subscribe } from 'diagnostics_channel';
interface SearchModel {
  UnitId?: number;
  fromDate?: string;
  toDate?: string;
  receiveNo?: string;
}

// Define the shape of one record in the table
interface ReceiveRecord {
  masterId: number;
  receiveNo: string;
  receivedBy: string;
  receiveDate: string; // ISO string or Date
}
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
  // searchList: any;
  sizeList: any[] = [];
  totalSizeQty = 0;
  master: any;
  details: any[] = [];
  // ✅ Initialize searchList as an empty array of ReceiveRecord
  searchList: ReceiveRecord[] = [];

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();
  }

  // ================= HEADER =================
  onNew() {
    this.isReviewMode = false;
    this.clearAll();
  }

  onSearch() {
    debugger;
    if (!this.review.UnitId) {
      this.toastr.warning('Please Select Unit');
      return;
    }

    if (!this.review.fromDate && !this.review.toDate && !this.review.receiveNo) {
      this.toastr.warning('Please select From Date or To Date or enter Receive No');
      return;
    }

    if ((this.review.fromDate && !this.review.toDate) || (!this.review.fromDate && this.review.toDate)) {
      this.toastr.warning('Please select both From Date and To Date');
      return;
    }

    this.getSearchData();
  }


  getSearchData() {
    debugger;
    this.service.getSearchData(
      this.review.UnitId!,
      this.review.receiveNo == null ? '' : this.review.receiveNo,
      this.review.fromDate == null ? '' : this.review.fromDate,
      this.review.toDate == null ? '' : this.review.toDate,
    ).subscribe({
      next: (res: ReceiveRecord[]) => {
        //this.searchList = res || [];
        this.buildSearchList(res || []);
      }
     
    });
  }

  buildSearchList(rows: any[]) {

    const map = new Map<string, any>();

    rows.forEach(r => {

      const key =
        `${r.receiveNo}`;

      if (!map.has(key)) {
        map.set(key, {
          masterId: r.masterId,
          detailsId: r.detailsId,
          trackingNo: r.trackingNo,
          receiveNo: r.receiveNo,
          receivedBy: r.receivedBy,

          buyerNo: r.buyerNo,
          buyerName: r.buyerName,

          styleNo: r.styleNo,
          styleName: r.styleName,

          jobId: r.jobId,
          jobInfo: r.jobInfo,

          orderId: r.orderId,
          orderNo: r.orderNo,

          receiveDate: r.receiveDate ? new Date(r.receiveDate) : null,

          totalQty: 0   // ✅ MUST EXIST
        });
      }

      // ✅ SAFE SUM
      map.get(key).totalQty += Number(r.qty || 0);
    });

    this.searchList = Array.from(map.values());
    this.detailList = this.searchList;
    console.log('SEARCH GRID (UNIQUE)', this.searchList);

  }

  onEdit(record: any) {
    debugger;
    this.service.getSearchData(
      this.review.UnitId!,
      this.review.receiveNo,
      this.review.fromDate,
      this.review.toDate
    )
      .subscribe(res => {
        if (!res || !res.length) {
          this.toastr.info('No data found');
          this.detailList = [];
          return;
        }
        this.bindDetailRows(res);
      });
  }

  onDelete(row: ReceiveRecord, index: number) {
    if (confirm(`Are you sure you want to delete Receive No ${row.receiveNo}?`)) {
      this.searchList.splice(index, 1);
      this.toastr.success('Record deleted successfully');
    }
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
        console.log('DATA FROM TRACKING NO SEARCH', res);
        this.bindDetailRows(res);
      });

  }

  // ================= Batch SEARCH =================
  onBatchNoEnter() {
    if (!this.Model.batchNo) {
      this.toastr.warning('Batch No required');
      return;
    }

    this.service.getReceiveByBatchNo(this.Model.batchNo)
      .subscribe(res => {
        if (!res || !res.length) {
          this.toastr.info('No data found');
          this.detailList = [];
          return;
        }
        this.bindDetailBatchNoRows(res);
      });
  }

  // ================= GRID BINDING For Tracking (GROUPING LOGIC) =================
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

          gsmId: r.gsmId,
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
        sizeId: r.iszid,
        size: r.size,
        qty: r.qty
      });

      // row.sizeDetails.push({
      //   sizeId: r.sizeId,
      //   size: r.size,
      //   qty: r.qty
      // });

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

  const grouped = row.sizeDetails.reduce((acc: any, item: any) => {

    if (!acc[item.sizeId]) {
      acc[item.sizeId] = {
        sizeId: item.sizeId,
        size: item.size,
        qty: 0
      };
    }

    acc[item.sizeId].qty += Number(item.qty);

    return acc;

  }, {});

  this.sizeList = Object.values(grouped);

  console.log('Unique Size List:', this.sizeList);

  this.calculateTotal();

  this.sizePopupVisible = true;
}
// openSizePopup(row: any) {
//   this.selectedRow = row;
//   this.sizeList = JSON.parse(JSON.stringify(row.sizeDetails));
//   console.log('Selected Row for Size Popup:', this.sizeList);
//   this.calculateTotal();
//   this.sizePopupVisible = true;
// }

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
  //     this.review = {
  //   receiveNo: this.review.receiveNo
  // };
   this.Model.UnitId = 0;
  }


  onSubmit() {
    
    debugger;


    let payload: any;

    // Dyeing validation
    if (this.Model.isDyeingActive) {

      if (!this.detailList?.length) {
        this.toastr.warning('No data to save');
        return;
      }

      payload = this.buildSavePayForBatchload();
    }
    else if (this.searchList?.length) {
      if (!this.detailList?.length) {
        this.toastr.warning('No data to save');
        return;
      }
      payload = this.buildUpdatePayload();
    }
    // Tracking validation
    else if (this.Model.isTrackingActive) {

      if (!this.detailList?.length) {
        this.toastr.warning('No data to save');
        return;
      }

      payload = this.buildSavePayload();

    }

 payload = this.buildSavePayload();

  console.log('SAVE PAYLOAD', payload);

//   this.service.saveReceiveOperation(payload)
//     .subscribe({
//       next: (res: any) => {

//         console.log('SAVE RESPONSE', res);
// debugger;
// //res = {succeeded: true, message: '{"ResultCode":1,"Maste

//         if (res?.resultCode === 1) {
//  this.toastr.success('Saved Successfully');
//  this.clearAll();
//           // clear form first
          
//           // set receive no after clear
//          // this.review.receiveNo = res.receiveNo;
//           this.review.receiveNo = res.ReceiveNo;


//         } else {
//           this.toastr.error(res?.message || 'Save Failed');
//         }
//       },

//       error: (error) => {
//         console.log(error);
//         this.toastr.error('Save Failed');
//       }
//     });
// }
this.service.saveReceiveOperation(payload)
.subscribe({
  next: (res: any) => {

    console.log('SAVE RESPONSE', res);

    if (!res?.succeeded) {
      this.toastr.error('Save Failed');
      return;
    }

    // ⭐ parse JSON string
    const data = JSON.parse(res.message);

    if (data?.ResultCode === 1) {

      this.clearAll();

      this.review.receiveNo = data.ReceiveNo;

      this.toastr.success(
        `Saved Successfully. Receive No: ${data.ReceiveNo}`
      );

    } else {
      this.toastr.error(data?.Message || 'Save Failed');
    }
  },

  error: () => {
    this.toastr.error('Save Failed');
  }
});
  }
// next: (res: any) => {
// debugger;

//     console.log('SAVE PAYLOAD', payload);
//     debugger;
//     this.service.saveReceiveOperation(payload)
//       .subscribe({
//         next: () => {
//           if (res?.resultCode === 1)
//           this.toastr.success('Saved Successfully');
//           this.clearAll();
//           this.review.receiveNo = res.receiveNo;
//         }, 
//         error: (error) => {
//           console.log(error);
//           this.toastr.error('Save Failed');
//         }
//       });
//    }
// this.service.saveReceiveOperation(payload)
// .subscribe({
//   next: (res: any) => {

//     if (res?.resultCode === 1) {

//       this.clearAll();

//       this.review.receiveNo = res.receiveNo;

//       this.toastr.success(
//         `Saved Successfully. Receive No: ${res.receiveNo}`
//       );

//     } else {
//       this.toastr.error(res?.message || 'Save Failed');
//     }
//   },
//   error: () => {
//     this.toastr.error('Save Failed');
//   }
// });

   //}
  buildSavePayload(): any {
    if (!this.searchList || this.searchList.length === 0) {
  if (!this.Model.UnitId) {
      this.toastr.warning('Please Select Unit');
      return;
    }
}
    
    debugger;
    console.log('Tracking Wise', this.detailList);
    const master = {
      Operation: 'TrackingNo',
      unitId: this.Model.UnitId,
      MasterId: 0,
      TrackingNo: this.Model.trackingNo && this.Model.trackingNo !== 0 ? `${this.Model.trackingNo}` : `${this.Model.batchNo}`,
      createdBy: 'SYSTEM'
    };

    const details = this.detailList.map(d => ({
      trackingBatchNo: d.trackingNo,
      fromUnitId: d.fromUnitId,
      receiveDate: d.receiveDate,
      BuyerId: d.buyerNo,
      JobId: d.jobId,
      StyleId: d.styleNo,
      OrderId: d.orderId,
      typeName: d.type,
      fabricationId: d.fabricationId,
      composition: d.composition,
      sizeId: d.iszId,
      gsmId: d.gsmId,
      colorId: d.colorId,
      dressPartId: d.dressPartId,

      operationType: d.operationTypes,
      uomId: d.uomId,
      totalQty: d.totalQty,

      probableDeliveryDate: d.probableDeliveryDate,
      shipmentDate: d.shipmentDate,

      sizeDetails: d.sizeDetails.map((s: any) => ({
        sizeId: s.sizeId,
        size: s.size,
        qty: s.qty
      }))
    }));

    return { master, details };
  }
  // =================  Buind for Batch No Grid  =================
  bindDetailBatchNoRows(rows: any[]) {

    const map = new Map<string, any>();
    // ===== GRID + DROPDOWN SOURCE (RAW DB DATA) =====
    this.detailList = rows.map(r => ({
      // ================= BASIC =================
      trackingNo: r.trackingNo,

      fromUnitId: r.fromUnitId,
      fromUnitName: r.fromUnitName,

      receiveDate: r.receiveDate ? new Date(r.receiveDate) : null,

      // ================= BUYER / JOB =================
      buyerNo: r.buyerNo,
      buyerName: r.buyerName,

      jobId: r.jobId,
      jobInfo: r.jobInfo,

      styleNo: r.styleNo,
      styleName: r.styleName,

      orderId: r.orderId,
      orderNo: r.orderNo,

      // ================= TYPE =================
      type: r.type,

      // ================= FABRIC =================
      fabricationId: r.fabrication,
      fabricationName: r.fabricationName,
      composition: r.composition,

      gsmId: r.gsmId,
      gsmName: r.gsm,
      sizeId: r.iszId,
      colorId: r.icleid,
      colorName: r.color,

      dressPartId: r.dressPartId,
      dressPartName: r.dressPart,

      operationTypes: r.operationType,

      uomId: r.uomDetailsId,
      uomName: r.uom,
      //qty: r.qty,
      totalQty: r.qty,
      // ================= SIZE & QTY =================
      //size: r.size,
      //qty: r.qty,

      // ================= DATE =================
      probableDeliveryDate: r.probableDeliveryDate
        ? new Date(r.probableDeliveryDate)
        : null,

      shipmentDate: r.shipmentDate
        ? new Date(r.shipmentDate)
        : null
    }));

    console.log('GRID + DROPDOWN DATA (AS IS FROM DB)', this.detailList);

    // ===== DROPDOWNS USE SAME LIST (NO UNIQUE) =====
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



  buildSavePayForBatchload(): any {
    debugger;
    console.log('DETAIL LIST', this.detailList);

    console.log('DETAIL LIST', this.detailList);
    const master = {
      operation: 'BatchNo',
      unitId: this.Model.UnitId,
      MasterId: 0,
      trackingNo: this.Model.trackingNo && this.Model.trackingNo !== 0 ? `${this.Model.trackingNo}` : `${this.Model.batchNo}`,
      createdBy: 'SYSTEM'
    };

    const details = this.detailList.map(d => ({
      trackingBatchNo: this.Model.batchNo,
      fromUnitId: d.fromUnitId,
      //receiveDate: d.receiveDate,
      receiveDate: new Date(d.receiveDate).getFullYear() < 1900
        ? new Date().toISOString()
        : new Date(d.receiveDate).toISOString(),

      BuyerId: d.buyerNo,
      JobId: d.jobId,
      StyleId: d.styleNo,
      OrderId: d.orderId,

      typeName: d.type,

      fabricationId: d.fabricationId,
      composition: d.composition,
      gsmId: d.gsmId,
      sizeId: d.iszId,
      colorId: d.colorId,
      dressPartId: d.dressPartId,

      operationType: d.operationTypes,
      uomId: d.uomId,
      totalQty: d.totalQty,

      //probableDeliveryDate: d.probableDeliveryDate,
      probableDeliveryDate: new Date(d.probableDeliveryDate).getFullYear() < 1900
        ? new Date().toISOString()
        : new Date(d.probableDeliveryDate).toISOString(),


      shipmentDate: new Date(d.shipmentDate).getFullYear() < 1900
        ? new Date().toISOString()
        : new Date(d.shipmentDate).toISOString(),
      sizeDetails: [{
        sizeId: d.sizeDetails?.[0]?.sizeId ?? '',
        size: d.sizeDetails?.[0]?.size ?? '',
        qty: 0
      }]
    }));

    return { master, details };
  }

  buildUpdatePayload(): any {
    debugger;
    console.log('DETAIL LIST', this.detailList);
    const master = {
      Operation: 'Update',
      unitId: this.review.UnitId,
      MasterId: this.searchList[0].masterId,
      TrackingNo: this.Model.trackingNo && this.Model.trackingNo !== 0 ? `${this.Model.trackingNo}` : `${this.Model.batchNo}`,
      createdBy: 'SYSTEM'
    };

    const details = this.detailList.map(d => ({

      trackingBatchNo: d.trackingNo,
      fromUnitId: d.fromUnitId,
      receiveDate: d.receiveDate,
      BuyerId: d.buyerNo,
      JobId: d.jobId,
      StyleId: d.styleNo,
      OrderId: d.orderId,
      typeName: d.type,
      fabricationId: d.fabricationId,
      composition: d.composition,
      sizeId: d.iszId,
      gsmId: d.gsmId,
      colorId: d.colorId,
      dressPartId: d.dressPartId,

      operationType: d.operationTypes,
      uomId: d.uomId,
      totalQty: d.totalQty,

      probableDeliveryDate: d.probableDeliveryDate,
      shipmentDate: d.shipmentDate,

      sizeDetails: d.sizeDetails.map((s: any) => ({
        sizeId: s.sizeId,
        size: s.size,
        qty: s.qty
      }))
    }));

    return { master, details };
  }

}
