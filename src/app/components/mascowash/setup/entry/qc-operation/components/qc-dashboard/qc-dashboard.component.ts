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
  fabricationId?: number;
  colorId?: number;

  unitName: string;
  buyerName: string;
  trackingNo: string;
  batchNo: string;
  styleName: string;
  orderNo: string;
  jobNo: string;

  type: string;
  fabricationName: string;
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
    trackingNo: '',
    batchNo: '',
    styleName: '',
    orderNo: '',
    jobNo: '',
    type: '',
    fabricationName: '',
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
  
  isSaving = false;
  repairableDefects: Record<string, any[]> = {};
  rejectDefects: Record<string, any[]> = {};

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
            fabricationId: data.fabricationId,
            colorId: data.colorId,

            unitName: data.unitName ?? '',
            buyerName: data.buyerName ?? '',
            trackingNo: data.trackingNo ?? '',
            batchNo: data.batchNo ?? '',
            styleName: data.styleName ?? '',
            orderNo: data.orderNo ?? '',
            jobNo: data.jobNo ?? '',
            type: data.type ?? '',
            fabricationName: data.fabricationName ?? '',
            color: data.color ?? '',
            dressPart: data.dressPart ?? '',
            uom: data.uom ?? '',
            date: data.prepareDate ?? ''
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
      this.baseGoodGarments - (this.reject + this.repairable);

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
  handleReparableData(data: any) {
    this.repairableDefects = data;
    this.repairable = Object.keys(this.repairableDefects).length;

    this.recalculateGood();
    this.isShowRepairableDialog = false;
    this.cdr.detectChanges();
  }

  // 🔹 REJECT
  handleRejectionData(data: any) {
    this.rejectDefects = data;
    this.reject = Object.keys(this.rejectDefects).length;

    this.recalculateGood();
    this.isShowRejectionDialog = false;
    this.cdr.detectChanges();
  }

  removeDefect(groupKey: any, index: number) {
    const key = groupKey as string;
    this.repairableDefects[key].splice(index, 1);

    if (this.repairableDefects[key].length === 0) {
      delete this.repairableDefects[key];
    }

    this.repairableDefects = { ...this.repairableDefects };
    this.repairable = Object.keys(this.repairableDefects).length;
    this.recalculateGood();
  }

  removeReject(groupKey: any, index: number) {
    const key = groupKey as string;
    this.rejectDefects[key].splice(index, 1);

    if (this.rejectDefects[key].length === 0) {
      delete this.rejectDefects[key];
    }

    this.rejectDefects = { ...this.rejectDefects };
    this.reject = Object.keys(this.rejectDefects).length;
    this.recalculateGood();
  }
  // 🔥 SAVE

saveQCData() {
debugger;
  // ── Validation ──────────────────────────────
  if (!this.batchHeader.batchNo) {
    this.toastr.warning('Please load a batch first!');
    return;
  }

  if (this.goodGarments < 0) {
    this.toastr.warning('Good garments cannot be negative!');
    return;
  }

  this.isSaving = true;

  // ── Master ──────────────────────────────────
  const master = {
    createdBy:    'Admin',
    unitId:       this.batchHeader.unitId      ?? 0,
    buyerId:      this.batchHeader.buyerId     ?? 0,
    styleId:      this.batchHeader.styleId     ?? 0,
    orderId:      this.batchHeader.orderId     ?? 0,
    jobId:        this.batchHeader.jobId       ?? 0,
    dressPartId:  this.batchHeader.dressPartId ?? 0,
    uomId:        this.batchHeader.uomId       ?? 0,
    trackingNo:   this.batchHeader.trackingNo  ?? '',
    batchNo:      this.batchHeader.batchNo,
    type:         this.batchHeader.type        ?? '',
    color:        this.batchHeader.color       ?? '',
    colorId:      this.batchHeader.colorId     ?? null,
    date:         this.batchHeader.date        ?? new Date().toISOString(),
    goodGarments: this.goodGarments,
    repairable:   this.repairable,
    reject:       this.reject,
    machineIds:   '0',
    processIds:   '0'
  };

  // ── Repairable Details ───────────────────────
  const repairableDetails: any[] = [];

  for (const groupId in this.repairableDefects) {
    if (!this.repairableDefects.hasOwnProperty(groupId)) continue;

    const qtyMap = new Map<number, number>();

    for (const item of this.repairableDefects[groupId]) {
      const existing = qtyMap.get(item.defectId) || 0;
      qtyMap.set(item.defectId, existing + (item.count || 0));
    }

    qtyMap.forEach((qty, defectId) => {
      repairableDetails.push({
        groupId:  parseInt(groupId, 10),
        defectId: defectId,
        qty:      qty
      });
    });
  }

  // ── Reject Details ───────────────────────────
  const rejectDetails: any[] = [];

  for (const groupId in this.rejectDefects) {
    if (!this.rejectDefects.hasOwnProperty(groupId)) continue;

    const qtyMap = new Map<number, number>();

    for (const item of this.rejectDefects[groupId]) {
      const existing = qtyMap.get(item.defectId) || 0;
      qtyMap.set(item.defectId, existing + (item.count || 0));
    }

    qtyMap.forEach((qty, defectId) => {
      rejectDetails.push({
        groupId:  parseInt(groupId, 10),
        rejectId: defectId,
        qty:      qty
      });
    });
  }

  // ── Final Payload ────────────────────────────
  const payload = {
    master:           master,
    repairableDetails: repairableDetails,
    rejectDetails:     rejectDetails
  };

  console.log('QC Payload:', JSON.stringify(payload, null, 2));

  // ── HTTP Call ────────────────────────────────
  this.service.saveQCData(payload).subscribe({
    next: (res: any) => {
      this.isSaving = false;
      if (res?.isSuccess) {
        this.toastr.success(res.message || 'Saved successfully');
        this.resetValues();
      } else {
        this.toastr.error(res?.message || 'Failed to save');
      }
    },
    error: (err) => {
      this.isSaving = false;
      console.error('Save error:', err);
      this.toastr.error('Error occurred. Check console.');
    }
  });
}
 

