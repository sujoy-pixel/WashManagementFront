import { Component, Input, Output, EventEmitter, OnInit, output, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { WashSetupService } from 'src/app/components/mascowash/services/washsetup.service';
import { CommonServiceService } from 'src/app/components/mascowash/services/common-service';
import { ToastrService } from 'ngx-toastr';

let repairableColorIndex = 0;
let rejectColorIndex = 0;

interface DefectItem {
  defectId: number;
  name: string;
  count: number;
  isFlipped: boolean;
  isEdit: boolean;
}

@Component({
  selector: 'app-reject-reason',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, FormsModule],
  templateUrl: './reject-reason.component.html',
  styleUrl: './reject-reason.component.scss'
})
export class RejectReasonComponent implements OnInit {

  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() type: string = '';
  @Input() isResettotalInputValue: boolean = false;

  // ════════════════════════════════════════════════════════════
  //  NEW · deductAmount — when parent removes a whole group, it sets
  //  this to the group's total. The child reduces its accumulatedTotal
  //  so they stay in sync (prevents desync when dialog reopens).
  // ════════════════════════════════════════════════════════════
  @Input() deductAmount: number = 0;

  @Output() visibleChange   = new EventEmitter<boolean>();
  @Output() confirmReject   = new EventEmitter<any[]>();
  @Output() onConfirm       = new EventEmitter<any>();

  // 🔥 NEW — emits total count to parent for good garments subtraction
  @Output() totalCountChange = new EventEmitter<number>();

  @Input() groupedDefects: any = {};
 
  items: DefectItem[] = [];
  dataList: any[] = [];

  totalInputValue: number | undefined =undefined; // 🔥 bound to header input

  // ════════════════════════════════════════════════════════════
  //  NEW · Running total accumulation across multiple OK clicks
  //  - accumulatedTotal: sum of all confirmed Total input values
  //  - lastAddedValue:   the most recently added value (for display)
  // ════════════════════════════════════════════════════════════
  accumulatedTotal: number = 0;
  lastAddedValue: number = 0;

  mainModalVisible: boolean = false;
  isMaximized: boolean = false;
  groupCounter = 1;

  /** NEW · Live combined total = accumulated + current entry being typed */
  get liveGrandTotal(): number {
    return this.accumulatedTotal + (this.totalInputValue || 0);
  }

  // ════════════════════════════════════════════════════════════
  //  Card sum validation — REVERSED logic per latest request:
  //  - PASS when card sum === total (matched)
  //  - PASS when card sum >  total (exceeds)
  //  - BLOCK when card sum <  total (below) — show "must match or more"
  // ════════════════════════════════════════════════════════════
  /** Sum of all selected card counts */
  get cardSum(): number {
    return this.items.reduce((sum, x) => sum + (x.count || 0), 0);
  }

  /** How much the card sum exceeds the total input (0 if not exceeding) */
  get exceedsBy(): number {
    const total = this.totalInputValue || 0;
    return Math.max(0, this.cardSum - total);
  }

  /** How much the card sum is short of the total input (0 if not short) */
  get shortBy(): number {
    const total = this.totalInputValue || 0;
    return Math.max(0, total - this.cardSum);
  }

  /** True when card sum > total input (VALID — exceeds is allowed) */
  get isCardSumExceedsTotal(): boolean {
    const total = this.totalInputValue || 0;
    if (total <= 0) return false;
    return this.cardSum > total;
  }

  /** True when card sum === total input (VALID — exact match) */
  get isCardSumMatched(): boolean {
    const total = this.totalInputValue || 0;
    if (total <= 0) return false;
    return this.cardSum === total;
  }

