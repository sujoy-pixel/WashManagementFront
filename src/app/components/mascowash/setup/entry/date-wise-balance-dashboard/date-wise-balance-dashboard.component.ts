import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { WashSetupService } from '../../../services/washsetup.service';

/**
 * ViewType sent to usp_WashDateWiseBalanceDashboard:
 *   1 = Garments (Pcs)              -> radio [value]="1"
 *   2 = Fabric & Cutting Parts (Kg) -> radio [value]="2"
 */
export type BalanceViewType = 1 | 2;

export interface BalanceDashboardRequest {
  unitId: number | null;
  fromDate: string;
  toDate: string;
  viewType: BalanceViewType;
}

/**
 * One row per (Buyer, Job, Order, Style, Color) per transaction Date within
 * the selected window - NOT one aggregated row per group. cumReceiveQty /
 * cumDeliveryQty / balanceQty are the running life-to-date totals as of that
 * Date. A synthetic "Sub Total" row (isSubtotal = true) is appended after the
 * last Date of each Buyer/Job/Order/Style/Color group, showing that group's
 * OrderQty and its FINAL cumulative/balance figures (see BRD sample layout).
 */
interface GarmentRow {
  date: string | Date | null;
  receiveFrom: string;
  buyer: string;
  job: string;
  orderNo: string;
  style: string;
  color: string;
  dressPart: string;
  washType: string;
  fabricComposition: string;
  gsm: string;
  fabricConPerDzn: string;
  orderQty: number | null;
  shipmentDate: string | Date | null;
  receiveQty: number | null;
  cumReceiveQty: number | null;
  deliveryQty: number | null;
  cumDeliveryQty: number | null;
  balanceQty: number | null;
  isSubtotal?: boolean;
}

/** Fabric & Cutting Parts (Kg) view - same grain/Sub Total pattern as GarmentRow. */
interface FabricRow {
  date: string | Date | null;
  receiveFrom: string;
  buyer: string;
  job: string;
  orderNo: string;
  style: string;
  color: string;
  dressPart: string;
  washType: string;
  fabricComposition: string;
  batchLot: string;
  gsm: string;
  dia: number | null;
  orderQtyKg: number | null;
  shipmentDate: string | Date | null;
  receiveRoll: number | null;
  receiveQtyKg: number | null;
  cumReceiveQtyKg: number | null;
  deliveryRoll: number | null;
  deliveryQtyKg: number | null;
  cumDeliveryQtyKg: number | null;
  balanceQtyKg: number | null;
  isSubtotal?: boolean;
}

@Component({
  selector: 'app-date-wise-balance-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  providers: [DatePipe],
  templateUrl: './date-wise-balance-dashboard.component.html',
  styleUrls: ['./date-wise-balance-dashboard.component.scss']
})
export class DateWiseBalanceDashboardComponent implements OnInit {

  filter: any = {
    UnitId: null,
    fromDate: null,
    toDate: new Date(),
    viewType: 1 as BalanceViewType    // 1 = Garments (default), 2 = Fabric & Cutting Parts
  };

  bsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'D MMM YYYY'
  };

  UnitList: any[] = [];

  globalSearch = '';
  isLoading = false;

  garmentRows: GarmentRow[] = [];
  garmentFilteredRows: GarmentRow[] = [];
  fabricRows: FabricRow[] = [];
  fabricFilteredRows: FabricRow[] = [];

  /**
   * Grand Total footer figures - summed ONCE per Buyer/Job/Order/Style/Color
   * group (using each group's FINAL/last-date row), never across every daily
   * row, otherwise OrderQty (constant per group) and BalanceQty (a running
   * snapshot) would be wildly overcounted. Recomputed on top of whatever the
   * global search currently matches (see onGlobalSearch), so - like the Sub
   * Total rows - it updates dynamically as the user types/clears the filter,
   * and falls back to the full dataset when the search box is empty.
   */
  garmentGrandTotal: { orderQty: number; receiveQty: number; cumReceiveQty: number; deliveryQty: number; cumDeliveryQty: number; balanceQty: number } | null = null;
  fabricGrandTotal: { orderQtyKg: number; receiveQtyKg: number; cumReceiveQtyKg: number; deliveryQtyKg: number; cumDeliveryQtyKg: number; balanceQtyKg: number } | null = null;

  constructor(
    private washService: WashSetupService,
    private datePipe: DatePipe,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.washService.GetUnitName().subscribe({
      next: res => {
        this.UnitList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id
        }));
        const found = this.UnitList.find(x => x.value === 60);
        if (found) {
          this.filter.UnitId = 60;
        }
      },
      error: () => {
        this.UnitList = [
          { label: 'Concept Knitting Ltd. (Wash Unit)', value: 60 }
        ];
        this.filter.UnitId = 60;
      }
    });
  }

  /** Radio change (1 <-> 2): clear whatever is loaded. */
  onViewTypeChange(): void {
    this.globalSearch = '';
    this.resetGrid();
  }

  /**
   * Normalized radio value -> SP @ViewType.
   * Number() guards against the radio ever binding as a string ('1' / '2').
   */
  private get viewType(): BalanceViewType {
    return Number(this.filter.viewType) === 2 ? 2 : 1;
  }

  onSearch(): void {
    if (!this.filter.UnitId) {
      this.toastr.warning('Please Select Unit');
      return;
    }
    if (!this.filter.fromDate && !this.filter.toDate) {
      this.toastr.warning('Please select From Date and To Date');
      return;
    }
    if ((this.filter.fromDate && !this.filter.toDate) || (!this.filter.fromDate && this.filter.toDate)) {
      this.toastr.warning('Please select both From Date and To Date');
      return;
    }

    const request: BalanceDashboardRequest = {
      unitId: this.filter.UnitId,
      fromDate: this.datePipe.transform(this.filter.fromDate, 'yyyy-MM-dd') || '',
      toDate: this.datePipe.transform(this.filter.toDate, 'yyyy-MM-dd') || '',
      viewType: this.viewType          // -> SP @ViewType (1 = Garments, 2 = Fabric & Cutting Parts)
    };

    this.isLoading = true;

    // ONE call for both views - request.viewType (1 / 2) decides which
    // result shape the SP returns and which processor fills the grid.
    this.washService.getDateWiseBalanceData(request).subscribe({

      next: (res: any[]) => {
        console.log('Balance data received:', res);
        this.isLoading = false;
        if (res?.length) {
          if (request.viewType === 1) {
            this.processGarmentData(res);
          } else {
            this.processFabricData(res);
          }
        } else {
          this.toastr.info('No data found');
          this.resetGrid();
        }
      },
      error: () => {
        this.isLoading = false;
        this.resetGrid();
        this.toastr.error('Failed to load Balance data');
      }
    });
  }

  private processGarmentData(rawData: any[]): void {
    this.garmentRows = rawData.map(r => {
      const lookup = this.buildKeyLookup(r);

      const row: GarmentRow = {
        date: r.date ?? r.Date ?? null,
        receiveFrom: this.cleanStr(this.getVal(r, lookup, 'receiveFrom', 'receiveForm')),
        buyer: this.cleanStr(this.getVal(r, lookup, 'buyer')),
        job: this.cleanStr(this.getVal(r, lookup, 'job')),
        orderNo: this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
        style: this.cleanStr(this.getVal(r, lookup, 'style')),
        color: this.cleanStr(this.getVal(r, lookup, 'color')),
        dressPart: this.cleanStr(this.getVal(r, lookup, 'dressPart')),
        washType: this.cleanStr(this.getVal(r, lookup, 'washType', 'washCategory')),
        fabricComposition: this.cleanStr(this.getVal(r, lookup, 'fabricComposition')),
        gsm: this.cleanStr(this.getVal(r, lookup, 'gsm')),
        fabricConPerDzn: this.cleanStr(this.getVal(r, lookup, 'fabricConPerDzn', 'fabricConPerDozen')),
        orderQty: this.toNumber(this.getVal(r, lookup, 'orderQty', 'orderQtyPcs')),
        shipmentDate: r.shipmentDate ?? r.ShipmentDate ?? null,
        receiveQty: this.toNumber(this.getVal(r, lookup, 'receiveQty', 'receiveQtyPcs', 'receivePcs')),
        cumReceiveQty: this.toNumber(this.getVal(r, lookup, 'cumReceiveQty', 'cumReceiveQtyPcs')),
        deliveryQty: this.toNumber(this.getVal(r, lookup, 'deliveryQty', 'deliveryQtyPcs', 'deliveryPcs')),
        cumDeliveryQty: this.toNumber(this.getVal(r, lookup, 'cumDeliveryQty', 'cumDeliveryQtyPcs')),
        balanceQty: this.toNumber(this.getVal(r, lookup, 'balanceQty', 'balanceQtyPcs'))
      };

      return row;
    });

    // Sort by group (Buyer/Job/Order/Style/Color) then Date ascending, so
    // each group's rows run in chronological order and the Sub Total lands
    // right after the last date of that group.
    this.garmentRows.sort((a, b) => this.groupThenDateCompare(a, b, r => r.date));

    this.garmentGrandTotal = this.computeGarmentGrandTotal(this.garmentRows);

    this.globalSearch = '';
    this.garmentFilteredRows = this.insertGarmentSubtotals(this.garmentRows);
  }

  private processFabricData(rawData: any[]): void {
    this.fabricRows = rawData.map(r => {
      const lookup = this.buildKeyLookup(r);

      const row: FabricRow = {
        date: r.date ?? r.Date ?? null,
        receiveFrom: this.cleanStr(this.getVal(r, lookup, 'receiveFrom', 'receiveForm')),
        buyer: this.cleanStr(this.getVal(r, lookup, 'buyer')),
        job: this.cleanStr(this.getVal(r, lookup, 'job')),
        orderNo: this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
        style: this.cleanStr(this.getVal(r, lookup, 'style')),
        color: this.cleanStr(this.getVal(r, lookup, 'color')),
        dressPart: this.cleanStr(this.getVal(r, lookup, 'dressPart')),
        washType: this.cleanStr(this.getVal(r, lookup, 'washType', 'washCategory')),
        fabricComposition: this.cleanStr(this.getVal(r, lookup, 'fabricComposition')),
        batchLot: this.cleanStr(this.getVal(r, lookup, 'batchLot', 'batchLotNo')),
        gsm: this.cleanStr(this.getVal(r, lookup, 'gsm')),
        dia: this.toNumber(this.getVal(r, lookup, 'dia')),
        orderQtyKg: this.toNumber(this.getVal(r, lookup, 'orderQtyKg')),
        shipmentDate: r.shipmentDate ?? r.ShipmentDate ?? null,
        receiveRoll: this.toNumber(this.getVal(r, lookup, 'receiveRoll')),
        receiveQtyKg: this.toNumber(this.getVal(r, lookup, 'receiveQtyKg')),
        cumReceiveQtyKg: this.toNumber(this.getVal(r, lookup, 'calculatedQtyKg', 'cumReceiveQtyKg')),
        deliveryRoll: this.toNumber(this.getVal(r, lookup, 'deliveryRoll')),
        deliveryQtyKg: this.toNumber(this.getVal(r, lookup, 'deliveryQtyKg')),
        cumDeliveryQtyKg: this.toNumber(this.getVal(r, lookup, 'calculatedDeliveryQtyKg', 'cumDeliveryQtyKg')),
        balanceQtyKg: this.toNumber(this.getVal(r, lookup, 'balanceQtyKg'))
      };

      return row;
    });

    this.fabricRows.sort((a, b) => this.groupThenDateCompare(a, b, r => r.date));

    this.fabricGrandTotal = this.computeFabricGrandTotal(this.fabricRows);

    this.globalSearch = '';
    this.fabricFilteredRows = this.insertFabricSubtotals(this.fabricRows);
  }

  /**
   * Grand Total.
   * - OrderQty / CumReceiveQty / CumDeliveryQty / BalanceQty are summed ONCE
   *   per Buyer/Job/Order/Style/Color group (using each group's FINAL/last-date
   *   row) - same one-value-per-group logic as insertGarmentSubtotals. OrderQty
   *   repeats per date within a group and BalanceQty is a running snapshot, so
   *   summing those across every daily row would overcount both.
   * - ReceiveQty / DeliveryQty are the DAILY delta columns, genuinely additive
   *   across every row (each row's amount is a distinct day's activity), so
   *   these are summed directly across the whole dataset. This naturally
   *   equals the sum of each group's final CumReceiveQty/CumDeliveryQty
   *   (since cumulative = running sum of these same daily deltas).
   */
  private computeGarmentGrandTotal(rows: GarmentRow[]):
    { orderQty: number; receiveQty: number; cumReceiveQty: number; deliveryQty: number; cumDeliveryQty: number; balanceQty: number } {
    let orderQty = 0, cumReceiveQty = 0, cumDeliveryQty = 0, balanceQty = 0;
    let receiveQty = 0, deliveryQty = 0;
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) j++;
      const last = rows[j - 1];
      orderQty += last.orderQty ?? 0;
      cumReceiveQty += last.cumReceiveQty ?? 0;
      cumDeliveryQty += last.cumDeliveryQty ?? 0;
      balanceQty += last.balanceQty ?? 0;
      i = j;
    }
    for (const r of rows) {
      receiveQty += r.receiveQty ?? 0;
      deliveryQty += r.deliveryQty ?? 0;
    }
    return { orderQty, receiveQty, cumReceiveQty, deliveryQty, cumDeliveryQty, balanceQty };
  }

  private computeFabricGrandTotal(rows: FabricRow[]):
    { orderQtyKg: number; receiveQtyKg: number; cumReceiveQtyKg: number; deliveryQtyKg: number; cumDeliveryQtyKg: number; balanceQtyKg: number } {
    let orderQtyKg = 0, cumReceiveQtyKg = 0, cumDeliveryQtyKg = 0, balanceQtyKg = 0;
    let receiveQtyKg = 0, deliveryQtyKg = 0;
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) j++;
      const last = rows[j - 1];
      orderQtyKg += last.orderQtyKg ?? 0;
      cumReceiveQtyKg += last.cumReceiveQtyKg ?? 0;
      cumDeliveryQtyKg += last.cumDeliveryQtyKg ?? 0;
      balanceQtyKg += last.balanceQtyKg ?? 0;
      i = j;
    }
    for (const r of rows) {
      receiveQtyKg += r.receiveQtyKg ?? 0;
      deliveryQtyKg += r.deliveryQtyKg ?? 0;
    }
    return { orderQtyKg, receiveQtyKg, cumReceiveQtyKg, deliveryQtyKg, cumDeliveryQtyKg, balanceQtyKg };
  }

  /** Common Buyer -> Job -> Order -> Style -> Color -> Date comparator. */
  private groupThenDateCompare<T extends { buyer: string; job: string; orderNo: string; style: string; color: string }>(
    a: T, b: T, dateOf: (r: T) => string | Date | null
  ): number {
    const buyerComp = (a.buyer || '').localeCompare(b.buyer || '');
    if (buyerComp !== 0) return buyerComp;
    const jobComp = (a.job || '').localeCompare(b.job || '');
    if (jobComp !== 0) return jobComp;
    const orderComp = (a.orderNo || '').localeCompare(b.orderNo || '');
    if (orderComp !== 0) return orderComp;
    const styleComp = (a.style || '').localeCompare(b.style || '');
    if (styleComp !== 0) return styleComp;
    const colorComp = (a.color || '').localeCompare(b.color || '');
    if (colorComp !== 0) return colorComp;
    const aTime = dateOf(a) ? new Date(dateOf(a) as any).getTime() : 0;
    const bTime = dateOf(b) ? new Date(dateOf(b) as any).getTime() : 0;
    return aTime - bTime;
  }

  /** Buyer/Job/Order/Style/Color grouping key - matches SP grouping grain (no DressPart). */
  private groupKey(r: { buyer: string; job: string; orderNo: string; style: string; color: string }): string {
    return `${r.buyer}||${r.job}||${r.orderNo}||${r.style}||${r.color}`;
  }

  /** Inserts a "Sub Total" row after the last Date of each Buyer/Job/Order/Style/Color group. */
  private insertGarmentSubtotals(rows: GarmentRow[]): GarmentRow[] {
    const result: GarmentRow[] = [];
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) {
        result.push(rows[j]);
        j++;
      }
      const last = rows[j - 1];
      result.push({
        date: null, receiveFrom: '', buyer: '', job: '', orderNo: '', style: '', color: '',
        dressPart: '', washType: '', fabricComposition: '', gsm: '', fabricConPerDzn: '',
        orderQty: last.orderQty,
        shipmentDate: null,
        receiveQty: null,
        cumReceiveQty: last.cumReceiveQty,
        deliveryQty: null,
        cumDeliveryQty: last.cumDeliveryQty,
        balanceQty: last.balanceQty,
        isSubtotal: true
      });
      i = j;
    }
    return result;
  }

  private insertFabricSubtotals(rows: FabricRow[]): FabricRow[] {
    const result: FabricRow[] = [];
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) {
        result.push(rows[j]);
        j++;
      }
      const last = rows[j - 1];
      result.push({
        date: null, receiveFrom: '', buyer: '', job: '', orderNo: '', style: '', color: '',
        dressPart: '', washType: '', fabricComposition: '', batchLot: '', gsm: '',
        dia: null,
        orderQtyKg: last.orderQtyKg,
        shipmentDate: null,
        receiveRoll: null,
        receiveQtyKg: null,
        cumReceiveQtyKg: last.cumReceiveQtyKg,
        deliveryRoll: null,
        deliveryQtyKg: null,
        cumDeliveryQtyKg: last.cumDeliveryQtyKg,
        balanceQtyKg: last.balanceQtyKg,
        isSubtotal: true
      });
      i = j;
    }
    return result;
  }

  /**
   * Global search filters the raw (per-Date) rows only - Sub Total rows carry
   * no searchable text of their own, so they're dropped while a term is
   * active and re-inserted once the search is cleared.
   */
  // onGlobalSearch(): void {
  //   const term = this.globalSearch?.trim()?.toLowerCase() ?? '';

  //   if (term.length) {
  //     if (this.viewType === 1) {
  //       this.garmentFilteredRows = this.garmentRows.filter(r => {
  //         return (
  //           this.matches(r.receiveFrom, term) ||
  //           this.matches(r.buyer, term) ||
  //           this.matches(r.job, term) ||
  //           this.matches(r.orderNo, term) ||
  //           this.matches(r.style, term) ||
  //           this.matches(r.color, term) ||
  //           this.matches(r.dressPart, term) ||
  //           this.matches(r.washType, term) ||
  //           this.matchesNumber(r.orderQty, term) ||
  //           this.matchesNumber(r.receiveQty, term) ||
  //           this.matchesNumber(r.cumReceiveQty, term) ||
  //           this.matchesNumber(r.deliveryQty, term) ||
  //           this.matchesNumber(r.cumDeliveryQty, term) ||
  //           this.matchesNumber(r.balanceQty, term)
  //         );
  //       });
  //     } else {
  //       this.fabricFilteredRows = this.fabricRows.filter(r => {
  //         return (
  //           this.matches(r.receiveFrom, term) ||
  //           this.matches(r.buyer, term) ||
  //           this.matches(r.job, term) ||
  //           this.matches(r.orderNo, term) ||
  //           this.matches(r.style, term) ||
  //           this.matches(r.color, term) ||
  //           this.matches(r.batchLot, term) ||
  //           this.matchesNumber(r.dia, term) ||
  //           this.matchesNumber(r.orderQtyKg, term) ||
  //           this.matchesNumber(r.receiveRoll, term) ||
  //           this.matchesNumber(r.cumReceiveQtyKg, term) ||
  //           this.matchesNumber(r.deliveryRoll, term) ||
  //           this.matchesNumber(r.cumDeliveryQtyKg, term) ||
  //           this.matchesNumber(r.balanceQtyKg, term)
  //         );
  //       });
  //     }
  //   } else {
  //     if (this.viewType === 1) {
  //       this.garmentFilteredRows = this.insertGarmentSubtotals(this.garmentRows);
  //     } else {
  //       this.fabricFilteredRows = this.insertFabricSubtotals(this.fabricRows);
  //     }
  //   }
  // }
  /**
   * Global search filters the raw (per-Date) rows, then RE-BUILDS the Sub Total
   * rows AND the Grand Total over whatever survived the filter - so searching
   * by Style/Color (or anything else) still shows each visible group's Sub
   * Total line, and the footer's Grand Total shrinks/grows to match exactly
   * what's on screen. Clearing the search restores both to the full dataset.
   * When a term matches only part of a group (e.g. searching a daily qty), that
   * group's Sub Total reflects the LAST VISIBLE date, not the group's true final
   * date. Group-level fields (Buyer/Job/Order/Style/Color) always match all rows
   * of a group, so those searches give exact group totals.
   */
  onGlobalSearch(): void {
    const term = this.globalSearch?.trim()?.toLowerCase() ?? '';

    if (this.viewType === 1) {
      const matched = term.length
        ? this.garmentRows.filter(r => this.garmentMatches(r, term))
        : this.garmentRows;
      this.garmentFilteredRows = this.insertGarmentSubtotals(matched);
      this.garmentGrandTotal = matched.length ? this.computeGarmentGrandTotal(matched) : null;
    } else {
      const matched = term.length
        ? this.fabricRows.filter(r => this.fabricMatches(r, term))
        : this.fabricRows;
      this.fabricFilteredRows = this.insertFabricSubtotals(matched);
      this.fabricGrandTotal = matched.length ? this.computeFabricGrandTotal(matched) : null;
    }
  }

  private garmentMatches(r: GarmentRow, term: string): boolean {
    return (
      this.matches(r.receiveFrom, term) ||
      this.matches(r.buyer, term) ||
      this.matches(r.job, term) ||
      this.matches(r.orderNo, term) ||
      this.matches(r.style, term) ||
      this.matches(r.color, term) ||
      this.matches(r.dressPart, term) ||
      this.matches(r.washType, term) ||
      this.matches(r.fabricComposition, term) ||
      this.matches(r.gsm, term) ||
      this.matches(r.fabricConPerDzn, term) ||
      this.matches(this.formatDate(r.date), term) ||
      this.matches(this.formatDate(r.shipmentDate), term) ||
      this.matchesNumber(r.orderQty, term) ||
      this.matchesNumber(r.receiveQty, term) ||
      this.matchesNumber(r.cumReceiveQty, term) ||
      this.matchesNumber(r.deliveryQty, term) ||
      this.matchesNumber(r.cumDeliveryQty, term) ||
      this.matchesNumber(r.balanceQty, term)
    );
  }

  private fabricMatches(r: FabricRow, term: string): boolean {
    return (
      this.matches(r.receiveFrom, term) ||
      this.matches(r.buyer, term) ||
      this.matches(r.job, term) ||
      this.matches(r.orderNo, term) ||
      this.matches(r.style, term) ||
      this.matches(r.color, term) ||
      this.matches(r.dressPart, term) ||
      this.matches(r.washType, term) ||
      this.matches(r.fabricComposition, term) ||
      this.matches(r.batchLot, term) ||
      this.matches(r.gsm, term) ||
      this.matches(this.formatDate(r.date), term) ||
      this.matches(this.formatDate(r.shipmentDate), term) ||
      this.matchesNumber(r.dia, term) ||
      this.matchesNumber(r.orderQtyKg, term) ||
      this.matchesNumber(r.receiveRoll, term) ||
      this.matchesNumber(r.receiveQtyKg, term) ||
      this.matchesNumber(r.cumReceiveQtyKg, term) ||
      this.matchesNumber(r.deliveryRoll, term) ||
      this.matchesNumber(r.deliveryQtyKg, term) ||
      this.matchesNumber(r.cumDeliveryQtyKg, term) ||
      this.matchesNumber(r.balanceQtyKg, term)
    );
  }
  onClear(): void {
    this.filter.fromDate = null;
    this.filter.toDate = null;
    this.globalSearch = '';
    this.resetGrid();
  }

  onExcel(): void {
    if (this.viewType === 1) {
      this.exportGarmentExcel();
    } else {
      this.exportFabricExcel();
    }
  }

  private exportGarmentExcel(): void {
    if (!this.garmentFilteredRows.length) {
      this.toastr.warning('No data to export');
      return;
    }

    const exportData = this.garmentFilteredRows.map(row => {
      if (row.isSubtotal) {
        return {
          'Date': 'Sub Total:',
          'Receive From': '', 'Buyer': '', 'Job': '', 'Order': '', 'Style': '', 'Color': '',
          'Dress Part': '', 'Wash Type': '', 'Fabric Composition': '', 'GSM': '', 'Fabric Con per Dzn': '',
          'Order Qty (Pcs)': row.orderQty ?? '',
          'Shipment Date': '',
          'Receive Qty (Pcs)': '',
          'Cum. Receive Qty (Pcs)': row.cumReceiveQty ?? '',
          'Delivery Qty (Pcs)': '',
          'Cum. Delivery Qty (Pcs)': row.cumDeliveryQty ?? '',
          'Balance Qty (Pcs)': row.balanceQty ?? ''
        };
      }
      return {
        'Date': this.formatDate(row.date),
        'Receive From': row.receiveFrom,
        'Buyer': row.buyer,
        'Job': row.job,
        'Order': row.orderNo,
        'Style': row.style,
        'Color': row.color,
        'Dress Part': row.dressPart,
        'Wash Type': row.washType,
        'Fabric Composition': row.fabricComposition,
        'GSM': row.gsm,
        'Fabric Con per Dzn': row.fabricConPerDzn,
        'Order Qty (Pcs)': row.orderQty ?? '',
        'Shipment Date': this.formatDate(row.shipmentDate),
        'Receive Qty (Pcs)': row.receiveQty ?? '',
        'Cum. Receive Qty (Pcs)': row.cumReceiveQty ?? '',
        'Delivery Qty (Pcs)': row.deliveryQty ?? '',
        'Cum. Delivery Qty (Pcs)': row.cumDeliveryQty ?? '',
        'Balance Qty (Pcs)': row.balanceQty ?? ''
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 18 },
      { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 8 }, { wch: 16 },
      { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 },
      { wch: 14 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Garments Balance');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Garments_Balance_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  private exportFabricExcel(): void {
    if (!this.fabricFilteredRows.length) {
      this.toastr.warning('No data to export');
      return;
    }

    const exportData = this.fabricFilteredRows.map(row => {
      if (row.isSubtotal) {
        return {
          'Date': 'Sub Total:',
          'Receive From': '', 'Buyer': '', 'Job': '', 'Order': '', 'Style': '', 'Color': '',
          'Dress Part': '', 'Wash Type': '', 'Fabric Composition': '', 'Batch/Lot': '', 'GSM': '', 'Dia': '',
          'Order Qty (Kg)': row.orderQtyKg ?? '',
          'Shipment Date': '',
          'Receive Roll': '',
          'Receive Qty (Kg)': '',
          'Cum. Receive Qty (Kg)': row.cumReceiveQtyKg ?? '',
          'Delivery Roll': '',
          'Delivery Qty (Kg)': '',
          'Cum. Delivery Qty (Kg)': row.cumDeliveryQtyKg ?? '',
          'Balance Qty (Kg)': row.balanceQtyKg ?? ''
        };
      }
      return {
        'Date': this.formatDate(row.date),
        'Receive From': row.receiveFrom,
        'Buyer': row.buyer,
        'Job': row.job,
        'Order': row.orderNo,
        'Style': row.style,
        'Color': row.color,
        'Dress Part': row.dressPart,
        'Wash Type': row.washType,
        'Fabric Composition': row.fabricComposition,
        'Batch/Lot': row.batchLot,
        'GSM': row.gsm,
        'Dia': row.dia ?? '',
        'Order Qty (Kg)': row.orderQtyKg ?? '',
        'Shipment Date': this.formatDate(row.shipmentDate),
        'Receive Roll': row.receiveRoll ?? '',
        'Receive Qty (Kg)': row.receiveQtyKg ?? '',
        'Cum. Receive Qty (Kg)': row.cumReceiveQtyKg ?? '',
        'Delivery Roll': row.deliveryRoll ?? '',
        'Delivery Qty (Kg)': row.deliveryQtyKg ?? '',
        'Cum. Delivery Qty (Kg)': row.cumDeliveryQtyKg ?? '',
        'Balance Qty (Kg)': row.balanceQtyKg ?? ''
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 18 },
      { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 8 },
      { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
      { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fabric Balance');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Fabric_Balance_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  trackByGarment(index: number, row: GarmentRow): string {
    if (row.isSubtotal) return `subtotal-${index}`;
    return `${row.orderNo}-${row.style}-${row.color}-${row.dressPart}-${row.date}-${index}`;
  }

  trackByFabric(index: number, row: FabricRow): string {
    if (row.isSubtotal) return `subtotal-${index}`;
    return `${row.orderNo}-${row.style}-${row.color}-${row.batchLot}-${row.date}-${index}`;
  }

  private resetGrid(): void {
    this.garmentRows = [];
    this.garmentFilteredRows = [];
    this.fabricRows = [];
    this.fabricFilteredRows = [];
    this.garmentGrandTotal = null;
    this.fabricGrandTotal = null;
  }

  formatDate(d: any): string {
    if (!d) return '';
    return this.datePipe.transform(d, 'd-MMM-yy') || '';
  }

  fmtNum(v: number | null | undefined): string {
    if (v === null || v === undefined || isNaN(v as any)) return '';
    return (v as number).toLocaleString('en-US', { maximumFractionDigits: 2 });
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
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'none') return '';
    return s;
  }

  private toNumber(v: any): number | null {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return isNaN(v) ? null : v;
    let s = String(v).trim();
    if (!s || /^(null|undefined|none)$/i.test(s)) return null;
    const n = parseFloat(s.replace(/,/g, '').replace(/%/g, ''));
    return isNaN(n) ? null : n;
  }

  private matches(value: string | undefined, term: string): boolean {
    return (value || '').toLowerCase().includes(term);
  }

  private matchesNumber(value: number | null, term: string): boolean {
    return value != null && value.toString().includes(term);
  }
}
