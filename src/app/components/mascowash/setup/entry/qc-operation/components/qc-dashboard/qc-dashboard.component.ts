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
  repairableCount: number = 0;
  repairableLength: number = 0;

  rejectCount: number = 0;
  rejectLength: number = 0;

  goodGarments: number = 0;
  repairable: number = 0;
  reject: number = 0;

  // 🔹 Dialog
  isShowRejectionDialog: boolean = false;
  isShowRepairableDialog: boolean = false;

  loading: boolean = false;

  // 🔹 Lists
  repairableDefects: any[] = [];
  rejectDefects: any[] = [];

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

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

          // ✅ WITH ID MAPPING
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

          this.goodGarments = data.goodGarments ?? 0;

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
  resetValues() {
    this.goodGarments = 0;
    this.repairable = 0;
    this.reject = 0;

    this.repairableDefects = [];
    this.rejectDefects = [];
  }

  cleanTrackingNo() {
    this.batchNo = '';
  }

  // 🔹 GOOD
  increaseGood() {
    this.goodGarments++;
  }

  decreaseGood() {
    if (this.goodGarments > 0) this.goodGarments--;
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

    this.repairableDefects = data;

    this.repairableLength = data?.length || 0;

    this.repairableCount = data?.length
      ? data.reduce((sum, x) => sum + (x.count || 0), 0)
      : 0;

    this.repairable = this.repairableLength;

    this.isShowRepairableDialog = false;

    this.cdr.detectChanges();
  }

  // 🔹 REJECT
  handleRejectionData(data: any[]) {

    this.rejectDefects = data;

    this.rejectLength = data?.length || 0;

    this.rejectCount = data?.length
      ? data.reduce((sum, x) => sum + (x.count || 0), 0)
      : 0;

    this.reject = this.rejectLength;

    this.isShowRejectionDialog = false;

    this.cdr.detectChanges();
  }

  // 🔥🔥🔥 SAVE METHOD (MAIN PART)
  saveQCData() {
    debugger;

    if (!this.batchHeader.batchNo) {
      this.toastr.warning('Batch No required!');
      return;
    }

    // 🔥 MASTER
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
      rejectQty: this.rejectLength,         // ✅ LENGTH
      repairableQty: this.repairableLength  // ✅ LENGTH
    };

    // 🔥 DETAILS
    const repairableDetails = this.repairableDefects.map(x => ({
      defectId: x.defectId,
      qty: x.count || 0
    }));

    const rejectDetails = this.rejectDefects.map(x => ({
      defectId: x.defectId,
      qty: x.count || 0
    }));

    const payload = {
      master,
      repairableDetails,
      rejectDetails
    };

    console.log('FINAL SAVE:', payload);

    this.service.saveQCData(payload).subscribe({
      next: () => {
        this.toastr.success('Saved Successfully');
        this.resetValues();
      },
      error: () => {
        this.toastr.error('Save Failed');
      }
    });
  }
}