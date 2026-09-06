import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { WashSetupService } from '../../../services/washsetup.service';

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

  garmentRows: OrderBalanceGarmentRow[] = [];
  garmentFilteredRows: OrderBalanceGarmentRow[] = [];
  fabricRows: OrderBalanceFabricRow[] = [];
  fabricFilteredRows: OrderBalanceFabricRow[] = [];

  constructor(
    private washService: WashSetupService,
    private datePipe: DatePipe,
    private toastr: ToastrService
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

    this.isLoading = true;

    // ONE call for both views - @ViewType decides the result shape.
    this.washService.getOrderWiseBalanceData(request).subscribe({
      next: (res: any) => {
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

    // Sort by buyer -> job -> orderNo (matches SP ORDER BY grain)
    this.garmentRows.sort((a, b) => {
      const buyerComp = (a.buyer || '').localeCompare(b.buyer || '');
      if (buyerComp !== 0) return buyerComp;
      const jobComp = (a.job || '').localeCompare(b.job || '');
      if (jobComp !== 0) return jobComp;
      return (a.orderNo || '').localeCompare(b.orderNo || '');
    });

    this.globalSearch = '';
    this.garmentFilteredRows = [...this.garmentRows];
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

    this.fabricRows.sort((a, b) => {
      const buyerComp = (a.buyer || '').localeCompare(b.buyer || '');
      if (buyerComp !== 0) return buyerComp;
      const jobComp = (a.job || '').localeCompare(b.job || '');
      if (jobComp !== 0) return jobComp;
      return (a.orderNo || '').localeCompare(b.orderNo || '');
    });

    this.globalSearch = '';
    this.fabricFilteredRows = [...this.fabricRows];
  }

  // =========================================================================
  // Global Search - Buyer, Job, Order, Style, Color, DressPart, WashType,
  // WashStatus, ReceiveFrom (+ numeric fields).
  // =========================================================================
  onGlobalSearch(): void {
    const term = this.globalSearch?.trim()?.toLowerCase() ?? '';

    if (!term.length) {
      if (this.viewType === 1) {
        this.garmentFilteredRows = [...this.garmentRows];
      } else {
        this.fabricFilteredRows = [...this.fabricRows];
      }
      return;
    }

    if (this.viewType === 1) {
      this.garmentFilteredRows = this.garmentRows.filter(r =>
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
    } else {
      this.fabricFilteredRows = this.fabricRows.filter(r =>
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

    const exportData = this.garmentFilteredRows.map(row => ({
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
    }));

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

    const exportData = this.fabricFilteredRows.map(row => ({
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
    }));

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
  // TrackBy
  // =========================================================================
  trackByGarment(index: number, row: OrderBalanceGarmentRow): string {
    return `${row.buyer}-${row.job}-${row.orderNo}-${row.style}-${row.color}-${row.dressPart}-${index}`;
  }

  trackByFabric(index: number, row: OrderBalanceFabricRow): string {
    return `${row.buyer}-${row.job}-${row.orderNo}-${row.style}-${row.color}-${row.dressPart}-${row.batchLot}-${index}`;
  }

  // =========================================================================
  // Totals (live, recomputed on every search)
  // =========================================================================
  get totalsGarment() {
    const rows = this.garmentFilteredRows;
    const sum = (sel: (r: OrderBalanceGarmentRow) => number | null | undefined) =>
      rows.reduce((acc, r) => acc + (sel(r) ?? 0), 0);
    return {
      orderQtyPcs:           sum(r => r.orderQtyPcs),
      totalReceiveQtyPcs:    sum(r => r.totalReceiveQtyPcs),
      receiveBalancePcs:     sum(r => r.receiveBalancePcs),
      totalDeliveryQtyPcs:   sum(r => r.totalDeliveryQtyPcs),
      readyForDeliveryPcs:   sum(r => r.readyForDeliveryPcs),
      approvalTrail:         sum(r => r.approvalTrail),
      deliveryBalanceQtyPcs: sum(r => r.deliveryBalanceQtyPcs)
    };
  }

  get totalsFabric() {
    const rows = this.fabricFilteredRows;
    const sum = (sel: (r: OrderBalanceFabricRow) => number | null | undefined) =>
      rows.reduce((acc, r) => acc + (sel(r) ?? 0), 0);
    return {
      orderQtyKg:         sum(r => r.orderQtyKg),
      totalReceiveRoll:   sum(r => r.totalReceiveRoll),
      totalReceiveQtyKg:  sum(r => r.totalReceiveQtyKg),
      receiveBalanceKg:   sum(r => r.receiveBalanceKg),
      totalDeliveryRoll:  sum(r => r.totalDeliveryRoll),
      totalDeliveryQtyKg: sum(r => r.totalDeliveryQtyKg),
      readyForDeliveryKg: sum(r => r.readyForDeliveryKg),
      deliveryBalanceKg:  sum(r => r.deliveryBalanceKg)
    };
  }

  // =========================================================================
  // Helpers
  // =========================================================================
  private resetGrid(): void {
    this.garmentRows = [];
    this.garmentFilteredRows = [];
    this.fabricRows = [];
    this.fabricFilteredRows = [];
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