//   saveQCData() {
//     debugger;
//     if (!this.batchHeader.batchNo) {
//       this.toastr.warning('Batch No required!');
//       return;
//     }

//     const master = {
//       createdBy: 'Admin',
//       unitId: this.batchHeader.unitId,
//       buyerId: this.batchHeader.buyerId,
//       styleId: this.batchHeader.styleId,
//       orderId: this.batchHeader.orderId,
//       jobId: this.batchHeader.jobId,
//       dressPartId: this.batchHeader.dressPartId,
//       uomId: this.batchHeader.uomId,

//       trackingNo: this.batchHeader.trackingNo,
//       batchNo: this.batchHeader.batchNo,
//       type: this.batchHeader.type,
//       color: this.batchHeader.color,
//       colorId: this.batchHeader.colorId,
//       date: this.batchHeader.date,

//       goodGarments: this.goodGarments,
//       repairable: this.repairable,
//       reject: this.reject,

//       machineIds: '',
//       processIds: ''
//     };

//     // const repairableMap = new Map<number, number>();
//     // for (const key in this.repairableDefects) {
//     //   if (this.repairableDefects.hasOwnProperty(key)) {
//     //     for (const x of this.repairableDefects[key]) {
//     //       const currentQty = repairableMap.get(x.defectId) || 0;
//     //       repairableMap.set(x.defectId, currentQty + (x.count || 0));
//     //     }
//     //   }
//     // }

//     // const repairableDetails = Array.from(repairableMap.entries()).map(([id, qty]) => ({
//     //   defectId: id,
//     //   qty: qty
//     // }));
//     const repairableDetails: any[] = [];

// for (const groupId in this.repairableDefects) {

//   if (this.repairableDefects.hasOwnProperty(groupId)) {

//     // Group-wise defect quantity map
//     const repairableMap = new Map<number, number>();

//     for (const item of this.repairableDefects[groupId]) {

//       const currentQty = repairableMap.get(item.defectId) || 0;

//       repairableMap.set(
//         item.defectId,
//         currentQty + (item.count || 0)
//       );
//     }

//     // Convert map to array with GroupId
//     repairableMap.forEach((qty, defectId) => {

//       repairableDetails.push({
//         groupId: groupId, // 0001 / 0002 / 0003
//         defectId: defectId,
//         qty: qty
//       });

//     });
//   }
// }

// console.log(repairableDetails);
// const rejectDetails: any[] = [];

// for (const groupId in this.rejectDefects) {

//   if (this.rejectDefects.hasOwnProperty(groupId)) {

//     // Group-wise reject defect quantity map
//     const rejectMap = new Map<number, number>();

//     for (const item of this.rejectDefects[groupId]) {

//       const currentQty = rejectMap.get(item.defectId) || 0;

//       rejectMap.set(
//         item.defectId,
//         currentQty + (item.count || 0)
//       );
//     }

//     // Convert map to array with GroupId
//     rejectMap.forEach((qty, defectId) => {

//       rejectDetails.push({
//         groupId: (groupId), // 0001 / 0002 / 0003
//         rejectId: defectId,
//         //defectId: defectId,
//         qty: qty
//       });

//     });
//   }
// }

// console.log(rejectDetails);
//     // const rejectMap = new Map<number, number>();
//     // for (const key in this.rejectDefects) {
//     //   if (this.rejectDefects.hasOwnProperty(key)) {
//     //     for (const x of this.rejectDefects[key]) {
//     //       const currentQty = rejectMap.get(x.defectId) || 0;
//     //       rejectMap.set(x.defectId, currentQty + (x.count || 0));
//     //     }
//     //   }
//     // }

//     // const rejectDetails = Array.from(rejectMap.entries()).map(([id, qty]) => ({
//     //   rejectId: id,
//     //   defectId: id,
//     //   qty: qty
//     // }));

//     const payload = {
//       master,
//       repairableDetails,
//       rejectDetails
//     };

//     console.log('Saving QC Data:', payload);

//     this.service.saveQCData(payload).subscribe({
//       next: (res: any) => {
//         if (res?.isSuccess) {
//           this.toastr.success(res.message || 'Data saved successfully');
//           this.resetValues();
//         } else {
//           this.toastr.error(res?.message || 'Failed to save data');
//         }
//       },
//       // error: (err) => {
//       //   console.error(err);
//       //   this.toastr.error('Error occurred while saving');
//       // }
//     });
//   }

  resetValues() {

    // 🔹 Header Reset
    this.batchHeader = {
      unitName: '',
      buyerName: '',
      trackingNo: '',
      batchNo: '',
      styleName: '',
      orderNo: '',
      jobNo: '',
      type: '',
      fabricationName: '',
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
    this.repairableDefects = {};
    this.rejectDefects = {};

    // 🔹 Dialog Close
    this.isShowRejectionDialog = false;
    this.isShowRepairableDialog = false;

    // 🔹 UI Refresh
    this.cdr.detectChanges();

    this.toastr.info('Form cleared');
  }
}