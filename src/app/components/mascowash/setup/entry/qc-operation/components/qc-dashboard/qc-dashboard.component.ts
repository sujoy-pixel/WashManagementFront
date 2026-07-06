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
  debugger;
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

  // FIX · Changed type from Record<string, any[]> to Record<string, any>
  // to support BOTH formats:
  //   - Old: array of defects  →  group = [ {defectId, name, count, ...}, ... ]
  //   - New: object with total  →  group = { groupTotal: number, items: [...] }
  // The Array.isArray() checks in removeDefect/removeReject/saveQCData
  // handle both formats at runtime.
  repairableDefects: Record<string, any> = {};
  rejectDefects:     Record<string, any> = {};

  // ════════════════════════════════════════════════════════════
  //  NEW · Deduct amounts — when a whole defect group is removed
  //  (last item X-clicked), the parent sets this to the group's
  //  total. The child picks it up via ngOnChanges and reduces its
  //  accumulatedTotal to stay in sync.
  // ════════════════════════════════════════════════════════════
  repairableDeductAmount: number = 0;
  rejectDeductAmount: number = 0;
// ── QC Confirm Dialog ─────────────────────────
qcConfirmVisible    = false;
pendingBatchRes: any = null;   // holds the API response while user decides
qcLastSavedInfo     = '';      // shown as subtitle in the dialog
  // ── Size List ────────────────────────────────
  sizeList: SizeModel[] = [];

  // ════════════════════════════════════════════════════════════
  //  NEW · Keypad Feature (matches reference image)
  //  - Light brown window, white keys, CLR / OK / Close
  //  - Adds the typed number to Good Garments on OK
  // ════════════════════════════════════════════════════════════
  keypadVisible: boolean = false;        // controls keypad dialog visibility
  keypadInputValue: string = '';         // raw string being typed on keypad

  /** Total inspected = good + repairable + reject (matches reference) */
  get totalInspected(): number {
    return this.goodGarments + this.repairable + this.reject;
  }

  /** Open the keypad popup */
  openKeypad() {
    this.keypadInputValue = '';
    this.keypadVisible = true;
  }

  /** Handle a single keypad key press */
  onKeypadKey(key: string) {
    switch (key) {
      case 'backspace':
        this.keypadInputValue = this.keypadInputValue.slice(0, -1);
        break;

      case 'clr':
        this.keypadInputValue = '';
        break;

      case '.':
        // prevent multiple dots
        if (this.keypadInputValue.includes('.')) return;
        // auto-prefix 0 if dot is first
        this.keypadInputValue = this.keypadInputValue === ''
          ? '0.'
          : this.keypadInputValue + '.';
        break;

      default:
        // digit
        // prevent leading zeros like "00" or "01"
        if (this.keypadInputValue === '0') {
          this.keypadInputValue = key;
          return;
        }
        // limit to 6 digits before dot
        const intPart = this.keypadInputValue.split('.')[0];
        if (intPart.length >= 6) return;
        this.keypadInputValue += key;
        break;
    }
  }

  /** OK — commit the entered value to Good Garments */
  onKeypadOk() {
    const val = parseFloat(this.keypadInputValue);

    if (isNaN(val) || val <= 0) {
      this.toastr.warning('Please enter a valid number greater than 0', 'Invalid Input');
      return;
    }

    // Add to baseGoodGarments and recalc (preserves existing +/- and repair/reject logic)
    this.baseGoodGarments += val;
    this.recalculateGood();

    this.toastr.success(
      `Added ${val} to Good Garments. New total: ${this.goodGarments}`,
      'Keypad Entry'
    );

    this.keypadVisible = false;
    this.keypadInputValue = '';
    this.cdr.detectChanges();
  }

  /** Close — discard keypad input */
  onKeypadClose() {
    this.keypadVisible = false;
    this.keypadInputValue = '';
  }
  // ════════════════════════════════════════════════════════════

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
  debugger;
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

  const totalRejectQty = Number(this.totalRejectQty);
const rejectTotalInput = Number(this.rejectTotalInput);

