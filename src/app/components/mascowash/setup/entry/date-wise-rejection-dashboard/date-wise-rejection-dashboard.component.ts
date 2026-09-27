import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { WashSetupService } from '../../../services/washsetup.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

interface SizeColumn {
  size: string;
  label: string;
}

interface DateWiseRejectionRow {
  date: string | Date | null;
  trackingNo: string;
  receiveFrom: string;
  buyer: string;
  job: string;
  orderNo: string;
  style: string;
  color: string;
  dressPart: string;
  washCategory: string;
  itemName: string;
  shift: string;
  qcName: string;
  receiveQty: number | null;
  uom: string;
  batchNo: string;
  totalCheckQty: number | null;
  sizeRejects: { [size: string]: number };
  totalRejectQty: number | null;
  rejectPercent: number | null;
  isSubtotal?: boolean;
}

/**
 * Sub Total / Grand Total figures.
 * - receiveQty is per Tracking No (the same tracking no repeats across shifts/dates),
 *   so it is counted ONCE per distinct Tracking No, never summed across every row.
 * - Check / Reject / per-size rejects are genuinely additive per row.
 */
interface RejectionTotals {
  receiveQty: number;
  uom: string;
  totalCheckQty: number;
  totalRejectQty: number;
  rejectPercent: number | null;
  sizeRejects: { [size: string]: number };
}

@Component({
  selector: 'app-date-wise-rejection-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  providers: [DatePipe],
  templateUrl: './date-wise-rejection-dashboard.component.html',
  styleUrls: ['./date-wise-rejection-dashboard.component.scss']
})
export class DateWiseRejectionDashboardComponent implements OnInit {

  filter: any = {
    UnitId: null,
    BuyerId: null,
    fromDate: null,
    toDate: new Date()
  };

  bsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'D MMM YYYY'
  };

  UnitList: any[] = [];
  BuyerList: any[] = [];

  // Dynamic size headers loaded from DB based on selected filter
  sizeColumns: SizeColumn[] = [];

  // Static columns before size columns = 19 (Date up to Reject %)
  readonly fixedColumnCount = 19;

  globalSearch = '';
  isLoading = false;

  allRows: DateWiseRejectionRow[] = [];
  // Display rows: matched rows + a Sub Total row after each Buyer/Job/Order/Style/Color group
  filteredRows: DateWiseRejectionRow[] = [];
  // Recomputed over whatever the global search currently matches
  grandTotal: RejectionTotals | null = null;

  constructor(
    private washService: WashSetupService,
    private datePipe: DatePipe,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.BuyerloadDropdowns();
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

  BuyerloadDropdowns(): void {
    this.washService.GetBuyerNameDDL().subscribe({
      next: res => {
        this.BuyerList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName ?? x.BuyerName,
          value: x.ID ?? x.id ?? x.BuyerNo
        }));
      },
      error: () => {
        this.toastr.warning('Failed to load Buyer list');
      }
    });
  }

  onUnitChange(): void {
    if (!this.filter.UnitId) return;

    this.washService.GetBuyerNameDDL().subscribe({
      next: res => {
        this.BuyerList = (res || []).map((x: any) => ({
          label: x.DisplayName ?? x.displayName ?? x.BuyerName,
          value: x.ID ?? x.id ?? x.BuyerNo
        }));

        if (this.BuyerList.length === 1) {
          this.filter.BuyerId = Number(this.BuyerList[0].value);
          this.onBuyerChange();
        } else {
          this.filter.BuyerId = null;
          this.resetSizes();
        }
      },
      error: () => {
        this.toastr.warning('Failed to load Buyer list');
        this.resetSizes();
      }
    });
  }

  onBuyerChange(): void {
    if (!this.filter.UnitId || !this.filter.BuyerId) {
      this.resetSizes();
      return;
    }

    const request = {
      unitId: this.filter.UnitId,
      buyerId: this.filter.BuyerId
    };

    // Try DateWise sizes first, fallback to StyleWise sizes
    this.washService.getDateWiseRejectionSizes(request).subscribe({
      next: (res: any[]) => {
        const sizes = (res || [])
          .map((x: any) => this.cleanStr(typeof x === 'string' ? x : (x.SizeName ?? x.sizeName ?? x.Size ?? x.size ?? x.label)))
          .filter((s: string) => !!s);

        this.sizeColumns = sizes.map((s: string) => ({ size: s, label: s }));
        this.resetGrid();
      },
      error: () => {
        this.washService.getStyleWiseRejectionSizes(request).subscribe({
          next: (res: any[]) => {
            const sizes = (res || [])
              .map((x: any) => this.cleanStr(typeof x === 'string' ? x : (x.SizeName ?? x.sizeName ?? x.Size ?? x.size ?? x.label)))
              .filter((s: string) => !!s);
            this.sizeColumns = sizes.map((s: string) => ({ size: s, label: s }));
            this.resetGrid();
          },
          error: () => {
            this.resetSizes();
            this.toastr.warning('Failed to load size headers');
          }
        });
      }
    });
  }

  resetSizes(): void {
    this.sizeColumns = [];
    this.resetGrid();
  }

  onSearch(): void {
    if (!this.filter.UnitId) {
      this.toastr.warning('Please Select Unit');
      return;
    }
    if (!this.filter.BuyerId) {
      this.toastr.warning('Please Select Buyer');
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

    const request = {
      unitId: this.filter.UnitId,
      buyerId: this.filter.BuyerId,
      fromDate: this.datePipe.transform(this.filter.fromDate, 'yyyy-MM-dd') || '',
      toDate: this.datePipe.transform(this.filter.toDate, 'yyyy-MM-dd') || ''
    };

    this.isLoading = true;
    this.washService.getDateWiseRejectionData(request).subscribe({
      next: (res: any[]) => {
        
        console.log('Date-wise Rejection data:', res);
        this.isLoading = false;
        if (res?.length) {
          this.processRawData(res);
        } else {
          this.toastr.info('No data found');
          this.resetGrid();
        }
      },
      error: () => {
        this.isLoading = false;
        this.resetGrid();
        this.toastr.error('Failed to load Date-wise Rejection data');
      }
    });
  }

  private processRawData(rawData: any[]): void {
    this.rebuildSizeColumns(rawData);

    this.allRows = rawData.map(r => {
      const lookup = this.buildKeyLookup(r);

      const row: DateWiseRejectionRow = {
        date: r.date ?? r.Date ?? null,
        trackingNo: this.cleanStr(this.getVal(r, lookup, 'trackingNo', 'tracking')),
        receiveFrom: this.cleanStr(this.getVal(r, lookup, 'receiveFrom', 'receiveForm')),
        buyer: this.cleanStr(this.getVal(r, lookup, 'buyer')),
        job: this.cleanStr(this.getVal(r, lookup, 'job')),
        orderNo: this.cleanStr(this.getVal(r, lookup, 'orderNo', 'order')),
        style: this.cleanStr(this.getVal(r, lookup, 'style')),
        color: this.cleanStr(this.getVal(r, lookup, 'color')),
        dressPart: this.cleanStr(this.getVal(r, lookup, 'dressPart')),
        washCategory: this.cleanStr(this.getVal(r, lookup, 'washCategory')),
        itemName: this.cleanStr(this.getVal(r, lookup, 'itemName')),
        shift: this.cleanStr(this.getVal(r, lookup, 'shift')),
        qcName: this.cleanStr(this.getVal(r, lookup, 'qcName')),
        receiveQty: this.toNumber(this.getVal(r, lookup, 'receiveQty', 'receivedQty')),
        uom: this.cleanStr(this.getVal(r, lookup, 'uom')),
        batchNo: this.cleanStr(this.getVal(r, lookup, 'batchNo', 'batch')),
        totalCheckQty: this.toNumber(this.getVal(r, lookup, 'totalCheckQty')) ?? 0,
        sizeRejects: {},
        totalRejectQty: 0,
        rejectPercent: this.toNumber(this.getVal(r, lookup, 'rejectPercent'))
      };

      const rawSizeRejects = this.getVal(r, lookup, 'sizeRejects') || {};

      let sizeSum = 0;
      this.sizeColumns.forEach(col => {
        const val = this.getSizeValue(rawSizeRejects, col.size);
        row.sizeRejects[col.size] = val;
        sizeSum += val;
      });

      const explicitRejectQty = this.toNumber(this.getVal(r, lookup, 'totalRejectQty'));
      row.totalRejectQty = explicitRejectQty !== null ? explicitRejectQty : sizeSum;

      if (row.rejectPercent === null || row.rejectPercent === undefined || isNaN(row.rejectPercent)) {
        row.rejectPercent = this.calcPercent(row.totalRejectQty, row.totalCheckQty);
      }

      return row;
    });

    // Sort by group (Buyer/Job/Order/Style/Color), then Date, Tracking No, Shift,
    // so each group's rows are contiguous and its Sub Total lands right after them.
    this.allRows.sort((a, b) => this.groupThenDateCompare(a, b));

    this.globalSearch = '';
    this.applyView(this.allRows);
  }

  /** Rebuilds the grid rows (with Sub Totals) and the Grand Total from the given matched rows. */
  private applyView(rows: DateWiseRejectionRow[]): void {
    this.filteredRows = this.insertSubtotals(rows);
    this.grandTotal = rows.length ? this.computeTotals(rows) : null;
  }

  /** Common Buyer -> Job -> Order -> Style -> Color -> Date -> Tracking No -> Shift comparator. */
  private groupThenDateCompare(a: DateWiseRejectionRow, b: DateWiseRejectionRow): number {
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
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    if (dateA !== dateB) return dateA - dateB;
    const trackComp = (a.trackingNo || '').localeCompare(b.trackingNo || '');
    if (trackComp !== 0) return trackComp;
    return (a.shift || '').localeCompare(b.shift || '');
  }

  /** Buyer/Job/Order/Style/Color grouping key. */
  private groupKey(r: DateWiseRejectionRow): string {
    return `${r.buyer}||${r.job}||${r.orderNo}||${r.style}||${r.color}`;
  }

  /** Inserts a "Sub Total" row after the last row of each Buyer/Job/Order/Style/Color group. */
  private insertSubtotals(rows: DateWiseRejectionRow[]): DateWiseRejectionRow[] {
    const result: DateWiseRejectionRow[] = [];
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) {
        result.push(rows[j]);
        j++;
      }
      const t = this.computeTotals(rows.slice(i, j));
      result.push({
        date: null, trackingNo: '', receiveFrom: '', buyer: '', job: '', orderNo: '', style: '', color: '',
        dressPart: '', washCategory: '', itemName: '', shift: '', qcName: '',
        receiveQty: t.receiveQty,
        uom: t.uom,
        batchNo: '',
        totalCheckQty: t.totalCheckQty,
        sizeRejects: t.sizeRejects,
        totalRejectQty: t.totalRejectQty,
        rejectPercent: t.rejectPercent,
        isSubtotal: true
      });
      i = j;
    }
    return result;
  }

  /**
   * Totals over a set of data rows. Receive Qty is taken once per group + Tracking No
   * (it repeats on every shift/date row of the same tracking no); everything else is summed.
   */
  private computeTotals(rows: DateWiseRejectionRow[]): RejectionTotals {
    let receiveQty = 0, totalCheckQty = 0, totalRejectQty = 0;
    const sizeRejects: { [size: string]: number } = {};
    this.sizeColumns.forEach(col => sizeRejects[col.size] = 0);
    const seenTracking = new Set<string>();
    const uoms = new Set<string>();

    for (const r of rows) {
      const trackKey = `${this.groupKey(r)}||${r.trackingNo}`;
      if (!seenTracking.has(trackKey)) {
        seenTracking.add(trackKey);
        receiveQty += r.receiveQty ?? 0;
      }
      if (r.uom) uoms.add(r.uom);
      totalCheckQty += r.totalCheckQty ?? 0;
      totalRejectQty += r.totalRejectQty ?? 0;
      this.sizeColumns.forEach(col => sizeRejects[col.size] += r.sizeRejects[col.size] ?? 0);
    }

    return {
      receiveQty,
      // Only show UoM when every row agrees (Pcs and Kg must not be presented as one figure)
      uom: uoms.size === 1 ? [...uoms][0] : '',
      totalCheckQty,
      totalRejectQty,
      rejectPercent: this.calcPercent(totalRejectQty, totalCheckQty),
      sizeRejects
    };
  }

  private normKey(v: any): string {
    return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
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

  private getSizeValue(sizeRejectsObj: any, size: string): number {
    if (!sizeRejectsObj || typeof sizeRejectsObj !== 'object') return 0;
    const target = this.normKey(size);
    for (const k of Object.keys(sizeRejectsObj)) {
      if (this.normKey(k) === target) {
        const v = this.toNumber(sizeRejectsObj[k]);
        return v !== null ? v : 0;
      }
    }
    return 0;
  }

  private rebuildSizeColumns(rawData: any[]): void {
    const merged: SizeColumn[] = [];
    const seen = new Set<string>();

    const pushCol = (rawSize: any) => {
      const size = this.cleanStr(rawSize);
      const n = this.normKey(size);
      if (!n || seen.has(n)) return;
      seen.add(n);
      merged.push({ size, label: size });
    };

    this.sizeColumns.forEach(c => pushCol(c.size));

    rawData.forEach(r => {
      const lookup = this.buildKeyLookup(r);
      const sizeRejectsObj = this.getVal(r, lookup, 'sizeRejects');
      if (sizeRejectsObj && typeof sizeRejectsObj === 'object') {
        Object.keys(sizeRejectsObj).forEach(k => pushCol(k));
      }
    });

    this.sizeColumns = merged;
  }

  /**
   * Global search filters the raw rows, then RE-BUILDS the Sub Total rows and the
   * Grand Total over whatever survived, so both change dynamically as the user types.
   * Clearing the search restores them to the full dataset.
   */
  onGlobalSearch(): void {
    const term = this.globalSearch?.trim()?.toLowerCase() ?? '';

    if (term.length) {
      this.applyView(this.allRows.filter(r => {
        return (
          this.matches(this.formatDate(r.date), term) ||
          this.matches(r.trackingNo, term) ||
          this.matches(r.receiveFrom, term) ||
          this.matches(r.buyer, term) ||
          this.matches(r.job, term) ||
          this.matches(r.orderNo, term) ||
          this.matches(r.style, term) ||
          this.matches(r.color, term) ||
          this.matches(r.dressPart, term) ||
          this.matches(r.washCategory, term) ||
          this.matches(r.itemName, term) ||
          this.matches(r.shift, term) ||
          this.matches(r.qcName, term) ||
          this.matches(r.uom, term) ||
          this.matches(r.batchNo, term) ||
          this.matchesNumber(r.receiveQty, term) ||
          this.matchesNumber(r.totalCheckQty, term) ||
          this.matchesNumber(r.totalRejectQty, term)
        );
      }));
    } else {
      this.applyView(this.allRows);
    }
  }

  onClear(): void {
    this.filter.fromDate = null;
    this.filter.toDate = null;
    this.globalSearch = '';
    this.resetGrid();
  }

  onExcel(): void {
    if (!this.filteredRows.length) {
      this.toastr.warning('No data to export');
      return;
    }

    const totalsRow = (label: string, t: RejectionTotals) => {
      const base: any = {};
      base['Date'] = label;
      ['Tracking No.', 'Receive From', 'Buyer', 'Job', 'Order', 'Style', 'Color', 'Dress Part',
        'Wash Category', 'Item Name', 'Shift', 'QC Name'].forEach(h => base[h] = '');
      base['Received Qty'] = t.receiveQty;
      base['UoM'] = t.uom;
      base['Batch No'] = '';
      base['Total Check QTY'] = t.totalCheckQty;
      this.sizeColumns.forEach(col => {
        base['Reject ' + col.label] = t.sizeRejects[col.size] ?? 0;
      });
      base['Total Reject QTY'] = t.totalRejectQty;
      base['Reject %'] = this.formatPercent(t.rejectPercent);
      return base;
    };

    const exportData = this.filteredRows.map(row => {
      if (row.isSubtotal) {
        return totalsRow('Sub Total:', {
          receiveQty: row.receiveQty ?? 0,
          uom: row.uom,
          totalCheckQty: row.totalCheckQty ?? 0,
          totalRejectQty: row.totalRejectQty ?? 0,
          rejectPercent: row.rejectPercent,
          sizeRejects: row.sizeRejects
        });
      }
      const base: any = {};
      base['Date'] = this.formatDate(row.date);
      base['Tracking No.'] = row.trackingNo;
      base['Receive From'] = row.receiveFrom;
      base['Buyer'] = row.buyer;
      base['Job'] = row.job;
      base['Order'] = row.orderNo;
      base['Style'] = row.style;
      base['Color'] = row.color;
      base['Dress Part'] = row.dressPart;
      base['Wash Category'] = row.washCategory;
      base['Item Name'] = row.itemName;
      base['Shift'] = row.shift;
      base['QC Name'] = row.qcName;
      base['Received Qty'] = row.receiveQty ?? '';
      base['UoM'] = row.uom;
      base['Batch No'] = row.batchNo;
      base['Total Check QTY'] = row.totalCheckQty ?? '';
      this.sizeColumns.forEach(col => {
        base['Reject ' + col.label] = row.sizeRejects[col.size] ?? 0;
      });
      base['Total Reject QTY'] = row.totalRejectQty ?? '';
      base['Reject %'] = this.formatPercent(row.rejectPercent);
      return base;
    });

    if (this.grandTotal) {
      exportData.push(totalsRow('Grand Total:', this.grandTotal));
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 14 },
      { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 18 }, { wch: 16 },
      ...this.sizeColumns.map(() => ({ wch: 12 })),
      { wch: 16 }, { wch: 10 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DateWise Rejection');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `DateWise_Rejection_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  formatPercent(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    return `${value.toFixed(1)}%`;
  }

  formatDate(d: any): string {
    if (!d) return '';
    return this.datePipe.transform(d, 'd-MMM-yy') || '';
  }

  trackByRow(index: number, row: DateWiseRejectionRow): string {
    if (row.isSubtotal) return `subtotal-${index}`;
    return `${row.date}-${row.trackingNo}-${row.batchNo}-${index}`;
  }

  trackBySize(index: number, col: SizeColumn): string {
    return col.size;
  }

  private resetGrid(): void {
    this.allRows = [];
    this.filteredRows = [];
    this.grandTotal = null;
  }

  fmtNum(v: number | null | undefined): string {
    if (v === null || v === undefined || isNaN(v as any)) return '';
    return (v as number).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  private matches(value: string | undefined, term: string): boolean {
    return (value || '').toLowerCase().includes(term);
  }

  private matchesNumber(value: number | null, term: string): boolean {
    return value != null && value.toString().includes(term);
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

  private calcPercent(part: number | null, total: number | null): number | null {
    if (part === null || total === null) return null;
    if (!total) return part ? null : 0;
    return (part / total) * 100;
  }
}
