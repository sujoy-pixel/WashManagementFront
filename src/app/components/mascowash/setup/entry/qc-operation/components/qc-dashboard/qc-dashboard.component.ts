import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { WashSetupService } from '../../../../../services/washsetup.service';
import { CommonServiceService } from '../../../../../services/common-service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormsModule } from '@angular/forms';
import { RejectReasonComponent } from '../reject-reason/reject-reason.component';

interface BatchHeaderModel {
  unitId?: number;
  buyerId?: number;
  styleId?: number;
  orderId?: number;
  jobId?: number;
  dressPartId?: number;
  uomId?: number;

  unitName: string;
  buyerName: string;
  batchNo: string;
  styleName: string;
  orderNo: string;
  jobNo: string;

  type: string;
  color: string;
  dressPart: string;
  uom: string;
  date: string;
}

@Component({
  selector: 'app-qc-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, RejectReasonComponent],
  templateUrl: './qc-dashboard.component.html',
  styleUrl: './qc-dashboard.component.scss'
})
export class QcDashboardComponent {

  batchNo: string = '';

  batchHeader: BatchHeaderModel = {
    unitName: '',
    buyerName: '',
    batchNo: '',
    styleName: '',
    orderNo: '',
    jobNo: '',
    type: '',
    color: '',
    dressPart: '',
    uom: '',
    date: ''
  };

  // 🔥 COUNTERS
  repairableCount = 0;
  repairableLength = 0;

  rejectCount = 0;
  rejectLength = 0;

  goodGarments = 0;
  repairable = 0;
  reject = 0;

  // 🔥 BASE VALUE (IMPORTANT)
  baseGoodGarments = 0;

  isShowRejectionDialog = false;
  isShowRepairableDialog = false;

  loading = false;

