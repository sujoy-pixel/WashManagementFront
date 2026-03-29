import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { WashSetupService } from '../../../../../services/washsetup.service';
import { CommonServiceService } from '../../../../../services/common-service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RejectReasonComponent } from '../reject-reason/reject-reason.component';

interface BatchHeaderModel {
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

  // 🔹 Input
  batchNo: string = '';

  // 🔹 Header Model (NEW)
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

  // 🔹 Counters
  goodGarments: number = 0;
  repairable: number = 0;
  reject: number = 0;

  // 🔹 Dialog Control
  isShowRejectionDialog: boolean = false;
  isShowRepairableDialog: boolean = false;

  // 🔹 State
  loading: boolean = false;

  // 🔹 Selected Data
  selectedRejects: any[] = [];
  selectedRepairable: any[] = [];

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

  // 🔥 Load Batch Data (MAIN)
  loadBatchData() {

    if (!this.batchNo || this.batchNo.trim() === '') return;

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

          console.log('Batch QC Data:', data);

          // 🔥 Header Binding (NEW)
          this.batchHeader = {
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

          // 🔹 Existing Logic
          this.goodGarments = data.goodGarments ?? 0;

          this.cleanTrackingNo();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load batch data');
          this.resetValues();
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  // 🔹 Reset All
  resetValues() {
    this.goodGarments = 0;
    this.repairable = 0;
    this.reject = 0;

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

    this.rejectDefects = [];
    this.repairableDefects = [];
  }

  cleanTrackingNo() {
    this.batchNo = '';
  }

  // 🔹 Good Garments
  increaseGood() {
    this.goodGarments++;
  }

  decreaseGood() {
    if (this.goodGarments > 0) this.goodGarments--;
  }

  // 🔹 Repairable Dialog
  showRepairableDialog() {
    this.isShowRepairableDialog = true;
  }

  handleReparableData(data: any[]) {

    console.log('Repairable Data:', data);

    this.repairableDefects = data;

    this.repairable = data.reduce((sum, x) => sum + x.count, 0);

    this.isShowRepairableDialog = false;
  }

  // 🔹 Reject Dialog
  showRejectionDialog() {
    this.isShowRejectionDialog = true;
  }

  handleRejectionData(data: any[]) {

    console.log('Reject Data:', data);

    this.rejectDefects = data;

    this.reject = data.reduce((sum, x) => sum + x.count, 0);

    this.isShowRejectionDialog = false;
  }

}