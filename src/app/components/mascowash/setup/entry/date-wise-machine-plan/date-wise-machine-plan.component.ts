import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';

/**
 * Filter request sent to the (future) Get SP - all grid data ("From Buyer
 * column to Qty column") comes from the Wash Order receive table, filtered by
 * the Work Order Receive Date (@FromDate/@ToDate), per the BRD note:
 * "From Date & To Date filter should be on Work Order receive date."
 */
export interface MachinePlanFilterRequest {
  unitId: number | null;
  buyerId: number;
  jobId: number | null;
  styleId: number;
  orderId: number | null;
  fromDate: string;
  toDate: string;
}

/** One row = one PLANNED LINE against a receive/order-detail record. Duplicating
 *  a row creates another planned line against the SAME orderDetailId, so the
 *  same received quantity can be split across different machines/timeframes -
 *  matching the BRD's row-duplication / split-planning requirement. */
interface MachinePlanRow {
  /** Client-only identity - never sent to the server as-is; correlates this
   *  row's Process/Machine selections back to its PlanData line on save. */
  rowGuid: string;
  /** FK back to the source receive/order-detail row (SP_Get_DateWiseMachinePlanGrid's
   *  OrderDetailId = tbl_Wash_Order_Raceive_Operation_Details.DetailsId). Rows
   *  sharing the same orderDetailId are the same underlying receipt, split
   *  across multiple plan lines. */
  orderDetailId: number | string | null;
  /** Non-null when this row is an ALREADY-SAVED plan line loaded from the Get
   *  SP (tbl_Wash_DateWiseMachinePlan.Id). Null for a brand-new, unsaved plan
   *  line - either an unplanned receive detail the user is filling in for the
   *  first time, or a fresh row from duplicateRow(). Only planId === null rows
   *  are ever included in the Save payload - sp_SaveWashDateWiseMachinePlan
   *  only INSERTs, so resubmitting an already-saved row would create a
   *  duplicate plan entry every time Save is clicked. */
  planId: number | null;
  /** True only for rows created via duplicateRow() - only these may be removed. */
  isDuplicate: boolean;

  // ---- Read-only, loaded from the Get SP (Search) ----
  buyer: string;
  job: string;
  style: string;
  orderNo: string;
  type: string;
  fabrication: string;
  color: string;
  dressPart: string;
  requiredDeliveryDate: string | Date | null;
  uom: string;
  qty: number | null;

  // ---- Data Entry section (user input, saved via Save) ----
  planQty: number | null;
  planStartDate: Date | null;
  planEndDate: Date | null;
  processIds: number[];
  machineIds: number[];
  remarks: string;
}

interface SaveMachinePlanLine {
  rowGuid: string;
  orderDetailId: number | string;
  planQty: number;
  planStartDate: string | null;
  planEndDate: string | null;
  remarks: string;
}

interface SaveMachinePlanProcessLine {
  rowGuid: string;
  processId: number;
}

interface SaveMachinePlanMachineLine {
  rowGuid: string;
  machineId: number;
}

export interface SaveMachinePlanRequest {
  unitId: number;
  planData: SaveMachinePlanLine[];
  processData: SaveMachinePlanProcessLine[];
  machineData: SaveMachinePlanMachineLine[];
}

@Component({
  selector: 'app-date-wise-machine-plan',
  templateUrl: './date-wise-machine-plan.component.html',
  styleUrls: ['./date-wise-machine-plan.component.scss'],
  providers: [DatePipe]
})
export class DateWiseMachinePlanComponent implements OnInit {

  // Filters
  filterModel: any = {
    unitId: null,
    buyerId: null,
    jobId: null,
    styleId: null,
    orderId: null,
    fromDate: null,
    toDate: null
  };

  // Dropdown Lists
  unitList: any[] = [];
  buyerList: any[] = [];
  jobList: any[] = [];
  styleList: any[] = [];
  orderList: any[] = [];

