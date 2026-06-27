import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, FormBuilder } from '@angular/forms';
import { WashSetupService } from '../../../../../services/washsetup.service';
import { CommonServiceService } from '../../../../../services/common-service';
import { ToastrService } from 'ngx-toastr';
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

interface SizeModel {
  sizeId?: number;
  sizeName: string;
  qty: number;
  rejectQty: number;
}

@Component({
  selector: 'app-qc-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    RejectReasonComponent,
    DialogModule,
    TableModule,
    InputTextModule
  ],
  templateUrl: './qc-dashboard.component.html',
  styleUrl: './qc-dashboard.component.scss'
})
export class QcDashboardComponent {
  isResettotalInputValue=false;
  batchNo: string = '';

  batchHeader: BatchHeaderModel = {
    unitName: '', buyerName: '', trackingNo: '', batchNo: '',
    styleName: '', orderNo: '', jobNo: '', type: '',
    fabricationName: '', color: '', dressPart: '', uom: '', date: ''
  };

  // ── Counters ─────────────────────────────────
  repairableCount      = 0;
  repairableLength     = 0;
  rejectCount          = 0;
  rejectLength         = 0;
  goodGarments         = 0;
  repairable           = 0;
  reject               = 0;
  baseGoodGarments     = 0;

  // ── Total inputs from child dialogs ──────────
  repairableTotalInput = 0;
  rejectTotalInput     = 0;

  // ── Dialog Flags ─────────────────────────────
  isShowRejectionDialog  = false;
  isShowRepairableDialog = false;
  sizePopupVisible       = false;

  loading  = false;
  isSaving = false;

  repairableDefects: Record<string, any[]> = {};
  rejectDefects:     Record<string, any[]> = {};

  // ── Size List ────────────────────────────────
  sizeList: SizeModel[] = [];

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  // ── Size Popup ───────────────────────────────
  showSizePopup() {
    this.sizePopupVisible = true;
  }

  // confirmSizeSelection() {
  //   this.toastr.success('Size reject qty updated');
  //   this.sizePopupVisible = false;
  // }
confirmSizeSelection() {
  // ── Each size: rejectQty cannot exceed qty ──
  const overLimit = this.sizeList.find(s => s.rejectQty > s.qty);
  if (overLimit) {
    this.toastr.error(
      `"${overLimit.sizeName}" reject qty (${overLimit.rejectQty}) exceeds available qty (${overLimit.qty})`,
      'Invalid Reject Qty'
    );
    return;
  }

  // ── Total size reject must equal total reject input ──
  if (this.totalRejectQty !== this.rejectTotalInput) {
    this.toastr.warning(
      `Total size-wise reject qty (${this.totalRejectQty}) must equal total reject input (${this.rejectTotalInput})`,
      'Mismatch'
    );
    return;
  }

  this.toastr.success('Size reject qty confirmed');
  this.sizePopupVisible = false;
}
onSizeRejectChange(row: SizeModel) {
  if (row.rejectQty < 0) {
    row.rejectQty = 0;
  }
  if (row.rejectQty > row.qty) {
    row.rejectQty = row.qty;
    this.toastr.warning(
      `Max reject for "${row.sizeName}" is ${row.qty}`,
      'Limit Reached'
    );
  }
}


  get totalQty(): number {
    return this.sizeList.reduce((sum, r) => sum + (r.qty || 0), 0);
  }

  get totalRejectQty(): number {
    return this.sizeList.reduce((sum, r) => sum + (r.rejectQty || 0), 0);
  }

  // ── Load Batch Data ──────────────────────────
  // loadBatchData() {
   
  //   if (!this.batchNo?.trim()) return;

  //   this.loading = true;

  //   this.service.getBatchWishQCDataList(this.batchNo).subscribe({
  //     next: (res: any) => {

  //       const data = res?.header;

  //       if (!data) {
  //         this.resetValues();
  //         this.toastr.warning('No data found!');
  //         return;
  //       }

  //       this.batchHeader = {
  //         unitId:          data.unitId,
  //         buyerId:         data.buyerId,
  //         styleId:         data.styleId,
  //         orderId:         data.orderId,
  //         jobId:           data.jobId,
  //         dressPartId:     data.dressPartId,
  //         uomId:           data.uomId,
  //         fabricationId:   data.fabricationId,
  //         colorId:         data.colorId,
  //         unitName:        data.unitName        ?? '',
  //         buyerName:       data.buyerName       ?? '',
  //         trackingNo:      data.trackingNo      ?? '',
  //         batchNo:         data.batchNo         ?? '',
  //         styleName:       data.styleName       ?? '',
  //         orderNo:         data.orderNo         ?? '',
  //         jobNo:           data.jobNo           ?? '',
  //         type:            data.type            ?? '',
  //         fabricationName: data.fabricationName ?? '',
  //         color:           data.color           ?? '',
  //         dressPart:       data.dressPart       ?? '',
  //         uom:             data.uom             ?? '',
  //         date:            data.prepareDate     ?? ''
  //       };

