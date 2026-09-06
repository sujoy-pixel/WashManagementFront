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

interface GarmentRow {
  receiveFrom: string;
  buyer: string;
  job: string;
  orderNo: string;
  style: string;
  color: string;
  dressPart: string;
  gsm: string;
  fabricComposition: string;
  fabricConPerDzn: string;
  orderQty: number | null;
  shipmentDate: string | Date | null;
  receiveQty: number | null;
  cumReceiveQty: number | null;
  deliveryQty: number | null;
  cumDeliveryQty: number | null;
  approvalTrail: number | null;
  balanceQty: number | null;
  washType: string;
}

interface FabricRow {
  receiveFrom: string;
  buyer: string;
  job: string;
  orderNo: string;
  style: string;
  color: string;
  batchLot: string;
  dia: number | null;
  orderQtyKg: number | null;
  receiveRoll: number | null;
  calculatedQtyKg: number | null;
  deliveryRoll: number | null;
  calculatedDeliveryQtyKg: number | null;
  balanceQtyKg: number | null;
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
        receiveFrom: this.cleanStr(this.getVal(r, lookup, 'receiveFrom', 'receiveForm')),
        buyer: this.cleanStr(this.getVal(r, lookup, 'buyer')),
        job: this.cleanStr(this.getVal(r, lookup, 'job')),
        orderNo: this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
        style: this.cleanStr(this.getVal(r, lookup, 'style')),
        color: this.cleanStr(this.getVal(r, lookup, 'color')),
        dressPart: this.cleanStr(this.getVal(r, lookup, 'dressPart')),
        gsm: this.cleanStr(this.getVal(r, lookup, 'gsm')),
        fabricComposition: this.cleanStr(this.getVal(r, lookup, 'fabricComposition')),
        fabricConPerDzn: this.cleanStr(this.getVal(r, lookup, 'fabricConPerDzn', 'fabricConPerDozen')),
        orderQty: this.toNumber(this.getVal(r, lookup, 'orderQty', 'orderQtyPcs')),
        shipmentDate: r.shipmentDate ?? r.ShipmentDate ?? null,
        receiveQty: this.toNumber(this.getVal(r, lookup, 'receiveQty', 'receiveQtyPcs', 'receivePcs')),
        cumReceiveQty: this.toNumber(this.getVal(r, lookup, 'cumReceiveQty', 'cumReceiveQtyPcs')),
        deliveryQty: this.toNumber(this.getVal(r, lookup, 'deliveryQty', 'deliveryQtyPcs', 'deliveryPcs')),
        cumDeliveryQty: this.toNumber(this.getVal(r, lookup, 'cumDeliveryQty', 'cumDeliveryQtyPcs')),
        approvalTrail: this.toNumber(this.getVal(r, lookup, 'approvalTrail', 'approvalTrailQty')),
        balanceQty: this.toNumber(this.getVal(r, lookup, 'balanceQty', 'balanceQtyPcs')),
        washType: this.cleanStr(this.getVal(r, lookup, 'washType', 'washCategory'))
      };

      return row;
    });

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

      const row: FabricRow = {
        receiveFrom: this.cleanStr(this.getVal(r, lookup, 'receiveFrom', 'receiveForm')),
        buyer: this.cleanStr(this.getVal(r, lookup, 'buyer')),
        job: this.cleanStr(this.getVal(r, lookup, 'job')),
        orderNo: this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
        style: this.cleanStr(this.getVal(r, lookup, 'style')),
        color: this.cleanStr(this.getVal(r, lookup, 'color')),
        batchLot: this.cleanStr(this.getVal(r, lookup, 'batchLot', 'batchLotNo')),
        dia: this.toNumber(this.getVal(r, lookup, 'dia')),
        orderQtyKg: this.toNumber(this.getVal(r, lookup, 'orderQtyKg')),
        receiveRoll: this.toNumber(this.getVal(r, lookup, 'receiveRoll')),
        calculatedQtyKg: this.toNumber(this.getVal(r, lookup, 'calculatedQtyKg', 'cumReceiveQtyKg')),
        deliveryRoll: this.toNumber(this.getVal(r, lookup, 'deliveryRoll')),
        calculatedDeliveryQtyKg: this.toNumber(this.getVal(r, lookup, 'calculatedDeliveryQtyKg', 'cumDeliveryQtyKg')),
        balanceQtyKg: this.toNumber(this.getVal(r, lookup, 'balanceQtyKg'))
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

  onGlobalSearch(): void {
    const term = this.globalSearch?.trim()?.toLowerCase() ?? '';

    if (term.length) {
      if (this.viewType === 1) {
        this.garmentFilteredRows = this.garmentRows.filter(r => {
          return (
            this.matches(r.receiveFrom, term) ||
            this.matches(r.buyer, term) ||
            this.matches(r.job, term) ||
            this.matches(r.orderNo, term) ||
            this.matches(r.style, term) ||
            this.matches(r.color, term) ||
            this.matches(r.dressPart, term) ||
            this.matches(r.washType, term) ||
            this.matchesNumber(r.orderQty, term) ||
            this.matchesNumber(r.receiveQty, term) ||
            this.matchesNumber(r.cumReceiveQty, term) ||
            this.matchesNumber(r.deliveryQty, term) ||
            this.matchesNumber(r.cumDeliveryQty, term) ||
            this.matchesNumber(r.balanceQty, term)
          );
        });
      } else {
        this.fabricFilteredRows = this.fabricRows.filter(r => {
          return (
            this.matches(r.receiveFrom, term) ||
            this.matches(r.buyer, term) ||
            this.matches(r.job, term) ||
            this.matches(r.orderNo, term) ||
            this.matches(r.style, term) ||
            this.matches(r.color, term) ||
            this.matches(r.batchLot, term) ||
            this.matchesNumber(r.dia, term) ||
            this.matchesNumber(r.orderQtyKg, term) ||
            this.matchesNumber(r.receiveRoll, term) ||
            this.matchesNumber(r.calculatedQtyKg, term) ||
            this.matchesNumber(r.deliveryRoll, term) ||
            this.matchesNumber(r.calculatedDeliveryQtyKg, term) ||
            this.matchesNumber(r.balanceQtyKg, term)
          );
        });
      }
    } else {
      if (this.viewType === 1) {
        this.garmentFilteredRows = [...this.garmentRows];
      } else {
        this.fabricFilteredRows = [...this.fabricRows];
      }
    }
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

    const exportData = this.garmentFilteredRows.map(row => ({
      'Receive From': row.receiveFrom,
      'Buyer': row.buyer,
      'Job': row.job,
      'Order': row.orderNo,
      'Style': row.style,
      'Color': row.color,
      'Dress Part': row.dressPart,
      'GSM': row.gsm,
      'Fabric Composition': row.fabricComposition,
      'Fabric Con per Dzn': row.fabricConPerDzn,
      'Order Qty': row.orderQty ?? '',
      'Shipment Date': this.formatDate(row.shipmentDate),
      'Receive Qty (Pcs)': row.receiveQty ?? '',
      'Cum. Receive Qty': row.cumReceiveQty ?? '',
      'Delivery Qty (Pcs)': row.deliveryQty ?? '',
      'Cum. Delivery Qty': row.cumDeliveryQty ?? '',
      'Approval / Trail': row.approvalTrail ?? '',
      'Balance Qty (Pcs)': row.balanceQty ?? '',
      'Wash Type': row.washType
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 18 },
      { wch: 14 }, { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
      { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
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

    const exportData = this.fabricFilteredRows.map(row => ({
      'Receive From': row.receiveFrom,
      'Buyer': row.buyer,
      'Job': row.job,
      'Order': row.orderNo,
      'Style': row.style,
      'Color': row.color,
      'Batch/Lot': row.batchLot,
      'Dia': row.dia ?? '',
      'Order Qty (Kg)': row.orderQtyKg ?? '',
      'Receive Roll': row.receiveRoll ?? '',
      'Calculated Qty (Kg)': row.calculatedQtyKg ?? '',
      'Delivery Roll': row.deliveryRoll ?? '',
      'Calculated Delivery Qty (Kg)': row.calculatedDeliveryQtyKg ?? '',
      'Balance Qty (Kg)': row.balanceQtyKg ?? ''
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 18 },
      { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
      { wch: 22 }, { wch: 16 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fabric Balance');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Fabric_Balance_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  trackByGarment(index: number, row: GarmentRow): string {
    return `${row.orderNo}-${row.style}-${row.color}-${row.dressPart}-${index}`;
  }

  trackByFabric(index: number, row: FabricRow): string {
    return `${row.orderNo}-${row.style}-${row.color}-${row.batchLot}-${index}`;
  }

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