  repairableDefects: any[] = [];
  rejectDefects: any[] = [];

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  // 🔥 LOAD DATA
  loadBatchData() {

    if (!this.batchNo?.trim()) return;

    this.loading = true;

    this.service.getBatchWishQCDataList(this.batchNo)
      .subscribe({
        next: (res: any[]) => {

          if (!res || res.length === 0) {
            this.resetValues();
            this.toastr.warning('No data found!');
            return;
          }

          const data = res[0];

          this.batchHeader = {
            unitId: data.unitId,
            buyerId: data.buyerId,
            styleId: data.styleId,
            orderId: data.orderId,
            jobId: data.jobId,
            dressPartId: data.dressPartId,
            uomId: data.uomId,

            unitName: data.unitName ?? '',
            buyerName: data.buyerName ?? '',
            batchNo: data.batchNo ?? '',
            styleName: data.styleName ?? '',
            orderNo: data.orderNo ?? '',
            jobNo: data.jobNo ?? '',
            type: data.type ?? '',
            color: data.color ?? '',
            dressPart: data.dressPart ?? '',
            uom: data.uom ?? '',
            date: data.date ?? ''
          };

          // 🔥 BASE + CURRENT
          this.baseGoodGarments = data.goodGarments ?? 0;
          this.goodGarments = this.baseGoodGarments;

          this.cleanTrackingNo();
        },
        error: () => {
          this.toastr.error('Failed to load batch data');
          this.resetValues();
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  // 🔹 RESET
  // resetValues() {
  //   this.goodGarments = 0;
  //   this.baseGoodGarments = 0;
  //   this.repairable = 0;
  //   this.reject = 0;

  //   this.repairableDefects = [];
  //   this.rejectDefects = [];
  // }

  cleanTrackingNo() {
    this.batchNo = '';
  }

  // 🔥 CORE LOGIC (SUPER CLEAN)
  private recalculateGood() {
    this.goodGarments =
      this.baseGoodGarments - (this.rejectLength + this.repairableLength);

    if (this.goodGarments < 0) {
      this.goodGarments = 0;
    }
  }

  // 🔹 GOOD MANUAL (optional)
  increaseGood() {
    this.baseGoodGarments++;
    this.recalculateGood();
  }

  decreaseGood() {
    if (this.baseGoodGarments > 0) {
      this.baseGoodGarments--;
      this.recalculateGood();
    }
  }

  // 🔹 DIALOG
  showRepairableDialog() {
    this.isShowRepairableDialog = true;
  }

  showRejectionDialog() {
    this.isShowRejectionDialog = true;
  }

  // 🔹 REPAIRABLE
  handleReparableData(data: any[]) {
    console.log('Received Repairable Data:', data);
    this.repairableDefects = data;

    // this.repairableLength = data?.length || 0;


    // this.repairableCount = data?.length
    //   ? data.reduce((sum, x) => sum + (x.count || 0), 0)
    //   : 0;

    this.repairable = Object.keys(this.repairableDefects).length;

    // // 🔥 UPDATE GOOD
     this.recalculateGood();

     this.isShowRepairableDialog = false;

     this.cdr.detectChanges();
  }

  // 🔹 REJECT
  handleRejectionData(data: any[]) {
    this.rejectDefects = data;

    this.reject = Object.keys(this.rejectDefects).length;

    // this.rejectDefects = data;

    // this.rejectLength = data?.length || 0;

    // this.rejectCount = data?.length
    //   ? data.reduce((sum, x) => sum + (x.count || 0), 0)
    //   : 0;

    // this.reject = this.rejectLength;

    // // 🔥 UPDATE GOOD
     this.recalculateGood();

     this.isShowRejectionDialog = false;

     this.cdr.detectChanges();
  }
  removeDefect(groupKey: string, index: number) {
    this.repairableDefects[groupKey].splice(index, 1);

    if (this.repairableDefects[groupKey].length === 0) {
      delete this.repairableDefects[groupKey];
    }

    this.repairableDefects = { ...this.repairableDefects };
    this.repairable = Object.keys(this.repairableDefects).length;
  }
  removeReject(groupKey: string, index: number) {
    this.rejectDefects[groupKey].splice(index, 1);

    if (this.rejectDefects[groupKey].length === 0) {
      delete this.rejectDefects[groupKey];
    }

    this.rejectDefects = { ...this.rejectDefects };
    this.reject = Object.keys(this.rejectDefects).length;
  }
  // 🔥 SAVE
  saveQCData() {

    if (!this.batchHeader.batchNo) {
      this.toastr.warning('Batch No required!');
      return;
    }

    const master = {
      unitId: this.batchHeader.unitId,
      buyerId: this.batchHeader.buyerId,
      styleId: this.batchHeader.styleId,
      orderId: this.batchHeader.orderId,
      jobId: this.batchHeader.jobId,
      dressPartId: this.batchHeader.dressPartId,
      uomId: this.batchHeader.uomId,

      batchNo: this.batchHeader.batchNo,
      type: this.batchHeader.type,
      color: this.batchHeader.color,
      date: this.batchHeader.date,

      goodGarments: this.goodGarments,
      repairable: this.repairable,
      reject: this.reject
    };

    const repairableDetails = this.repairableDefects.map(x => ({
      defectId: x.defectId,
      qty: x.count || 0,
      backgroundColor: x.backgroundColor
    }));

    const rejectDetails = this.rejectDefects.map(x => ({
      defectId: x.defectId,
      qty: x.count || 0,
      backgroundColor: x.backgroundColor
    }));

    const payload = {
      master,
      repairableDetails,
      rejectDetails
    };

    console.log('FINAL SAVE:', payload);
    this.toastr.success('Saved Successfully');
    this.resetValues();
    // this.service.saveQCData(payload).subscribe({
    //   next: () => {
    //     this.toastr.success('Saved Successfully');
    //     this.resetValues();
    //   },
    //   error: () => {
    //     this.toastr.error('Save Failed');
    //   }
    // });
  }

  resetValues() {

    // 🔹 Header Reset
    this.batchHeader = {
      unitName: '',
      buyerName: '',
      batchNo: '',
      styleName: '',
      orderNo: '',
      jobNo: '',
      type: '',
      color: '',
      dressPart: '',
      uom: '',
      date: ''
    };

    // 🔹 Input Reset
    this.batchNo = '';

    // 🔹 Counters Reset
    this.goodGarments = 0;
    this.baseGoodGarments = 0;

    this.repairable = 0;
    this.reject = 0;

    this.repairableLength = 0;
    this.rejectLength = 0;

    this.repairableCount = 0;
    this.rejectCount = 0;

    // 🔹 Lists Reset
    this.repairableDefects = [];
    this.rejectDefects = [];

    // 🔹 Dialog Close
    this.isShowRejectionDialog = false;
    this.isShowRepairableDialog = false;

    // 🔹 UI Refresh
    this.cdr.detectChanges();

    this.toastr.info('Form cleared');
  }
}