if (totalRejectQty !== rejectTotalInput) {
  this.toastr.warning(
    `Total size-wise reject qty (${totalRejectQty}) must equal total reject input (${rejectTotalInput})`,
    'Mismatch'
  );
  return;
}
  // if (this.totalRejectQty !== this.rejectTotalInput) {
  //   this.toastr.warning(
  //     `Total size-wise reject qty (${this.totalRejectQty}) must equal total reject input (${this.rejectTotalInput})`,
  //     'Mismatch'
  //   );
  //   return;
  // }

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
loadBatchData() {
  debugger;
  if (!this.batchNo?.trim()) return;

  this.loading = true;
  const currentBatchNo = this.batchNo;

  this.service.getBatchWishQCDataList(this.batchNo).subscribe({
    next: (res: any) => {
      this.resetValuess();
      this.batchNo = currentBatchNo;
      // this.isResettotalInputValue=true;
      const data = res?.header;
      if (!data) {
        this.toastr.warning('No data found!');
        this.loading = false;
        return;
      }

      if (data.isQCSaved === true) {
        // Store response, show custom dialog — no confirm()
        this.pendingBatchRes  = res;
        this.qcLastSavedInfo  = data.savedBy
          ? `Last saved by ${data.savedBy}`
          : 'QC data has already been recorded for this batch.';
        this.qcConfirmVisible = true;
        this.loading = false;
        return;
      }

      this.applyBatchData(res);
    },
    error: () => {
      this.toastr.error('Failed to load batch data');
      this.resetValues();
      this.loading = false;
    },
    complete: () => {
      this.loading = false;
    }
  });
}

// Called when user confirms modification, or when isQCSaved is false
private applyBatchData(res: any) {
  const data = res?.header;

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

  this.sizeList = (res?.sizeList ?? [])
    .filter((s: any) => s.sizeId && s.sizeId !== 0)
    .map((s: any) => ({
      sizeId:    s.sizeId,
      sizeName:  s.sizeName  ?? '',
      qty:       s.qty       ?? 0,
      rejectQty: s.rejectQty ?? 0
    }));

  this.cleanTrackingNo();
}

// Dialog — user clicks "Modify QC Data"
onQcConfirmModify() {
  this.qcConfirmVisible = false;
  this.applyBatchData(this.pendingBatchRes);
  this.pendingBatchRes = null;
}

// Dialog — user clicks "Cancel"
onQcConfirmCancel() {
  this.qcConfirmVisible = false;
  this.pendingBatchRes  = null;
  this.resetValuess();
  this.batchNo = '';
}
// loadBatchData() {
//   debugger;
//   if (!this.batchNo?.trim()) return;

//   this.loading = true;

//   this.service.getBatchWishQCDataList(this.batchNo).subscribe({
//     next: (res: any) => {
     
//       // 🔥 Save batchNo before reset, restore after
//       const currentBatchNo = this.batchNo;
//       this.resetValuess();
//       this.batchNo = currentBatchNo;

//       const data = res?.header;

//       if (!data) {
//         this.toastr.warning('No data found!');
//         return;
//       }
//       debugger;
//       if (data.isQCSaved === true) {
//         const userConfirmed = confirm('QC Data is already added for this batch. Do you want to modify it?');
        
