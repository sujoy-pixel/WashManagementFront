
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WashSetupService } from '../../../services/washsetup.service';
//import { WashSetupService } from '../../../services/washsetup.service';
 @Component({
  selector: 'app-receive-operation',
  templateUrl: './receive-operation.component.html',
  styleUrls: ['./receive-operation.component.scss']
})

export class ReceiveOperationComponent implements OnInit {

  // ================== FLAGS ==================
  isReviewMode = false;
  isTrackingMode = true;

  // ================== DROPDOWNS ==================
  unitList: any[] = [];
  fromUnitList: any[] = [];
  fabricationList: any[] = [];
  gsmList: any[] = [];
  colorList: any[] = [];
  dressPartList: any[] = [];
  uomList: any[] = [];

  // ================== REVIEW MODEL ==================
  review: any = {
    unitId: null,
    fromDate: null,
    toDate: null
  };

  // ================== MASTER MODEL ==================
  Model: any = {
    unitId: null,
    trackingNo: '',
    dyeingBatchNo: '',
    manualNo: ''
  };

  // ================== DETAIL GRID ==================
  detailList: any[] = [];

  // ================== SIZE POPUP ==================
  sizePopupVisible = false;
  selectedRow: any = null;
  sizeList: any[] = [];
  totalSizeQty = 0;

    constructor(
      private service: WashSetupService,
      private toastr: ToastrService,
      private cdr: ChangeDetectorRef
    ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  // ================== LOAD MASTER DATA ==================
  loadDropdowns() {
    this.loadUnits();
    // others will be loaded when needed
  }

  loadUnits() {
    this.unitList = [];
    this.service.GetUnitName().subscribe(res => {
      this.unitList = res.map(x => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
    });
  }

  // // ================== PAGE MODE ==================
  onNew() {
    this.isReviewMode = false;
    this.clearAll();
  }

  onReview() {
    this.isReviewMode = !this.isReviewMode;
  }

  // // ================== TOGGLE ==================
  onTrackingModeChange() {
    if (this.isTrackingMode) {
      this.Model.dyeingBatchNo = '';
      this.Model.manualNo = '';
    } else {
      this.Model.trackingNo = '';
    }
  }

  // ================== TRACKING SEARCH ==================
  // onTrackingEnter() {
  //   if (!this.Model.trackingNo) return;

  //   this.service.getReceiveDataByTracking(this.Model.trackingNo)
  //     .subscribe((res: any[]) => {
  //       this.bindDetailRows(res);
  //     });
  // }

  bindDetailRows(rows: any[]) {
    this.detailList = rows.map(r => ({
      trackingNo: r.trackingNo,
      fromUnitId: r.fromUnitId,
      receiveDate: new Date(),
      buyer: r.buyer,
      job: r.job,
      style: r.style,
      orderNo: r.orderNo,
      typeName: r.typeName,
      fabricationId: r.fabricationId,
      composition: r.composition,
      gsmId: r.gsmId,
      colorId: r.colorId,
      dressPartId: r.dressPartId,
      operationTypes: r.operationTypes,
      uomId: r.uomId,
      totalQty: r.totalQty ?? 0,
      probableDeliveryDate: new Date(),
      shipmentDate: r.shipmentDate,
      sizeDetails: []
    }));

    this.cdr.detectChanges();
  }

  // ================== SIZE POPUP ==================
  openSizePopup(row: any) {
    this.selectedRow = row;
    this.sizeList = row.sizeDetails?.length
      ? JSON.parse(JSON.stringify(row.sizeDetails))
      : this.getDefaultSizes();

    this.calculateSizeTotal();
    this.sizePopupVisible = true;
  }

  getDefaultSizes() {
    return [
      { size: 'S', qty: 0 },
      { size: 'M', qty: 0 },
      { size: 'L', qty: 0 }
    ];
  }

  calculateSizeTotal() {
    this.totalSizeQty = this.sizeList.reduce(
      (sum, x) => sum + (+x.qty || 0), 0
    );
  }

  onSizeQtyChange() {
    this.calculateSizeTotal();
  }

  confirmSizeQty() {
    this.selectedRow.sizeDetails = this.sizeList;
    this.selectedRow.totalQty = this.totalSizeQty;
    this.sizePopupVisible = false;
  }

  // ================== SAVE ==================
  onSave() {
    if (!this.Model.unitId) {
      this.toastr.warning('Unit is required');
      return;
    }

    if (!this.detailList.length) {
      this.toastr.warning('No receive data found');
      return;
    }

    const payload = {
      Master: {
        UnitId: this.Model.unitId,
        OperationType: 'RECEIVE'
      },
      Details: this.detailList
    };

    // this.service.saveReceiveOperation(payload).subscribe(() => {
    //   this.toastr.success('Saved successfully');
    //   this.clearAll();
    // }, () => {
    //   this.toastr.error('Save failed');
    // });
  }

  // ================== NAVIGATION ==================
  onReturn() {
    this.clearAll();
  }

  onClose() {
    Swal.fire({
      title: 'Close?',
      text: 'Unsaved data will be lost',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.clearAll();
      }
    });
  }

  // ================== CLEAR ==================
  clearAll() {
    this.Model = {
      unitId: null,
      trackingNo: '',
      dyeingBatchNo: '',
      manualNo: ''
    };

    this.detailList = [];
    this.isTrackingMode = true;
    this.cdr.detectChanges();
  }
}
