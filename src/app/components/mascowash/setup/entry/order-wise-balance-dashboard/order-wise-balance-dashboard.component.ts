import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { WashSetupService } from '../../../services/washsetup.service';
import { DashboardPdfService, PdfColumn, PdfRow, PdfCell } from '../../../services/dashboard-pdf.service';

/** Mirrors SP [dbo].[SP_Get_Wash_OrderWiseBalanceDashboard] @ViewType. */
export type OrderBalanceViewType = 1 | 2;

/** Mirrors the POST body of Setup/getOrderWiseBalanceData. */
export interface OrderBalanceDashboardRequest {
  unitId:   number;
  fromDate: string;
  toDate:   string;
  viewType: OrderBalanceViewType;
}

/**
 * Garments (Pcs) view - one row per
 * (Buyer, Job, Order, Style, Color, DressPart).
 * Field names are canonical component names; API column names are
 * normalized at runtime via buildKeyLookup()/getVal() so any
 * case/separator variant (e.g. "OrderQtyPcs", "orderQtyPcs",
 * "order_qty_pcs") is matched automatically.
 */
interface OrderBalanceGarmentRow {
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
  fabricConPerDzn: number | null;
  orderQtyPcs: number | null;
  shipmentDate: string | Date | null;
  firstReceiveDate: string | Date | null;
  lastReceiveDate: string | Date | null;
  totalReceiveQtyPcs: number | null;
  receiveBalancePcs: number | null;
  firstDeliveryDate: string | Date | null;
  lastDeliveryDate: string | Date | null;
  totalDeliveryQtyPcs: number | null;
  readyForDeliveryPcs: number | null;
  approvalTrail: number | null;
  deliveryBalanceQtyPcs: number | null;
  washStatus: string;
  remarks: string;
  isSubtotal?: boolean;
}

/** Fabric & Cutting Parts (Kg) view - same grain, different columns. */
interface OrderBalanceFabricRow {
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
  firstReceiveDate: string | Date | null;
  lastReceiveDate: string | Date | null;
  totalReceiveRoll: number | null;
  totalReceiveQtyKg: number | null;
  receiveBalanceKg: number | null;
  firstDeliveryDate: string | Date | null;
  lastDeliveryDate: string | Date | null;
  totalDeliveryRoll: number | null;
  totalDeliveryQtyKg: number | null;
  readyForDeliveryKg: number | null;
  deliveryBalanceKg: number | null;
  washStatus: string;
  remarks: string;
  isSubtotal?: boolean;
}

@Component({
  selector: 'app-order-wise-balance-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, CardModule, DecimalPipe],
  providers: [DatePipe],
  templateUrl: './order-wise-balance-dashboard.component.html',
  styleUrls: ['./order-wise-balance-dashboard.component.scss']
})
export class OrderWiseBalanceDashboardComponent implements OnInit {

  filter: any = {
    UnitId:   null,
    fromDate: null,
    toDate:   new Date(),
    viewType: 1 as OrderBalanceViewType    // 1 = Garments (default), 2 = Fabric & Cutting Parts
  };

  bsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'D MMM YYYY'
  };

  UnitList: any[] = [];

  globalSearch = '';
  isLoading = false;
  /** Filter values the grid was last loaded with - printed on the PDF, so it describes the data, not later edits to the inputs. */
  private exportFilter: any = null;

  garmentRows: OrderBalanceGarmentRow[] = [];
  garmentFilteredRows: OrderBalanceGarmentRow[] = [];
  fabricRows: OrderBalanceFabricRow[] = [];
  fabricFilteredRows: OrderBalanceFabricRow[] = [];

  /**
   * Grand Total footer figures - every column here is a per-row total (not a
   * running/cumulative snapshot like the Date-wise dashboard), so unlike that
   * screen the Grand Total is simply the sum of ALL matching rows, and each
   * Sub Total is simply the sum of the rows within its Buyer/Job/Order/Style/
   * Color group. Both are recomputed on top of whatever the global search
   * currently matches (see onGlobalSearch), so they update dynamically as the
   * user types/clears the filter, and fall back to the full dataset when the
   * search box is empty.
   */
  garmentGrandTotal: {
    orderQtyPcs: number; totalReceiveQtyPcs: number; receiveBalancePcs: number;
    totalDeliveryQtyPcs: number; readyForDeliveryPcs: number; approvalTrail: number; deliveryBalanceQtyPcs: number;
  } | null = null;

  fabricGrandTotal: {
    orderQtyKg: number; totalReceiveRoll: number; totalReceiveQtyKg: number; receiveBalanceKg: number;
    totalDeliveryRoll: number; totalDeliveryQtyKg: number; readyForDeliveryKg: number; deliveryBalanceKg: number;
  } | null = null;

  constructor(
    private washService: WashSetupService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private pdf: DashboardPdfService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  // =========================================================================
  // Dropdowns
  // =========================================================================
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

  // =========================================================================
  // Radio toggle - clears grid + global search so the user must re-run View
  // =========================================================================
  onViewTypeChange(): void {
    this.globalSearch = '';
    this.resetGrid();
  }

  /** Normalized radio value -> SP @ViewType (guards '1'/'2' strings). */
  private get viewType(): OrderBalanceViewType {
    return Number(this.filter.viewType) === 2 ? 2 : 1;
  }

  // =========================================================================
  // Search
  // =========================================================================
  onSearch(): void {
    if (!this.filter.UnitId) {
      this.toastr.warning('Please Select Unit');
      return;
    }
    if (!this.filter.fromDate && !this.filter.toDate) {
      this.toastr.warning('Please select From Date and To Date');
      return;
    }
    if ((this.filter.fromDate && !this.filter.toDate) ||
        (!this.filter.fromDate && this.filter.toDate)) {
      this.toastr.warning('Please select both From Date and To Date');
      return;
    }
    if (this.filter.fromDate > this.filter.toDate) {
      this.toastr.warning('From Date cannot be after To Date');
      return;
    }

    const request: OrderBalanceDashboardRequest = {
      unitId:   this.filter.UnitId,
      fromDate: this.datePipe.transform(this.filter.fromDate, 'yyyy-MM-dd') || '',
      toDate:   this.datePipe.transform(this.filter.toDate,   'yyyy-MM-dd') || '',
      viewType: this.viewType
    };

    this.exportFilter = { ...this.filter };
    this.isLoading = true;

    // ONE call for both views - @ViewType decides the result shape.
    this.washService.getOrderWiseBalanceData(request).subscribe({
      next: (res: any) => {

        console.log('Request sent:', request);
        console.log('Response received:', res);
        this.isLoading = false;

        // Service normalizes to { viewType, rows }; also tolerate a raw array.
        const rows: any[] = Array.isArray(res) ? res : (res?.rows ?? []);
        const returnedViewType: 1 | 2 =
          Number(Array.isArray(res) ? this.viewType : (res?.viewType ?? this.viewType)) === 2 ? 2 : 1;

        if (rows.length) {
          if (returnedViewType === 1) {
            this.processGarmentData(rows);
          } else {
            this.processFabricData(rows);
          }
        } else {
          this.toastr.info('No data found');
          this.resetGrid();
        }
      },
      error: () => {
        this.isLoading = false;
        this.resetGrid();
        this.toastr.error('Failed to load Order-wise Balance data');
      }
    });
  }

  // =========================================================================
  // Per-view processors - normalize raw API rows into typed rows.
  // =========================================================================
  private processGarmentData(rawData: any[]): void {
    this.garmentRows = rawData.map(r => {
      const lookup = this.buildKeyLookup(r);

      const row: OrderBalanceGarmentRow = {
        receiveFrom:       this.cleanStr(this.getVal(r, lookup, 'receiveFrom', 'receiveForm')),
        buyer:             this.cleanStr(this.getVal(r, lookup, 'buyer')),
        job:               this.cleanStr(this.getVal(r, lookup, 'job')),
        orderNo:           this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
        style:             this.cleanStr(this.getVal(r, lookup, 'style')),
        color:             this.cleanStr(this.getVal(r, lookup, 'color')),
        dressPart:         this.cleanStr(this.getVal(r, lookup, 'dressPart')),
        washType:          this.cleanStr(this.getVal(r, lookup, 'washType', 'washCategory')),
        fabricComposition: this.cleanStr(this.getVal(r, lookup, 'fabricComposition', 'fabricComp')),
        gsm:               this.cleanStr(this.getVal(r, lookup, 'gsm')),
        fabricConPerDzn:   this.toNumber(this.getVal(r, lookup, 'fabricConPerDzn', 'fabricConPerDozen')),
        orderQtyPcs:       this.toNumber(this.getVal(r, lookup, 'orderQtyPcs', 'orderQty')),
        shipmentDate:      r.shipmentDate     ?? r.ShipmentDate     ?? null,
        firstReceiveDate:  r.firstReceiveDate ?? r.FirstReceiveDate ?? null,
        lastReceiveDate:   r.lastReceiveDate  ?? r.LastReceiveDate  ?? null,
        totalReceiveQtyPcs: this.toNumber(this.getVal(r, lookup, 'totalReceiveQtyPcs', 'receiveQtyPcs', 'receiveQty')),
        receiveBalancePcs: this.toNumber(this.getVal(r, lookup, 'receiveBalancePcs', 'receiveBalance')),
        firstDeliveryDate: r.firstDeliveryDate ?? r.FirstDeliveryDate ?? null,
        lastDeliveryDate:  r.lastDeliveryDate  ?? r.LastDeliveryDate  ?? null,
        totalDeliveryQtyPcs: this.toNumber(this.getVal(r, lookup, 'totalDeliveryQtyPcs', 'deliveryQtyPcs', 'deliveryQty')),
        readyForDeliveryPcs: this.toNumber(this.getVal(r, lookup, 'readyForDeliveryPcs', 'readyForDelivery')),
        approvalTrail:    this.toNumber(this.getVal(r, lookup, 'approvalTrail', 'approvalTrailQty')),
        deliveryBalanceQtyPcs: this.toNumber(this.getVal(r, lookup, 'deliveryBalanceQtyPcs', 'deliveryBalance')),
        washStatus:        this.cleanStr(this.getVal(r, lookup, 'washStatus', 'status')),
        remarks:           this.cleanStr(this.getVal(r, lookup, 'remarks', 'deliveryRemarks'))
      };

      return row;
    });

    // Sort by Buyer -> Job -> Order -> Style -> Color -> DressPart, so every
    // row belonging to the same Buyer/Job/Order/Style/Color group is
    // contiguous (DressPart rows within it appear together, in a stable order).
    this.garmentRows.sort((a, b) => this.groupCompare(a, b));

    this.garmentGrandTotal = this.computeGarmentGrandTotal(this.garmentRows);

    this.globalSearch = '';
    this.garmentFilteredRows = this.insertGarmentSubtotals(this.garmentRows);
  }

  private processFabricData(rawData: any[]): void {
    this.fabricRows = rawData.map(r => {
      const lookup = this.buildKeyLookup(r);

      const row: OrderBalanceFabricRow = {
        receiveFrom:        this.cleanStr(this.getVal(r, lookup, 'receiveFrom', 'receiveForm')),
        buyer:              this.cleanStr(this.getVal(r, lookup, 'buyer')),
        job:                this.cleanStr(this.getVal(r, lookup, 'job')),
        orderNo:            this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
        style:              this.cleanStr(this.getVal(r, lookup, 'style')),
        color:              this.cleanStr(this.getVal(r, lookup, 'color')),
        dressPart:          this.cleanStr(this.getVal(r, lookup, 'dressPart')),
        washType:           this.cleanStr(this.getVal(r, lookup, 'washType', 'washCategory')),
        fabricComposition:  this.cleanStr(this.getVal(r, lookup, 'fabricComposition', 'fabricComp')),
        batchLot:           this.cleanStr(this.getVal(r, lookup, 'batchLot', 'batchLotNo', 'batchNo')),
        gsm:                this.cleanStr(this.getVal(r, lookup, 'gsm')),
        dia:                this.toNumber(this.getVal(r, lookup, 'dia')),
        orderQtyKg:         this.toNumber(this.getVal(r, lookup, 'orderQtyKg', 'orderQty')),
        shipmentDate:       r.shipmentDate     ?? r.ShipmentDate     ?? null,
        firstReceiveDate:   r.firstReceiveDate ?? r.FirstReceiveDate ?? null,
        lastReceiveDate:    r.lastReceiveDate  ?? r.LastReceiveDate  ?? null,
        totalReceiveRoll:   this.toNumber(this.getVal(r, lookup, 'totalReceiveRoll', 'receiveRoll')),
        totalReceiveQtyKg:  this.toNumber(this.getVal(r, lookup, 'totalReceiveQtyKg', 'receiveQtyKg', 'receiveQty')),
        receiveBalanceKg:   this.toNumber(this.getVal(r, lookup, 'receiveBalanceKg', 'receiveBalance')),
        firstDeliveryDate:  r.firstDeliveryDate ?? r.FirstDeliveryDate ?? null,
        lastDeliveryDate:   r.lastDeliveryDate  ?? r.LastDeliveryDate  ?? null,
        totalDeliveryRoll:  this.toNumber(this.getVal(r, lookup, 'totalDeliveryRoll', 'deliveryRoll')),
        totalDeliveryQtyKg: this.toNumber(this.getVal(r, lookup, 'totalDeliveryQtyKg', 'deliveryQtyKg', 'deliveryQty')),
        readyForDeliveryKg: this.toNumber(this.getVal(r, lookup, 'readyForDeliveryKg', 'readyForDelivery')),
        deliveryBalanceKg:  this.toNumber(this.getVal(r, lookup, 'deliveryBalanceKg', 'deliveryBalance')),
        washStatus:         this.cleanStr(this.getVal(r, lookup, 'washStatus', 'status')),
        remarks:            this.cleanStr(this.getVal(r, lookup, 'remarks', 'deliveryRemarks'))
      };

      return row;
    });

    this.fabricRows.sort((a, b) => this.groupCompare(a, b));

    this.fabricGrandTotal = this.computeFabricGrandTotal(this.fabricRows);

    this.globalSearch = '';
    this.fabricFilteredRows = this.insertFabricSubtotals(this.fabricRows);
  }

  // =========================================================================
  // Global Search - Buyer, Job, Order, Style, Color, DressPart, WashType,
  // WashStatus, ReceiveFrom (+ numeric fields).
  //
  // Filters the raw rows, then RE-BUILDS the Sub Total rows AND the Grand
  // Total over whatever survived the filter - so searching by Style/Color (or
  // anything else) still shows each visible group's Sub Total line, and the
  // footer's Grand Total shrinks/grows to match exactly what's on screen.
  // Clearing the search restores both to the full dataset.
  // =========================================================================
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

  private garmentMatches(r: OrderBalanceGarmentRow, term: string): boolean {
    return (
      this.matches(r.receiveFrom,   term) ||
      this.matches(r.buyer,         term) ||
      this.matches(r.job,           term) ||
      this.matches(r.orderNo,       term) ||
      this.matches(r.style,         term) ||
      this.matches(r.color,         term) ||
      this.matches(r.dressPart,     term) ||
      this.matches(r.washType,      term) ||
      this.matches(r.washStatus,    term) ||
      this.matches(r.fabricComposition, term) ||
      this.matchesNumber(r.orderQtyPcs,           term) ||
      this.matchesNumber(r.totalReceiveQtyPcs,    term) ||
      this.matchesNumber(r.receiveBalancePcs,     term) ||
      this.matchesNumber(r.totalDeliveryQtyPcs,   term) ||
      this.matchesNumber(r.readyForDeliveryPcs,   term) ||
      this.matchesNumber(r.approvalTrail,         term) ||
      this.matchesNumber(r.deliveryBalanceQtyPcs, term)
    );
  }

  private fabricMatches(r: OrderBalanceFabricRow, term: string): boolean {
    return (
      this.matches(r.receiveFrom,    term) ||
      this.matches(r.buyer,          term) ||
      this.matches(r.job,            term) ||
      this.matches(r.orderNo,        term) ||
      this.matches(r.style,          term) ||
      this.matches(r.color,          term) ||
      this.matches(r.dressPart,      term) ||
      this.matches(r.washType,       term) ||
      this.matches(r.washStatus,     term) ||
      this.matches(r.fabricComposition, term) ||
      this.matches(r.batchLot,       term) ||
      this.matchesNumber(r.dia,                  term) ||
      this.matchesNumber(r.orderQtyKg,           term) ||
      this.matchesNumber(r.totalReceiveRoll,     term) ||
      this.matchesNumber(r.totalReceiveQtyKg,    term) ||
      this.matchesNumber(r.receiveBalanceKg,     term) ||
      this.matchesNumber(r.totalDeliveryRoll,    term) ||
      this.matchesNumber(r.totalDeliveryQtyKg,   term) ||
      this.matchesNumber(r.readyForDeliveryKg,   term) ||
      this.matchesNumber(r.deliveryBalanceKg,    term)
    );
  }

  /** Buyer/Job/Order/Style/Color -> DressPart comparator (keeps each group's rows contiguous). */
  private groupCompare<T extends { buyer: string; job: string; orderNo: string; style: string; color: string; dressPart: string }>(
    a: T, b: T
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
    return (a.dressPart || '').localeCompare(b.dressPart || '');
  }

  /** Buyer/Job/Order/Style/Color grouping key (no DressPart - a group can span several DressParts). */
  private groupKey(r: { buyer: string; job: string; orderNo: string; style: string; color: string }): string {
    return `${r.buyer}||${r.job}||${r.orderNo}||${r.style}||${r.color}`;
  }

  /**
   * Inserts a "Sub Total" row after the last DressPart of each
   * Buyer/Job/Order/Style/Color group. Every summed column here is a
   * per-row total (Order Qty, Receive/Delivery totals, balances), so the
   * Sub Total is a plain sum across the group's rows - no "last row wins"
   * logic is needed (unlike the Date-wise dashboard's running cumulative).
   */
  private insertGarmentSubtotals(rows: OrderBalanceGarmentRow[]): OrderBalanceGarmentRow[] {
    const result: OrderBalanceGarmentRow[] = [];
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let orderQtyPcs = 0, totalReceiveQtyPcs = 0, receiveBalancePcs = 0,
          totalDeliveryQtyPcs = 0, readyForDeliveryPcs = 0, approvalTrail = 0, deliveryBalanceQtyPcs = 0;
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) {
        const r = rows[j];
        result.push(r);
        orderQtyPcs += r.orderQtyPcs ?? 0;
        totalReceiveQtyPcs += r.totalReceiveQtyPcs ?? 0;
        receiveBalancePcs += r.receiveBalancePcs ?? 0;
        totalDeliveryQtyPcs += r.totalDeliveryQtyPcs ?? 0;
        readyForDeliveryPcs += r.readyForDeliveryPcs ?? 0;
        approvalTrail += r.approvalTrail ?? 0;
        deliveryBalanceQtyPcs += r.deliveryBalanceQtyPcs ?? 0;
        j++;
      }
      result.push({
        receiveFrom: '', buyer: '', job: '', orderNo: '', style: '', color: '', dressPart: '',
        washType: '', fabricComposition: '', gsm: '', fabricConPerDzn: null,
        orderQtyPcs,
        shipmentDate: null, firstReceiveDate: null, lastReceiveDate: null,
        totalReceiveQtyPcs, receiveBalancePcs,
        firstDeliveryDate: null, lastDeliveryDate: null,
        totalDeliveryQtyPcs, readyForDeliveryPcs, approvalTrail, deliveryBalanceQtyPcs,
        washStatus: '', remarks: '',
        isSubtotal: true
      });
      i = j;
    }
    return result;
  }

  private insertFabricSubtotals(rows: OrderBalanceFabricRow[]): OrderBalanceFabricRow[] {
    const result: OrderBalanceFabricRow[] = [];
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let orderQtyKg = 0, totalReceiveRoll = 0, totalReceiveQtyKg = 0, receiveBalanceKg = 0,
          totalDeliveryRoll = 0, totalDeliveryQtyKg = 0, readyForDeliveryKg = 0, deliveryBalanceKg = 0;
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) {
        const r = rows[j];
        result.push(r);
        orderQtyKg += r.orderQtyKg ?? 0;
        totalReceiveRoll += r.totalReceiveRoll ?? 0;
        totalReceiveQtyKg += r.totalReceiveQtyKg ?? 0;
        receiveBalanceKg += r.receiveBalanceKg ?? 0;
        totalDeliveryRoll += r.totalDeliveryRoll ?? 0;
        totalDeliveryQtyKg += r.totalDeliveryQtyKg ?? 0;
        readyForDeliveryKg += r.readyForDeliveryKg ?? 0;
        deliveryBalanceKg += r.deliveryBalanceKg ?? 0;
        j++;
      }
      result.push({
        receiveFrom: '', buyer: '', job: '', orderNo: '', style: '', color: '', dressPart: '',
        washType: '', fabricComposition: '', batchLot: '', gsm: '', dia: null,
        orderQtyKg,
        shipmentDate: null, firstReceiveDate: null, lastReceiveDate: null,
        totalReceiveRoll, totalReceiveQtyKg, receiveBalanceKg,
        firstDeliveryDate: null, lastDeliveryDate: null,
        totalDeliveryRoll, totalDeliveryQtyKg, readyForDeliveryKg, deliveryBalanceKg,
        washStatus: '', remarks: '',
        isSubtotal: true
      });
      i = j;
    }
    return result;
  }

  /** Grand Total = plain sum of every matching row (all columns here are per-row totals). */
  private computeGarmentGrandTotal(rows: OrderBalanceGarmentRow[]): {
    orderQtyPcs: number; totalReceiveQtyPcs: number; receiveBalancePcs: number;
    totalDeliveryQtyPcs: number; readyForDeliveryPcs: number; approvalTrail: number; deliveryBalanceQtyPcs: number;
  } {
    let orderQtyPcs = 0, totalReceiveQtyPcs = 0, receiveBalancePcs = 0,
        totalDeliveryQtyPcs = 0, readyForDeliveryPcs = 0, approvalTrail = 0, deliveryBalanceQtyPcs = 0;
    for (const r of rows) {
      orderQtyPcs += r.orderQtyPcs ?? 0;
      totalReceiveQtyPcs += r.totalReceiveQtyPcs ?? 0;
      receiveBalancePcs += r.receiveBalancePcs ?? 0;
      totalDeliveryQtyPcs += r.totalDeliveryQtyPcs ?? 0;
      readyForDeliveryPcs += r.readyForDeliveryPcs ?? 0;
      approvalTrail += r.approvalTrail ?? 0;
      deliveryBalanceQtyPcs += r.deliveryBalanceQtyPcs ?? 0;
    }
    return { orderQtyPcs, totalReceiveQtyPcs, receiveBalancePcs, totalDeliveryQtyPcs, readyForDeliveryPcs, approvalTrail, deliveryBalanceQtyPcs };
  }

  private computeFabricGrandTotal(rows: OrderBalanceFabricRow[]): {
    orderQtyKg: number; totalReceiveRoll: number; totalReceiveQtyKg: number; receiveBalanceKg: number;
    totalDeliveryRoll: number; totalDeliveryQtyKg: number; readyForDeliveryKg: number; deliveryBalanceKg: number;
  } {
    let orderQtyKg = 0, totalReceiveRoll = 0, totalReceiveQtyKg = 0, receiveBalanceKg = 0,
        totalDeliveryRoll = 0, totalDeliveryQtyKg = 0, readyForDeliveryKg = 0, deliveryBalanceKg = 0;
    for (const r of rows) {
      orderQtyKg += r.orderQtyKg ?? 0;
      totalReceiveRoll += r.totalReceiveRoll ?? 0;
      totalReceiveQtyKg += r.totalReceiveQtyKg ?? 0;
      receiveBalanceKg += r.receiveBalanceKg ?? 0;
      totalDeliveryRoll += r.totalDeliveryRoll ?? 0;
      totalDeliveryQtyKg += r.totalDeliveryQtyKg ?? 0;
      readyForDeliveryKg += r.readyForDeliveryKg ?? 0;
      deliveryBalanceKg += r.deliveryBalanceKg ?? 0;
    }
    return { orderQtyKg, totalReceiveRoll, totalReceiveQtyKg, receiveBalanceKg, totalDeliveryRoll, totalDeliveryQtyKg, readyForDeliveryKg, deliveryBalanceKg };
  }

  // =========================================================================
  // Clear / Excel
  // =========================================================================
  onClear(): void {
    this.filter.fromDate = null;
    this.filter.toDate   = new Date();
    this.globalSearch    = '';
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
          'Receive From': 'Sub Total:', 'Buyer': '', 'Job': '', 'Order': '', 'Style': '', 'Color': '',
          'Dress Part': '', 'Wash Type': '', 'Fabric Composition': '', 'GSM': '', 'Fabric Con. per Dzn': '',
          'Order Qty (Pcs)': row.orderQtyPcs ?? '',
          'Shipment Date': '', '1st Receive Date': '', 'Last Receive Date': '',
          'Total Receive Qty (Pcs)': row.totalReceiveQtyPcs ?? '',
          'Receive Balance (Pcs)': row.receiveBalancePcs ?? '',
          '1st Delivery Date': '', 'Last Delivery Date': '',
          'Total Delivery Qty (Pcs)': row.totalDeliveryQtyPcs ?? '',
          'Ready for Delivery (Pcs)': row.readyForDeliveryPcs ?? '',
          'Approval / Trail': row.approvalTrail ?? '',
          'Delivery Balance Qty (Pcs)': row.deliveryBalanceQtyPcs ?? '',
          'Wash Status': '', 'Remarks': ''
        };
      }
      return {
        'Receive From':               row.receiveFrom,
        'Buyer':                      row.buyer,
        'Job':                        row.job,
        'Order':                      row.orderNo,
        'Style':                      row.style,
        'Color':                      row.color,
        'Dress Part':                 row.dressPart,
        'Wash Type':                  row.washType,
        'Fabric Composition':         row.fabricComposition,
        'GSM':                        row.gsm,
        'Fabric Con. per Dzn':        row.fabricConPerDzn ?? '',
        'Order Qty (Pcs)':            row.orderQtyPcs ?? '',
        'Shipment Date':              this.formatDate(row.shipmentDate),
        '1st Receive Date':           this.formatDate(row.firstReceiveDate),
        'Last Receive Date':          this.formatDate(row.lastReceiveDate),
        'Total Receive Qty (Pcs)':    row.totalReceiveQtyPcs ?? '',
        'Receive Balance (Pcs)':      row.receiveBalancePcs ?? '',
        '1st Delivery Date':          this.formatDate(row.firstDeliveryDate),
        'Last Delivery Date':         this.formatDate(row.lastDeliveryDate),
        'Total Delivery Qty (Pcs)':   row.totalDeliveryQtyPcs ?? '',
        'Ready for Delivery (Pcs)':   row.readyForDeliveryPcs ?? '',
        'Approval / Trail':           row.approvalTrail ?? '',
        'Delivery Balance Qty (Pcs)': row.deliveryBalanceQtyPcs ?? '',
        'Wash Status':                row.washStatus,
        'Remarks':                    row.remarks
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 18 },
      { wch: 16 }, { wch: 12 }, { wch: 18 }, { wch: 28 }, { wch: 8 },
      { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
      { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 24 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OrderWise Balance (Pcs)');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `OrderWise_Balance_Pcs_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  private exportFabricExcel(): void {
    if (!this.fabricFilteredRows.length) {
      this.toastr.warning('No data to export');
      return;
    }

    const exportData = this.fabricFilteredRows.map(row => row.isSubtotal ? {
      'Receive From': 'Sub Total:', 'Buyer': '', 'Job': '', 'Order': '', 'Style': '', 'Color': '',
      'Dress Part': '', 'Wash Type': '', 'Fabric Composition': '', 'Batch / Lot': '', 'GSM': '', 'Dia': '',
      'Order Qty (Kg)': row.orderQtyKg ?? '',
      'Shipment Date': '', '1st Receive Date': '', 'Last Receive Date': '',
      'Total Receive Roll': row.totalReceiveRoll ?? '',
      'Total Receive Qty (Kg)': row.totalReceiveQtyKg ?? '',
      'Receive Balance (Kg)': row.receiveBalanceKg ?? '',
      '1st Delivery Date': '', 'Last Delivery Date': '',
      'Total Delivery Roll': row.totalDeliveryRoll ?? '',
      'Total Delivery Qty (Kg)': row.totalDeliveryQtyKg ?? '',
      'Ready for Delivery (Kg)': row.readyForDeliveryKg ?? '',
      'Delivery Balance Qty (Kg)': row.deliveryBalanceKg ?? '',
      'Wash Status': '', 'Remarks': ''
    } : {
      'Receive From':               row.receiveFrom,
      'Buyer':                      row.buyer,
      'Job':                        row.job,
      'Order':                      row.orderNo,
      'Style':                      row.style,
      'Color':                      row.color,
      'Dress Part':                 row.dressPart,
      'Wash Type':                  row.washType,
      'Fabric Composition':         row.fabricComposition,
      'Batch / Lot':                row.batchLot,
      'GSM':                        row.gsm,
      'Dia':                        row.dia ?? '',
      'Order Qty (Kg)':             row.orderQtyKg ?? '',
      'Shipment Date':              this.formatDate(row.shipmentDate),
      '1st Receive Date':           this.formatDate(row.firstReceiveDate),
      'Last Receive Date':          this.formatDate(row.lastReceiveDate),
      'Total Receive Roll':         row.totalReceiveRoll ?? '',
      'Total Receive Qty (Kg)':     row.totalReceiveQtyKg ?? '',
      'Receive Balance (Kg)':       row.receiveBalanceKg ?? '',
      '1st Delivery Date':          this.formatDate(row.firstDeliveryDate),
      'Last Delivery Date':         this.formatDate(row.lastDeliveryDate),
      'Total Delivery Roll':        row.totalDeliveryRoll ?? '',
      'Total Delivery Qty (Kg)':    row.totalDeliveryQtyKg ?? '',
      'Ready for Delivery (Kg)':    row.readyForDeliveryKg ?? '',
      'Delivery Balance Qty (Kg)':  row.deliveryBalanceKg ?? '',
      'Wash Status':                row.washStatus,
      'Remarks':                    row.remarks
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 18 },
      { wch: 16 }, { wch: 12 }, { wch: 18 }, { wch: 28 }, { wch: 14 },
      { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
      { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
      { wch: 24 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OrderWise Balance (Kg)');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `OrderWise_Balance_Kg_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  // =========================================================================
  // PDF - exactly what the grid holds (search applied, Sub Totals + Grand Total)
  // =========================================================================
  onPdf(): void {
    const isGarment = this.viewType === 1;
    if (!(isGarment ? this.garmentFilteredRows.length : this.fabricFilteredRows.length)) {
      this.toastr.warning('No data to export');
      return;
    }
    const n = (v: number | null | undefined) => this.fmtNum(v);
    const int = (v: number | null | undefined) => v === null || v === undefined ? '' : Math.round(v).toLocaleString('en-US');
    const d = (v: any) => this.formatDate(v);
    const label = (text: string, span: number): PdfCell => ({ content: text, colSpan: span, align: 'right' });
    const f = this.exportFilter ?? this.filter;
    const meta = [
      { label: 'Unit', value: this.UnitList.find(u => u.value === f.UnitId)?.label },
      { label: 'Period', value: `${this.formatPeriodDate(f.fromDate)} to ${this.formatPeriodDate(f.toDate)}` },
      { label: 'View', value: isGarment ? 'Garments (Pcs)' : 'Fabric & Cutting Parts (Kg)' },
      { label: 'Search', value: this.globalSearch?.trim() ? `"${this.globalSearch.trim()}"` : '' }
    ];
    const lead: PdfColumn[] = [
      { header: 'Receive From', align: 'center' },
      { header: 'Buyer' }, { header: 'Job' }, { header: 'Order' }, { header: 'Style' }, { header: 'Color' },
      { header: 'Dress Part' }, { header: 'Wash Type' }, { header: 'Fabric Composition' }
    ];
    const dateCol = (header: string): PdfColumn => ({ header, align: 'center', minWidth: 12 });

    if (isGarment) {
      const columns: PdfColumn[] = [
        ...lead,
        { header: 'GSM', align: 'center' },
        { header: 'Fabric Con per Dzn', align: 'center' },
        { header: 'Order Qty (Pcs)', align: 'right' },
        dateCol('Shipment Date'), dateCol('1st Receive Date'), dateCol('Last Receive Date'),
        { header: 'Total Receive Qty (Pcs)', align: 'right' },
        { header: 'Receive Balance (Pcs)', align: 'right', tone: 'balance' },
        dateCol('1st Delivery Date'), dateCol('Last Delivery Date'),
        { header: 'Total Delivery Qty (Pcs)', align: 'right' },
        { header: 'Ready for Delivery (Pcs)', align: 'right' },
        { header: 'Approval / Trail', align: 'right' },
        { header: 'Delivery Balance Qty (Pcs)', align: 'right', tone: 'balance' },
        { header: 'Wash Status', align: 'center' },
        { header: 'Remarks' }
      ];
      const rows: PdfRow[] = this.garmentFilteredRows.map(r => r.isSubtotal
        ? { kind: 'subtotal', cells: [
            label('Sub Total:', 11), n(r.orderQtyPcs), '', '', '', n(r.totalReceiveQtyPcs), n(r.receiveBalancePcs), '', '',
            n(r.totalDeliveryQtyPcs), n(r.readyForDeliveryPcs), n(r.approvalTrail), n(r.deliveryBalanceQtyPcs), '', ''
          ] }
        : { cells: [
            r.receiveFrom, r.buyer, r.job, r.orderNo, r.style, r.color, r.dressPart, r.washType, r.fabricComposition, r.gsm,
            r.fabricConPerDzn === null || r.fabricConPerDzn === undefined ? '-' : n(r.fabricConPerDzn),
            n(r.orderQtyPcs), d(r.shipmentDate), d(r.firstReceiveDate), d(r.lastReceiveDate),
            n(r.totalReceiveQtyPcs), n(r.receiveBalancePcs), d(r.firstDeliveryDate), d(r.lastDeliveryDate),
            n(r.totalDeliveryQtyPcs), n(r.readyForDeliveryPcs), n(r.approvalTrail), n(r.deliveryBalanceQtyPcs),
            r.washStatus || '-', r.remarks || '-'
          ] });
      const g = this.garmentGrandTotal;
      this.runPdfExport({
        title: 'Order-wise Balance Dashboard', subtitle: 'Garments (Pcs)', meta, columns, rows,
        footRows: g ? [[
          label('Grand Total:', 11), n(g.orderQtyPcs), '', '', '', n(g.totalReceiveQtyPcs), n(g.receiveBalancePcs), '', '',
          n(g.totalDeliveryQtyPcs), n(g.readyForDeliveryPcs), n(g.approvalTrail), n(g.deliveryBalanceQtyPcs), '', ''
        ]] : [],
        fileName: 'OrderWise_Balance_Garments'
      });
    } else {
      const columns: PdfColumn[] = [
        ...lead,
        { header: 'Batch / Lot', align: 'center' },
        { header: 'GSM', align: 'center' },
        { header: 'Dia', align: 'center' },
        { header: 'Order Qty (Kg)', align: 'right' },
        dateCol('Shipment Date'), dateCol('1st Receive Date'), dateCol('Last Receive Date'),
        { header: 'Total Receive Roll', align: 'right' },
        { header: 'Total Receive Qty (Kg)', align: 'right' },
        { header: 'Receive Balance (Kg)', align: 'right', tone: 'balance' },
        dateCol('1st Delivery Date'), dateCol('Last Delivery Date'),
        { header: 'Total Delivery Roll', align: 'right' },
        { header: 'Total Delivery Qty (Kg)', align: 'right' },
        { header: 'Ready for Delivery (Kg)', align: 'right' },
        { header: 'Delivery Balance Qty (Kg)', align: 'right', tone: 'balance' },
        { header: 'Wash Status', align: 'center' },
        { header: 'Remarks' }
      ];
      const rows: PdfRow[] = this.fabricFilteredRows.map(r => r.isSubtotal
        ? { kind: 'subtotal', cells: [
            label('Sub Total:', 12), n(r.orderQtyKg), '', '', '', int(r.totalReceiveRoll), n(r.totalReceiveQtyKg), n(r.receiveBalanceKg),
            '', '', int(r.totalDeliveryRoll), n(r.totalDeliveryQtyKg), n(r.readyForDeliveryKg), n(r.deliveryBalanceKg), '', ''
          ] }
        : { cells: [
            r.receiveFrom, r.buyer, r.job, r.orderNo, r.style, r.color, r.dressPart, r.washType, r.fabricComposition,
            r.batchLot, r.gsm, r.dia ?? '-', n(r.orderQtyKg), d(r.shipmentDate), d(r.firstReceiveDate), d(r.lastReceiveDate),
            int(r.totalReceiveRoll), n(r.totalReceiveQtyKg), n(r.receiveBalanceKg), d(r.firstDeliveryDate), d(r.lastDeliveryDate),
            int(r.totalDeliveryRoll), n(r.totalDeliveryQtyKg), n(r.readyForDeliveryKg), n(r.deliveryBalanceKg),
            r.washStatus || '-', r.remarks || '-'
          ] });
      const g = this.fabricGrandTotal;
      this.runPdfExport({
        title: 'Order-wise Balance Dashboard', subtitle: 'Fabric & Cutting Parts (Kg)', meta, columns, rows,
        footRows: g ? [[
          label('Grand Total:', 12), n(g.orderQtyKg), '', '', '', int(g.totalReceiveRoll), n(g.totalReceiveQtyKg), n(g.receiveBalanceKg),
          '', '', int(g.totalDeliveryRoll), n(g.totalDeliveryQtyKg), n(g.readyForDeliveryKg), n(g.deliveryBalanceKg), '', ''
        ]] : [],
        fileName: 'OrderWise_Balance_Fabric'
      });
    }
  }

  private runPdfExport(opts: Parameters<DashboardPdfService['export']>[0]): void {
    const unit = opts.meta.find(m => m.label === 'Unit')?.value || undefined;
    this.pdf.export({ ...opts, company: unit })
      .then(() => this.toastr.success('PDF exported successfully'))
      .catch(() => this.toastr.error('Failed to export PDF'));
  }

  private formatPeriodDate(d: any): string {
    return d ? (this.datePipe.transform(d, 'd MMM yyyy') || '') : '...';
  }

  // =========================================================================
  // TrackBy
  // =========================================================================
  trackByGarment(index: number, row: OrderBalanceGarmentRow): string {
    if (row.isSubtotal) return `subtotal-${index}`;
    return `${row.buyer}-${row.job}-${row.orderNo}-${row.style}-${row.color}-${row.dressPart}-${index}`;
  }

  trackByFabric(index: number, row: OrderBalanceFabricRow): string {
    if (row.isSubtotal) return `subtotal-${index}`;
    return `${row.buyer}-${row.job}-${row.orderNo}-${row.style}-${row.color}-${row.dressPart}-${row.batchLot}-${index}`;
  }

  // =========================================================================
  // Helpers
  // =========================================================================
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

  /** Normalized key lookup ("OrderQtyPcs" / "order_qty_pcs" -> "orderqtypcs"). */
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

  private matches(value: string | undefined, term: string): boolean {
    return (value || '').toLowerCase().includes(term);
  }

  private matchesNumber(value: number | null, term: string): boolean {
    return value != null && value.toString().includes(term);
  }
}