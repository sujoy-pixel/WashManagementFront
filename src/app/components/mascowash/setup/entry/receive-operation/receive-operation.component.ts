import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WashSetupService } from '../../../services/washsetup.service';

@Component({
  selector: 'app-receive-operation',
  templateUrl: './receive-operation.component.html',
  styleUrls: ['./receive-operation.component.scss']
})
export class ReceiveOperationComponent implements OnInit {

  // ================= FLAGS =================
  isReviewMode = false;

  // ================= MASTER =================
  Model: any = {
    unitId: null,
    trackingNo: '',
    dyeingBatchNo: '',
    manualNo: '',
    isTrackingActive: true,
    isDyeingActive: false,
    isManualActive: false
  };

  review: any = {
    unitId: null,
    fromDate: null,
    toDate: null
  };

  // ================= GRID =================
  detailList: any[] = [];

  // ================= DDL =================
  unitList: any[] = [];
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

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  // ================= LOAD DDL =================
  loadDropdowns() {
    this.service.GetUnitName().subscribe(res => {
      this.unitList = res.map(x => ({ label: x.DisplayName, value: x.ID }));
      this.fromUnitList = this.unitList;
    });

    this.service.GetBuyerNameDDL().subscribe(res => this.buyerList = res);
    this.service.GetJobNoDDL().subscribe(res => this.jobList = res);
    this.service.GetStyleNoDDL().subscribe(res => this.styleList = res);
    this.service.GetOrderNoDDL().subscribe(res => this.orderList = res);
    this.service.GetFabricationDDL().subscribe(res => this.fabricationList = res);
    this.service.GetGSMDDL().subscribe(res => this.gsmList = res);
    this.service.GetDressPartDDL().subscribe(res => this.dressPartList = res);
    this.service.GetUOMDDL().subscribe(res => this.uomList = res);
  }

  // ================= PAGE MODE =================
  onNew() {
    this.isReviewMode = false;
    this.clearAll();
  }

  onReview() {
    this.isReviewMode = !this.isReviewMode;
  }

  // ================= TRACKING SEARCH =================
  onTrackingEnter() {
    if (!this.Model.trackingNo) {
      this.toastr.warning('Enter tracking no');
      return;
    }

    this.service.getReceiveByTrackingNo(this.Model.trackingNo)
      .subscribe(res => {
        if (!res.length) {
          this.toastr.info('No data found');
          return;
        }
        this.bindDetailRows(res);
      });
  }

  bindDetailRows(rows: any[]) {
    this.detailList = rows.map(r => ({
      trackingNo: r.trackingNo,
      fromUnitId: r.fromUnitId,
      receiveDate: new Date(r.receiveDate),
      buyerNo: r.buyerNo,
      jobId: r.jobId,
      styleNo: r.styleNo,
      orderId: r.orderId,
      type: r.type,
      fabricationId: r.fabrication,
      composition: r.composition,
      gsmId: r.iszid,
      colorId: r.icleid,
      dressPartId: r.dressPartId,
      operationTypes: r.operationType,
      uomId: r.uomDetailsId,
      size: r.size,
      totalQty: r.qty,
      probableDeliveryDate: new Date(r.probableDeliveryDate),
      shipmentDate: new Date(r.shipmentDate),
      sizeDetails: []
    }));

    this.cdr.detectChanges();
  }

  // ================= SIZE POPUP =================
  openSizePopup(row: any) {
    this.selectedRow = row;
    this.sizeList = row.sizeDetails?.length
      ? JSON.parse(JSON.stringify(row.sizeDetails))
      : [{ size: row.size, qty: row.totalQty }];

    this.calculateSizeTotal();
    this.sizePopupVisible = true;
  }

  calculateSizeTotal() {
    this.totalSizeQty = this.sizeList.reduce((s, x) => s + (+x.qty || 0), 0);
  }

  confirmSizeQty() {
    this.selectedRow.sizeDetails = this.sizeList;
    this.selectedRow.totalQty = this.totalSizeQty;
    this.sizePopupVisible = false;
  }

  // ================= SAVE =================
  onSave() {
    if (!this.Model.unitId) {
      this.toastr.warning('Unit required');
      return;
    }
    if (!this.detailList.length) {
      this.toastr.warning('No data to save');
      return;
    }

    Swal.fire('Ready', 'Save API will be called here', 'success');
  }

  // ================= CLEAR =================
  clearAll() {
    this.Model = {
      unitId: null,
      trackingNo: '',
      dyeingBatchNo: '',
      manualNo: '',
      isTrackingActive: true,
      isDyeingActive: false,
      isManualActive: false
    };
    this.detailList = [];
  }
}