//         // If user clicks "Cancel", abort loading
//         if (!userConfirmed) {
//           this.resetValuess();
//           this.batchNo = '';
//           return;
//         }
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
// this.sizeList = (res?.sizeList ?? [])
//   .filter((s: any) => s.sizeId && s.sizeId !== 0)
//   .map((s: any) => ({
//     sizeId: s.sizeId,
//     sizeName: s.sizeName ?? '',
//     qty: s.qty ?? 0,
//     rejectQty: s.rejectQty ?? 0
//   }));

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

  // ════════════════════════════════════════════════════════════
  //  ENHANCED · Remove defect items — now handles group-total deduction.
  //  When the LAST item in a group is removed (group becomes empty):
  //  1. Read the group's stored groupTotal
  //  2. Subtract it from repairableTotalInput
  //  3. Update repairable counter
  //  4. Tell the child to reduce its accumulatedTotal (via deductAmount)
  //  5. Recalculate good garments (adds back to good)
  //  Also handles backward compat: if group is an array (old format),
  //  use it directly; if it's {groupTotal, items}, use .items.
  // ════════════════════════════════════════════════════════════
  removeDefect(groupKey: any, index: number) {
    const key = groupKey as string;
    const group = this.repairableDefects[key];
    if (!group) return;

    // Backward compat: group may be array (old) or {groupTotal, items} (new)
    const items = Array.isArray(group) ? group : (group.items || []);
    items.splice(index, 1);

    if (items.length === 0) {
      // Group is now empty — read groupTotal and deduct
      const groupTotal = Array.isArray(group) ? 0 : (group.groupTotal || 0);
      delete this.repairableDefects[key];

      if (groupTotal > 0) {
        // Subtract from repairable total
        this.repairableTotalInput = Math.max(0, this.repairableTotalInput - groupTotal);
        this.repairable = this.repairableTotalInput;

        // Tell child to reduce its accumulatedTotal
        this.repairableDeductAmount = groupTotal;

        // Recalculate good garments (will add back)
        this.recalculateGood();

        // Reset deduct amount asynchronously so next deduction is detected
        setTimeout(() => {
          this.repairableDeductAmount = 0;
        }, 100);
      }
    }

    this.repairableDefects = { ...this.repairableDefects };
    this.cdr.detectChanges();
  }

  removeReject(groupKey: any, index: number) {
    const key = groupKey as string;
    const group = this.rejectDefects[key];
    if (!group) return;

    // Backward compat: group may be array (old) or {groupTotal, items} (new)
    const items = Array.isArray(group) ? group : (group.items || []);
    items.splice(index, 1);

    if (items.length === 0) {
      // Group is now empty — read groupTotal and deduct
      const groupTotal = Array.isArray(group) ? 0 : (group.groupTotal || 0);
      delete this.rejectDefects[key];

      if (groupTotal > 0) {
        // Subtract from reject total
        this.rejectTotalInput = Math.max(0, this.rejectTotalInput - groupTotal);
        this.reject = this.rejectTotalInput;

        // Tell child to reduce its accumulatedTotal
        this.rejectDeductAmount = groupTotal;

        // Recalculate good garments (will add back)
        this.recalculateGood();

        // Reset deduct amount asynchronously so next deduction is detected
        setTimeout(() => {
          this.rejectDeductAmount = 0;
        }, 100);
      }
    }

    this.rejectDefects = { ...this.rejectDefects };
    this.cdr.detectChanges();
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
      // FIX · handle new {groupTotal, items} structure (and old array for backward compat)
      const group = this.repairableDefects[groupId];
      const items = Array.isArray(group) ? group : (group.items || []);
      const qtyMap = new Map<number, number>();
      for (const item of items) {
        qtyMap.set(item.defectId, (qtyMap.get(item.defectId) || 0) + (item.count || 0));
      }
      qtyMap.forEach((qty, defectId) => {
        repairableDetails.push({ groupId: parseInt(groupId, 10), defectId, qty });
      });
    }

    const rejectDetails: any[] = [];
    for (const groupId in this.rejectDefects) {
      if (!this.rejectDefects.hasOwnProperty(groupId)) continue;
      // FIX · handle new {groupTotal, items} structure (and old array for backward compat)
      const group = this.rejectDefects[groupId];
      const items = Array.isArray(group) ? group : (group.items || []);
      const qtyMap = new Map<number, number>();
      for (const item of items) {
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

  // NEW · reset deduct amounts
  this.repairableDeductAmount = 0;
  this.rejectDeductAmount     = 0;
  // NEW · reset keypad state
  this.keypadVisible        = false;
  this.keypadInputValue     = '';

  this.isShowRejectionDialog  = false;
  this.isShowRepairableDialog = false;
  this.sizePopupVisible       = false;
  this.cdr.detectChanges();

  // ════════════════════════════════════════════════════════════
  //  FIX · Reset the flag back to false AFTER the child has had a
  //  chance to detect the true→false→true cycle. Without this,
  //  the flag stays true and subsequent saves/refreshes don't
  //  trigger ngOnChanges in the child (because true→true is not
  //  a change). The setTimeout ensures Angular has already
  //  propagated the `true` to the child before we reset it.
  // ════════════════════════════════════════════════════════════
  setTimeout(() => {
    this.isResettotalInputValue = false;
  }, 100);

  //this.totalInputValue = undefined;
  // 🔥 Only show toastr when user manually resets
  //if (!silent) this.toastr.info('Form cleared');
}
 resetValuess(): void {
  // Header
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

  // Batch Information
  this.batchNo = '';

  // Garments
  this.goodGarments = 0;
  this.baseGoodGarments = 0;

  // Repairable
  this.repairable = 0;
  this.repairableLength = 0;
  this.repairableCount = 0;
  this.repairableTotalInput = 0;

  // Reject
  this.reject = 0;
  this.rejectLength = 0;
  this.rejectCount = 0;
  this.rejectTotalInput = 0;

  // Defect Objects
  this.repairableDefects = {};
  this.rejectDefects = {};

  // NEW · reset deduct amounts
  this.repairableDeductAmount = 0;
  this.rejectDeductAmount = 0;

  // Size List
  this.sizeList = [];
  // NEW · reset keypad state
  this.keypadVisible        = false;
  this.keypadInputValue     = '';

  // NEW · tell child components to reset their accumulated totals
  this.isResettotalInputValue = true;

  // Dialogs
  this.isShowRejectionDialog = false;
  this.isShowRepairableDialog = false;
  this.sizePopupVisible = false;

  // Refresh UI
  this.cdr.detectChanges();

  // ════════════════════════════════════════════════════════════
  //  FIX · Reset the flag back to false AFTER the child detects it.
  //  Same pattern as resetValues() — see comment there for details.
  // ════════════════════════════════════════════════════════════
  setTimeout(() => {
    this.isResettotalInputValue = false;
  }, 100);
}
}