  /** True when card sum < total input (INVALID — must match or more) */
  get isCardSumBelowTotal(): boolean {
    const total = this.totalInputValue || 0;
    if (total <= 0) return false;
    return this.cardSum < total;
  }

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    console.log('IsResettotalInputValue: '+this.isResettotalInputValue)
    this.loadData();
  }
  ngOnChanges(changes: SimpleChanges): void { 
    if (changes['isResettotalInputValue']) {
      if (changes['isResettotalInputValue'].currentValue === true) {
        // ════════════════════════════════════════════════════════════
        //  FIX · Full reset — clear ALL child state when parent saves
        //  or refreshes. Previously only cleared totalInputValue,
        //  leaving cards, groupedDefects, and groupCounter dirty.
        // ════════════════════════════════════════════════════════════
        this.resetAll();
      }
      console.log('Current:', changes['isResettotalInputValue'].currentValue);
      console.log('Previous:', changes['isResettotalInputValue'].previousValue);
      console.log('Variable:', this.isResettotalInputValue);
    }

    // ════════════════════════════════════════════════════════════
    //  NEW · Handle deductAmount — parent tells child to reduce its
    //  accumulatedTotal when a whole group is removed from the display.
    //  This keeps the child in sync so reopening the dialog doesn't
    //  re-emit the old (pre-removal) total.
    // ════════════════════════════════════════════════════════════
    if (changes['deductAmount']) {
      const newDeduct = changes['deductAmount'].currentValue;
      if (newDeduct && newDeduct > 0) {
        this.accumulatedTotal = Math.max(0, this.accumulatedTotal - newDeduct);
        // Emit the reduced total so parent stays in sync
        this.totalCountChange.emit(this.accumulatedTotal);
      }
    }
  }

  /**
   * FIX · Comprehensive reset — clears every piece of child state.
   * Called when parent saves, refreshes, or loads a new batch.
   */
  resetAll(): void {
    // Clear total input
    this.totalInputValue = undefined;

    // Clear accumulated running total
    this.accumulatedTotal = 0;
    this.lastAddedValue = 0;

    // Reset all defect cards to 0
    if (this.items && this.items.length > 0) {
      this.items.forEach(x => {
        x.count = 0;
        x.isFlipped = false;
        x.isEdit = false;
      });
    }

    // Clear grouped defects (the confirmed groups shown in parent)
    this.groupedDefects = {};

    // Reset group counter
    this.groupCounter = 1;

    // Note: do NOT set isResettotalInputValue = false here.
    // The parent owns that flag and will reset it asynchronously.
    // This ensures subsequent saves trigger ngOnChanges correctly.
  }

  // ════════════════════════════════════════════════════════════
  //  ENHANCED · enableEdit now also focuses + selects the input
  //  so a single click on the count value lets the user type
  //  a new number immediately (replacing the "0").
  //  Backward-compatible: `side` defaults to 'front'.
  // ════════════════════════════════════════════════════════════
  enableEdit(item: any, side: 'front' | 'back' = 'front') {
    item.isEdit = true;

    // Wait one tick for Angular to render the <input>, then focus + select it.
    // The `data-edit-side` + `data-defect-id` attributes on the input
    // let us target the exact input that was just revealed.
    setTimeout(() => {
      const selector = `input[data-edit-side="${side}"][data-defect-id="${item.defectId}"]`;
      const input = document.querySelector<HTMLInputElement>(selector);
      if (input) {
        input.focus();
        input.select();   // ← auto-selects "0" so typing replaces it
      }
    }, 0);
  }
  // ════════════════════════════════════════════════════════════

  /**
   * NEW · Called when the in-place edit input receives focus.
   * Casts $event.target to HTMLInputElement so TypeScript strict mode
   * is happy, then selects all text so the user can immediately type
   * over the existing value (e.g. the default "0").
   */
  onCountInputFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.select();
    }
  }

  /**
   * NEW · Block all non-digit keys so the user can only enter numbers.
   * Allows: 0-9, Backspace, Delete, Tab, Enter, Escape, arrow keys,
   * Home, End, and any Ctrl/Cmd combo (copy/paste/select-all).
   * Blocks: letters, symbols, decimal point, minus sign, 'e' (scientific).
   */
  onCountInputKeydown(event: KeyboardEvent): void {
    // Always allow Ctrl/Cmd combos (Ctrl+A, Ctrl+C, Ctrl+V, etc.)
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    // Allow common edit / navigation keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    // Allow single digit characters only (0-9)
    if (/^[0-9]$/.test(event.key)) {
      return;
    }
    // Block everything else
    event.preventDefault();
  }

  /**
   * NEW · Safety net — strips any non-digit characters that slip past
   * the keydown handler (e.g. content pasted from clipboard).
   * Updates the DOM input value directly so the user sees only digits.
   */
  onCountInputInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const cleaned = input.value.replace(/[^0-9]/g, '');
    if (input.value !== cleaned) {
      input.value = cleaned;
    }
  }

  saveCount(item: any, event: any) {
    // ── Strip non-digits (defensive — already blocked by keydown) ──
    const raw = (event.target.value ?? '').toString();
    const cleaned = raw.replace(/[^0-9]/g, '');
    // ── parseInt naturally strips leading zeros: "0123" → 123, "007" → 7, "00" → 0
    // ── Empty input → 0
    const value = cleaned === '' ? 0 : parseInt(cleaned, 10);
    if (!isNaN(value)) item.count = value;
    item.isEdit = false;
  }

  loadData() {
    this.service.getFaultNameList().subscribe({
      next: (res: any) => {
        this.dataList = res ?? [];
        this.items = this.dataList.map((x: any) => ({
          defectId: x.faultNameId || x.FaultNameId,
          name:     x.faultName   || x.FaultName,
          count:    0,
          isFlipped: false,
          isEdit:    false
        }));
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load Fault Name data');
      }
    });
  }

  showDialog() {
    this.visible = true;
    this.visibleChange.emit(true);
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // ════════════════════════════════════════════════════════════
  //  FIX · Total input change handler — completely rewritten to fix
  //  the backspace bug. Key changes:
  //  1. When input is empty, set totalInputValue = undefined (NOT 0).
  //     This prevents [(ngModel)] from writing "0" back into the input.
  //  2. Sanitize pasted content by stripping non-digits.
  //  3. Emit combined total (accumulated + current) to parent.
  // ════════════════════════════════════════════════════════════
  onTotalInputChange(value: number | string) {
    // Convert to string and strip ALL non-digit characters (handles paste)
    const rawStr = (value ?? '').toString();
    const cleaned = rawStr.replace(/[^0-9]/g, '');

    if (cleaned === '') {
      // Input is empty (user pressed backspace/delete) — set to undefined
      // so [ngModel] displays empty string, NOT "0"
      this.totalInputValue = undefined;
    } else {
      // parseInt strips leading zeros: "0123" → 123
      this.totalInputValue = parseInt(cleaned, 10);
    }

    // Emit combined total to parent
    const combined = this.accumulatedTotal + (this.totalInputValue || 0);
    this.totalCountChange.emit(combined);
  }

  // ════════════════════════════════════════════════════════════
  //  NEW · Same digits-only + auto-select treatment for the Total input
  // ════════════════════════════════════════════════════════════
  onTotalInputKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) return;
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
    ];
    if (allowedKeys.includes(event.key)) return;
    if (/^[0-9]$/.test(event.key)) return;
    event.preventDefault();
  }

  onTotalInputInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const cleaned = input.value.replace(/[^0-9]/g, '');
    if (input.value !== cleaned) {
      input.value = cleaned;
    }
  }

  onTotalInputFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) input.select();
  }
  // ════════════════════════════════════════════════════════════

  increase(item: DefectItem) {
    const previous = item.count;
    item.count++;
    if (previous === 0 && item.count === 1) item.isFlipped = true;
  }

  decrease(item: DefectItem) {
    if (item.count === 0) return;
    const previous = item.count;
    item.count--;
    if (previous === 1 && item.count === 0) item.isFlipped = false;
  }

  getRows(arr: any[], chunkSize: number) {
    const rows: any[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) rows.push(arr.slice(i, i + chunkSize));
    return rows;
  }

  generateColorVariant(index: number, type: 'repairable' | 'reject'): string {
    const lightnessMap = [90, 80, 70, 60, 50];
    const lightness = lightnessMap[index - 1] ?? (88 - index * 8);
    if (type === 'repairable') return `hsl(50, 100%, ${lightness}%)`;
    if (type === 'reject')     return `hsl(10, 100%, ${lightness}%)`;
    return `hsl(0, 0%, 90%)`;
  }

  confirmSelection() {
    const selectedItems = this.items.filter(x => x.count > 0);
    const hasTotalInput = this.totalInputValue !== undefined && this.totalInputValue > 0;

    // ════════════════════════════════════════════════════════════
    //  FIX · Both selectedItems AND totalInputValue are required.
    //  - Must select at least one fault name card (count > 0)
    //  - Must enter a total input value (> 0)
    //  Either missing → block with specific message.
    // ════════════════════════════════════════════════════════════
    if (selectedItems.length === 0 && !hasTotalInput) {
      this.toastr.warning(
        'Please select at least one fault name and enter a total value',
        'Warning'
      );
      return;
    }

    if (selectedItems.length === 0) {
      this.toastr.warning(
        'Please select at least one fault name',
        'Warning'
      );
      return;
    }

    if (!hasTotalInput) {
      this.toastr.warning(
        'Please enter a total value',
        'Warning'
      );
      return;
    }

    // ════════════════════════════════════════════════════════════
    //  NEW · Validation — card sum must MATCH or EXCEED the total input.
    //  - PASS when card sum === total (matched)
    //  - PASS when card sum >  total (exceeds)
    //  - BLOCK when card sum <  total (below) — must match or more
    // ════════════════════════════════════════════════════════════
    if (hasTotalInput && this.isCardSumBelowTotal) {
      this.toastr.error(
        `Card sum (${this.cardSum}) is below the Total input (${this.totalInputValue}). ` +
        `Card sum must match or be more than the total. (Short by ${this.shortBy})`,
        'Validation Error'
      );
      return;
    }

    // ── Existing card grouping logic (only if cards were selected) ──
    if (selectedItems.length > 0) {
      const groupKey = this.groupCounter.toString().padStart(4, '0');
      let currentIndex = 0;

      if (this.type === 'repairable') {
        repairableColorIndex++;
        currentIndex = repairableColorIndex;
      } else if (this.type === 'reject') {
        rejectColorIndex++;
        currentIndex = rejectColorIndex;
      }

      const groupColor = this.generateColorVariant(currentIndex, this.type as any);

      const newDefects = selectedItems.map(x => ({
        defectId:        x.defectId,
        name:            x.name,
        count:           x.count,
        backgroundColor: groupColor,
      }));

      // ════════════════════════════════════════════════════════════
      //  NEW · Store groupTotal alongside items so the parent knows
      //  how much to subtract from repairableTotalInput when the
      //  entire group is removed (last defect X-clicked).
      //  Structure: { groupTotal: number, items: [...] }
      // ════════════════════════════════════════════════════════════
      this.groupedDefects[groupKey] = {
        groupTotal: (this.totalInputValue as number) || 0,
        items: newDefects
      };
      this.groupCounter++;
    }

    // ════════════════════════════════════════════════════════════
    //  NEW · Accumulate Total input value into running sum
    // ════════════════════════════════════════════════════════════
    if (hasTotalInput) {
      this.lastAddedValue = this.totalInputValue as number;
      this.accumulatedTotal += this.totalInputValue as number;
    }

    // Reset cards
    this.items.forEach(x => { x.count = 0; x.isFlipped = false; });

    // NEW · clear Total input for next entry
    this.totalInputValue = undefined;

    console.log('Grouped Defects:', this.groupedDefects);
    console.log('Accumulated Total:', this.accumulatedTotal);

    // NEW · emit accumulated running total to parent
    this.totalCountChange.emit(this.accumulatedTotal);

    this.onConfirm.emit(this.groupedDefects);
    this.visible = false;
    this.visibleChange.emit(false);
  }
}