  // Multi-checkbox Lists (Process / Machine)
  processList: any[] = [];
  machineList: any[] = [];

  // Grid Data - populated only by onSearch(); no demo/mock rows.
  gridData: MachinePlanRow[] = [];

  isLoading = false;
  isSaving = false;
  hasSearched = false;

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadInitialDropdowns();
  }

  // =========================================================================
  // Dropdowns
  // =========================================================================
  loadInitialDropdowns(): void {
    this.service.GetUnitName().subscribe({
      next: res => {
        this.unitList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id
        }));

        const found = this.unitList.find(x => x.value === 60);
        if (found) {
          this.filterModel.unitId = 60;
        }
      },
      error: () => {
        this.unitList = [
          { label: 'Concept Knitting Ltd. (Wash Unit)', value: 60 }
        ];
        this.filterModel.unitId = 60;
      }
    });

    this.service.GetBuyerNameDDL().subscribe({
      next: res => {
        this.buyerList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName ?? x.BuyerName,
          value: x.ID ?? x.id ?? x.BuyerNo
        }));
      },
      error: () => { this.buyerList = []; }
    });

    this.service.GetProcessNameDDL().subscribe({
      next: res => {
        this.processList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id
        }));
      },
      error: () => { this.processList = []; }
    });

    this.service.GetMachineNoDDL().subscribe({
      next: res => {
        this.machineList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id
        }));
      },
      error: () => { this.machineList = []; }
    });
  }

  /** Buyer -> Job cascade. */
  onBuyerChange(): void {
    this.jobList = [];
    this.styleList = [];
    this.orderList = [];
    this.filterModel.jobId = null;
    this.filterModel.styleId = null;
    this.filterModel.orderId = null;

    if (!this.filterModel.unitId || !this.filterModel.buyerId) return;

    this.service.GetJobNoWithParameterDDL({
      unitId: this.filterModel.unitId,
      buyerId: this.filterModel.buyerId
    }).subscribe({
      next: res => {
        this.jobList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName ?? x.jobInfo,
          value: x.ID ?? x.id ?? x.JobId
        }));
        if (this.jobList.length === 1) {
          this.filterModel.jobId = this.jobList[0].value;
          this.onJobChange();
        }
      },
      error: () => { this.jobList = []; }
    });
  }

  /** Job -> Style cascade. */
  onJobChange(): void {
    this.styleList = [];
    this.orderList = [];
    this.filterModel.styleId = null;
    this.filterModel.orderId = null;

    if (!this.filterModel.unitId || !this.filterModel.buyerId || !this.filterModel.jobId) return;

    this.service.GetStyleNoWithParameterDDL({
      unitId: this.filterModel.unitId,
      buyerId: this.filterModel.buyerId,
      jobId: this.filterModel.jobId
    }).subscribe({
      next: res => {
        this.styleList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id ?? x.StyleId
        }));
        if (this.styleList.length === 1) {
          this.filterModel.styleId = this.styleList[0].value;
          this.onStyleChange();
        }
      },
      error: () => { this.styleList = []; }
    });
  }

  /** Style -> Order cascade. */
  onStyleChange(): void {
    this.orderList = [];
    this.filterModel.orderId = null;

    if (!this.filterModel.unitId || !this.filterModel.buyerId || !this.filterModel.jobId || !this.filterModel.styleId) return;

    this.service.GetOrderNoWithParameterDDL({
      unitId: this.filterModel.unitId,
      buyerId: this.filterModel.buyerId,
      jobId: this.filterModel.jobId,
      styleId: this.filterModel.styleId
    }).subscribe({
      next: res => {
        this.orderList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id ?? x.OrderId
        }));
        if (this.orderList.length === 1) {
          this.filterModel.orderId = this.orderList[0].value;
        }
      },
      error: () => { this.orderList = []; }
    });
  }

  // =========================================================================
  // Search - grid data is entirely server-driven; no fallback/demo rows.
  // =========================================================================
  onSearch(): void {
    if (!this.filterModel.buyerId) {
      this.toastr.warning('Please select Buyer');
      return;
    }
    if (!this.filterModel.styleId) {
      this.toastr.warning('Please select Style');
      return;
    }
    if (!this.filterModel.fromDate || !this.filterModel.toDate) {
      this.toastr.warning('Please select both From Date and To Date');
      return;
    }
    if (this.filterModel.fromDate > this.filterModel.toDate) {
      this.toastr.warning('From Date cannot be after To Date');
      return;
    }

    const request: MachinePlanFilterRequest = {
      unitId: this.filterModel.unitId,
      buyerId: this.filterModel.buyerId,
      jobId: this.filterModel.jobId,
      styleId: this.filterModel.styleId,
      orderId: this.filterModel.orderId,
      fromDate: this.datePipe.transform(this.filterModel.fromDate, 'yyyy-MM-dd') || '',
      toDate: this.datePipe.transform(this.filterModel.toDate, 'yyyy-MM-dd') || ''
    };

    this.isLoading = true;
    this.hasSearched = true;

    this.service.getDateWiseMachinePlanGrid(request).subscribe({
      next: (res: any[]) => {
        this.isLoading = false;
        this.gridData = (res || []).map(r => this.mapToRow(r));
        if (!this.gridData.length) {
          this.toastr.info('No data found');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.gridData = [];
        this.toastr.error('Failed to load Machine Plan data');
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Maps one SP_Get_DateWiseMachinePlanGrid row. planId is NULL for an
   * unplanned receive detail (blank Data Entry cells, ready to plan) and
   * non-null for an already-saved plan line (pre-fills Plan Qty/Dates/
   * Process/Machine/Remarks so the user can see what was previously planned;
   * these rows are excluded from the next Save - see planId's doc comment).
   */
  private mapToRow(r: any): MachinePlanRow {
    const lookup = this.buildKeyLookup(r);
    const planId = this.toNumber(this.getVal(r, lookup, 'planId'));
    return {
      rowGuid: this.newGuid(),
      orderDetailId: this.getVal(r, lookup, 'orderDetailId', 'orderDetailID'),
      planId,
      isDuplicate: false,
      buyer: this.cleanStr(this.getVal(r, lookup, 'buyer')),
      job: this.cleanStr(this.getVal(r, lookup, 'job')),
      style: this.cleanStr(this.getVal(r, lookup, 'style')),
      orderNo: this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
      type: this.cleanStr(this.getVal(r, lookup, 'type')),
      fabrication: this.cleanStr(this.getVal(r, lookup, 'fabrication', 'fabricComposition')),
      color: this.cleanStr(this.getVal(r, lookup, 'color')),
      dressPart: this.cleanStr(this.getVal(r, lookup, 'dressPart')),
      requiredDeliveryDate: r.requiredDeliveryDate ?? r.RequiredDeliveryDate ?? null,
      uom: this.cleanStr(this.getVal(r, lookup, 'uom')),
      qty: this.toNumber(this.getVal(r, lookup, 'qty')),
      planQty: this.toNumber(this.getVal(r, lookup, 'planQty')),
      planStartDate: this.toDate(this.getVal(r, lookup, 'planStartDate')),
      planEndDate: this.toDate(this.getVal(r, lookup, 'planEndDate')),
      processIds: this.parseIdList(this.getVal(r, lookup, 'processIds')),
      machineIds: this.parseIdList(this.getVal(r, lookup, 'machineIds')),
      remarks: this.cleanStr(this.getVal(r, lookup, 'remarks'))
    };
  }

  // =========================================================================
  // Remaining Qty = Qty - Sum(Plan Qty across every plan line for the same
  // receive/order-detail row), per BRD 3.2.
  // =========================================================================
  getRemainingQty(row: MachinePlanRow): number | null {
    if (row.qty === null || row.qty === undefined) return null;
    const sumPlanQty = this.gridData
      .filter(x => x.orderDetailId === row.orderDetailId)
      .reduce((sum, current) => sum + (current.planQty || 0), 0);
    return row.qty - sumPlanQty;
  }

  // =========================================================================
  // Row duplication (split-planning) - BRD 4: Row Duplication Logic
  // =========================================================================
  duplicateRow(index: number, row: MachinePlanRow): void {
    const newRow: MachinePlanRow = {
      ...row,
      rowGuid: this.newGuid(),
      planId: null,   // always a brand-new, unsaved plan line - even when duplicating an already-saved row
      isDuplicate: true,
      planQty: null,
      planStartDate: null,
      planEndDate: null,
      processIds: [],
      machineIds: [],
      remarks: ''
    };

    let insertIdx = index + 1;
    while (insertIdx < this.gridData.length &&
           this.gridData[insertIdx].orderDetailId === row.orderDetailId &&
           this.gridData[insertIdx].isDuplicate) {
      insertIdx++;
    }

    this.gridData.splice(insertIdx, 0, newRow);
    this.cdr.detectChanges();
  }

  /** Only enabled for rows created via duplicateRow() - BRD: "enabled only on these duplicated rows." */
  removeRow(index: number): void {
    this.gridData.splice(index, 1);
    this.cdr.detectChanges();
  }

  // =========================================================================
  // Infographic / Gantt Chart navigation
  // =========================================================================
  goToInfographicView(): void {
    this.toastr.info('Gantt Chart / Infographic view is not wired up yet.');
  }

  // =========================================================================
  // Refresh - wipes unsaved scheduling entries and re-syncs the grid with the
  // server (BRD 5: Footer Controls -> Refresh Button).
  // =========================================================================
  onRefresh(): void {
    if (this.hasSearched && this.filterModel.buyerId && this.filterModel.styleId) {
      this.onSearch();
      return;
    }

    this.filterModel = {
      unitId: this.filterModel.unitId,
      buyerId: null, jobId: null, styleId: null, orderId: null,
      fromDate: null, toDate: null
    };
    this.buyerList = [];
    this.jobList = [];
    this.styleList = [];
    this.orderList = [];
    this.gridData = [];
    this.hasSearched = false;
    this.cdr.detectChanges();
  }

  // =========================================================================
  // Save - commits every NEW (planId === null) plan line with a Plan Qty.
  // Already-saved rows (planId set, loaded back from Search) are excluded -
  // sp_SaveWashDateWiseMachinePlan only INSERTs, so resubmitting them would
  // create duplicate plan entries every time Save is clicked.
  // (BRD 5: Footer Controls -> Save Button.)
  // =========================================================================
  onSave(): void {
    if (!this.gridData.length) {
      this.toastr.warning('No data to save');
      return;
    }

    const linesToSave = this.gridData.filter(r => r.planId === null && (r.planQty ?? 0) > 0);
    if (!linesToSave.length) {
      this.toastr.warning('Please enter Plan Qty for at least one new row');
      return;
    }

    for (const row of linesToSave) {
      if (!row.orderDetailId) {
        this.toastr.error('One or more rows are missing their source reference - please re-run Search and try again.');
        return;
      }
      if (!row.planStartDate || !row.planEndDate) {
        this.toastr.warning(`Please set Plan Start Date and Plan End Date for ${row.buyer} / ${row.job} / ${row.style}`);
        return;
      }
      if (row.planStartDate > row.planEndDate) {
        this.toastr.warning(`Plan Start Date cannot be after Plan End Date for ${row.buyer} / ${row.job} / ${row.style}`);
        return;
      }
      if (!row.processIds?.length) {
        this.toastr.warning(`Please select at least one Process for ${row.buyer} / ${row.job} / ${row.style}`);
        return;
      }
      if (!row.machineIds?.length) {
        this.toastr.warning(`Please select at least one Machine for ${row.buyer} / ${row.job} / ${row.style}`);
        return;
      }
    }

    // Guard: total planned qty per receive/order-detail row must never exceed
    // its original Qty (mirrors the Remaining Qty formula, BRD 3.2).
    const byOrderDetail = new Map<string, { qty: number; planned: number }>();
    for (const row of this.gridData) {
      const key = String(row.orderDetailId);
      const entry = byOrderDetail.get(key) ?? { qty: row.qty ?? 0, planned: 0 };
      entry.planned += row.planQty || 0;
      byOrderDetail.set(key, entry);
    }
    for (const [, entry] of byOrderDetail) {
      if (entry.planned > entry.qty) {
        this.toastr.error('Total Plan Qty exceeds the available Qty for one or more rows. Please review before saving.');
        return;
      }
    }

    const request: SaveMachinePlanRequest = {
      unitId: this.filterModel.unitId,
      planData: linesToSave.map(row => ({
        rowGuid: row.rowGuid,
        orderDetailId: row.orderDetailId as number | string,
        planQty: row.planQty as number,
        planStartDate: this.datePipe.transform(row.planStartDate, 'yyyy-MM-dd'),
        planEndDate: this.datePipe.transform(row.planEndDate, 'yyyy-MM-dd'),
        remarks: row.remarks || ''
      })),
      processData: linesToSave.flatMap(row =>
        (row.processIds || []).map(processId => ({ rowGuid: row.rowGuid, processId }))
      ),
      machineData: linesToSave.flatMap(row =>
        (row.machineIds || []).map(machineId => ({ rowGuid: row.rowGuid, machineId }))
      )
    };

    this.isSaving = true;
    this.service.saveDateWiseMachinePlan(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastr.success('Machine Plan saved successfully');
        this.onSearch();
      },
      error: () => {
        this.isSaving = false;
        this.toastr.error('Failed to save Machine Plan');
      }
    });
  }

  // =========================================================================
  // Helpers
  // =========================================================================
  formatDate(d: any): string {
    if (!d) return '';
    return this.datePipe.transform(d, 'd-MMM-yy') || '';
  }

  fmtNum(v: number | null | undefined): string {
    if (v === null || v === undefined || isNaN(v as any)) return '';
    return (v as number).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  private newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private buildKeyLookup(row: any): Map<string, string> {
    const lookup = new Map<string, string>();
    Object.keys(row || {}).forEach(k => {
      const n = this.normKey(k);
      if (n && !lookup.has(n)) lookup.set(n, k);
    });
    return lookup;
  }

  private getVal(row: any, lookup: Map<string, string>, ...aliases: string[]): any {
    for (const alias of aliases) {
      const actualKey = lookup.get(this.normKey(alias));
      if (actualKey !== undefined) {
        return row[actualKey];
      }
    }
    return undefined;
  }

  private normKey(v: any): string {
    return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private cleanStr(v: any): string {
    if (v === null || v === undefined) return '';
    const s = String(v).trim();
    if (!s || /^(null|undefined|none)$/i.test(s)) return '';
    return s;
  }

  private toNumber(v: any): number | null {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return isNaN(v) ? null : v;
    const s = String(v).trim();
    if (!s || /^(null|undefined|none)$/i.test(s)) return null;
    const n = parseFloat(s.replace(/,/g, '').replace(/%/g, ''));
    return isNaN(n) ? null : n;
  }

  private toDate(v: any): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  /** Parses SP_Get_DateWiseMachinePlanGrid's comma-concatenated "3,5,7" ProcessIds/MachineIds. */
  private parseIdList(v: any): number[] {
    if (!v) return [];
    return String(v)
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => Number.isFinite(n) && n > 0);
  }

  trackByRow(index: number, row: MachinePlanRow): string {
    return row.rowGuid;
  }
}