  //       this.baseGoodGarments = data.goodGarments ?? 0;
  //       this.goodGarments     = this.baseGoodGarments;

  //       this.sizeList = (res?.sizeList ?? []).map((s: any) => ({
  //         sizeId:    s.sizeId    ?? 0,
  //         sizeName:  s.sizeName  ?? '',
  //         qty:       s.qty       ?? 0,
  //         rejectQty: s.rejectQty ?? 0
  //       }));

  //       this.cleanTrackingNo();
  //     },
  //     error: () => {
  //       this.toastr.error('Failed to load batch data');
  //       this.resetValues();
  //     },
  //     complete: () => {
  //       this.loading = false;
  //     }
  //   });
  // }
loadBatchData() {
  if (!this.batchNo?.trim()) return;

  this.loading = true;

  this.service.getBatchWishQCDataList(this.batchNo).subscribe({
    next: (res: any) => {

      // 🔥 Save batchNo before reset, restore after
      const currentBatchNo = this.batchNo;
      //this.resetValues();
      this.batchNo = currentBatchNo;

      const data = res?.header;

      if (!data) {
        this.toastr.warning('No data found!');
        return;
      }

      this.batchHeader = {
        unitId:          data.unitId,
        buyerId:         data.buyerId,
        styleId:         data.styleId,
        orderId:         data.orderId,
        jobId:           data.jobId,
        dressPartId:     data.dressPartId,
        uomId:           data.uomId,
        fabricationId:   data.fabricationId,
        colorId:         data.colorId,
        unitName:        data.unitName        ?? '',
        buyerName:       data.buyerName       ?? '',
        trackingNo:      data.trackingNo      ?? '',
        batchNo:         data.batchNo         ?? '',
        styleName:       data.styleName       ?? '',
        orderNo:         data.orderNo         ?? '',
        jobNo:           data.jobNo           ?? '',
        type:            data.type            ?? '',
        fabricationName: data.fabricationName ?? '',
        color:           data.color           ?? '',
        dressPart:       data.dressPart       ?? '',
        uom:             data.uom             ?? '',
        date:            data.prepareDate     ?? ''
      };

      this.baseGoodGarments = data.goodGarments ?? 0;
      this.goodGarments     = this.baseGoodGarments;

      this.sizeList = (res?.sizeList ?? []).map((s: any) => ({
        sizeId:    s.sizeId    ?? 0,
        sizeName:  s.sizeName  ?? '',
        qty:       s.qty       ?? 0,
        rejectQty: s.rejectQty ?? 0
      }));

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
  cleanTrackingNo() {
    this.batchNo = '';
  }

  // ── Recalculate from +/- buttons only ────────
  private recalculateGood() {
    this.goodGarments = this.baseGoodGarments
      - (this.repairableTotalInput || 0)
      - (this.rejectTotalInput     || 0);
    if (this.goodGarments < 0) this.goodGarments = 0;
  }

  // ── Recalculate from total inputs ────────────
  private recalculateGoodFromInputs() {
    this.goodGarments = this.baseGoodGarments
      - (this.repairableTotalInput || 0)
      - (this.rejectTotalInput     || 0);
    if (this.goodGarments < 0) this.goodGarments = 0;
    this.cdr.detectChanges();
  }

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

  // ── Dialogs ──────────────────────────────────
  showRepairableDialog() { this.isShowRepairableDialog = true; }
  showRejectionDialog()  { this.isShowRejectionDialog  = true; }

  // ── Total input events from child dialogs ────
  onRepairableTotalChange(val: number) {
    this.repairableTotalInput = val ?? 0;
    this.repairable           = this.repairableTotalInput;
    this.recalculateGoodFromInputs();
  }

  onRejectTotalChange(val: number) {
    this.rejectTotalInput = val ?? 0;
    this.reject           = this.rejectTotalInput;
    this.recalculateGoodFromInputs();
  }

  // ── Confirm from child dialogs ───────────────
  handleReparableData(data: any) {
    this.repairableDefects      = data;
    this.isShowRepairableDialog = false;
    this.cdr.detectChanges();
  }

  handleRejectionData(data: any) {
    this.rejectDefects         = data;
    this.isShowRejectionDialog = false;
    this.cdr.detectChanges();
  }

  // ── Remove defect items ──────────────────────
  removeDefect(groupKey: any, index: number) {
    const key = groupKey as string;
    this.repairableDefects[key].splice(index, 1);
    if (this.repairableDefects[key].length === 0) delete this.repairableDefects[key];
    this.repairableDefects = { ...this.repairableDefects };
  }

  removeReject(groupKey: any, index: number) {
    const key = groupKey as string;
    this.rejectDefects[key].splice(index, 1);
    if (this.rejectDefects[key].length === 0) delete this.rejectDefects[key];
    this.rejectDefects = { ...this.rejectDefects };
  }

  // ── Save ─────────────────────────────────────
  saveQCData() {
    debugger;
    if (!this.batchHeader.batchNo) {
      this.toastr.warning('Please load a batch first!');
      return;
    }
    if (this.goodGarments < 0) {
      this.toastr.warning('Good garments cannot be negative!');
      return;
    }

    this.isSaving = true;

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
      repairable:   this.repairableTotalInput,
      reject:       this.rejectTotalInput,
      machineIds:   '0',
      processIds:   '0'
    };

    const repairableDetails: any[] = [];
    for (const groupId in this.repairableDefects) {
      if (!this.repairableDefects.hasOwnProperty(groupId)) continue;
      const qtyMap = new Map<number, number>();
      for (const item of this.repairableDefects[groupId]) {
        qtyMap.set(item.defectId, (qtyMap.get(item.defectId) || 0) + (item.count || 0));
      }
      qtyMap.forEach((qty, defectId) => {
        repairableDetails.push({ groupId: parseInt(groupId, 10), defectId, qty });
      });
    }

    const rejectDetails: any[] = [];
    for (const groupId in this.rejectDefects) {
      if (!this.rejectDefects.hasOwnProperty(groupId)) continue;
      const qtyMap = new Map<number, number>();
      for (const item of this.rejectDefects[groupId]) {
        qtyMap.set(item.defectId, (qtyMap.get(item.defectId) || 0) + (item.count || 0));
      }
      qtyMap.forEach((qty, defectId) => {
        rejectDetails.push({ groupId: parseInt(groupId, 10), rejectId: defectId, qty });
      });
    }

    // Size-wise reject details
    const sizeDetails = this.sizeList
      .filter(s => s.rejectQty > 0)
      .map(s => ({
        sizeId:    s.sizeId    ?? 0,
        sizeName:  s.sizeName,
        qty:       s.qty,
        rejectQty: s.rejectQty
      }));

    const payload = { master, repairableDetails, rejectDetails, sizeDetails };
    console.log('QC Payload:', JSON.stringify(payload, null, 2));

    this.service.saveQCData(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Saved successfully');
          this.isResettotalInputValue=true;
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

  // ── Reset ─────────────────────────────────────
  resetValues(silent: boolean = false) {
  this.isResettotalInputValue=true;
  this.batchHeader = {
    unitName: '', buyerName: '', trackingNo: '', batchNo: '',
    styleName: '', orderNo: '', jobNo: '', type: '',
    fabricationName: '', color: '', dressPart: '', uom: '', date: ''
  };

  this.batchNo              = '';
  this.goodGarments         = 0;
  this.baseGoodGarments     = 0;
  this.repairable           = 0;
  this.reject               = 0;
  this.repairableLength     = 0;
  this.rejectLength         = 0;
  this.repairableCount      = 0;
  this.rejectCount          = 0;
  this.repairableTotalInput = 0;
  this.rejectTotalInput     = 0;
  this.repairableDefects    = {};
  this.rejectDefects        = {};
  this.sizeList             = [];

  this.isShowRejectionDialog  = false;
  this.isShowRepairableDialog = false;
  this.sizePopupVisible       = false;
  this.cdr.detectChanges();
  
  //this.totalInputValue = undefined;
  // 🔥 Only show toastr when user manually resets
  if (!silent) this.toastr.info('Form cleared');
}
  // resetValues() {
  //   this.batchHeader = {
  //     unitName: '', buyerName: '', trackingNo: '', batchNo: '',
  //     styleName: '', orderNo: '', jobNo: '', type: '',
  //     fabricationName: '', color: '', dressPart: '', uom: '', date: ''
  //   };

  //   this.batchNo              = '';
  //   this.goodGarments         = 0;
  //   this.baseGoodGarments     = 0;
  //   this.repairable           = 0;
  //   this.reject               = 0;
  //   this.repairableLength     = 0;
  //   this.rejectLength         = 0;
  //   this.repairableCount      = 0;
  //   this.rejectCount          = 0;
  //   this.repairableTotalInput = 0;
  //   this.rejectTotalInput     = 0;
  //   this.repairableDefects    = {};
  //   this.rejectDefects        = {};
  //   this.sizeList             = [];

  //   this.isShowRejectionDialog  = false;
  //   this.isShowRepairableDialog = false;
  //   this.sizePopupVisible       = false;

  //   this.cdr.detectChanges();
  //   this.toastr.info('Form cleared');
  // }
}