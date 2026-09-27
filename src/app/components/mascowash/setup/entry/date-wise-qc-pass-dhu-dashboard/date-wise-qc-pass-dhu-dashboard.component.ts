import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule ,BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { WashSetupService } from '../../../services/washsetup.service';
// import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
interface QcPassDhuRow {
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
  totalOkayQty: number | null;
  totalDefectQty: number | null;
  defectPercent: number | null;
  defectsBalanceQty: number | null;
  rectifyDefectsQty: number | null;
  totalRejectQty: number | null;
  rejectPercent: number | null;
  isSubtotal?: boolean;
}

/** Summed figures for a Sub Total row / the Grand Total footer. */
interface QcPassDhuTotals {
  receiveQty: number;
  totalCheckQty: number;
  totalOkayQty: number;
  totalDefectQty: number;
  defectPercent: number | null;
  defectsBalanceQty: number;
  rectifyDefectsQty: number;
  totalRejectQty: number;
  rejectPercent: number | null;
}

@Component({
  selector: 'app-date-wise-qc-pass-dhu-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  providers: [DatePipe],
  templateUrl: './date-wise-qc-pass-dhu-dashboard.component.html',
  styleUrls: ['./date-wise-qc-pass-dhu-dashboard.component.scss']
})
export class DateWiseQcPassDhuDashboardComponent implements OnInit {

  filter: any = {
    UnitId: null,
    fromDate: null,
    toDate: null
  };
  
  bsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'D MMM YYYY'
  };
  UnitList: any[] = [];
  globalSearch = '';
  isLoading = false;

  allRows: QcPassDhuRow[] = [];
  /** Rows shown in the grid: matched data rows + a Sub Total row after each Buyer/Job/Order/Style/Color group. */
  filteredRows: QcPassDhuRow[] = [];
  /** Grand Total footer - recomputed over whatever the global search currently matches. */
  grandTotal: QcPassDhuTotals | null = null;

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

  onSearch(): void {
    debugger;
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

    const request = {
      unitId: this.filter.UnitId,
      fromDate: this.datePipe.transform(this.filter.fromDate, 'yyyy-MM-dd') || '',
      toDate: this.datePipe.transform(this.filter.toDate, 'yyyy-MM-dd') || ''
    };

    this.isLoading = true;
    this.washService.getDateWiseQcPassDhuData(request).subscribe({
      next: (res: any[]) => {
        console.log('API Response:', res);
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
        this.processRawData(this.buildFallbackRows());
        this.toastr.info('Showing preview data until the QC Pass & DHU API is available');
      }
    });
  }

  private processRawData(rawData: any[]): void {
    this.allRows = (rawData || []).map(row => this.mapRow(row));
    // Buyer -> Job -> Order -> Style -> Color -> Date, so each group's rows
    // sit together and its Sub Total lands right after the group.
    this.allRows.sort((a, b) => this.groupThenDateCompare(a, b));
    this.globalSearch = '';
    this.applyCombinedFilter();
  }

  /** Case/format-insensitive column lookup (same approach as Date-wise Balance Dashboard). */
  private mapRow(r: any): QcPassDhuRow {
    const lookup = this.buildKeyLookup(r);
    const val = (...aliases: string[]) => this.getVal(r, lookup, ...aliases);

    const totalCheckQty = this.toNumber(val('totalCheckQty'));
    const totalOkayQty = this.toNumber(val('totalOkayQty'));
    const totalDefectQty = this.toNumber(val('totalDefectQty'));
    const totalRejectQty = this.toNumber(val('totalRejectQty'));
    const defectsBalanceQty = this.toNumber(val('defectsBalanceQty'));
    const rectifyDefectsQty = this.toNumber(val('rectifyDefectsQty'));

    return {
      date: val('date') ?? null,
      trackingNo: this.cleanStr(val('trackingNo')),
      receiveFrom: this.cleanStr(val('receiveFrom', 'receiveForm')),
      buyer: this.cleanStr(val('buyer')),
      job: this.cleanStr(val('job')),
      orderNo: this.cleanStr(val('orderNo', 'order')),
      style: this.cleanStr(val('style')),
      color: this.cleanStr(val('color')),
      dressPart: this.cleanStr(val('dressPart')),
      washCategory: this.cleanStr(val('washCategory', 'washType')),
      itemName: this.cleanStr(val('itemName')),
      shift: this.cleanStr(val('shift')),
      qcName: this.cleanStr(val('qcName')),
      receiveQty: this.toNumber(val('receiveQty', 'receiveQtyKg', 'receiveQtyPcs')),
      uom: this.cleanStr(val('uom')),
      batchNo: this.cleanStr(val('batchNo')),
      totalCheckQty,
      totalOkayQty,
      totalDefectQty,
      defectPercent: this.toNumber(val('defectPercent')) ?? this.calcPercent(totalDefectQty, totalCheckQty),
      defectsBalanceQty,
      rectifyDefectsQty,
      totalRejectQty,
      rejectPercent: this.toNumber(val('rejectPercent')) ?? this.calcPercent(totalRejectQty, totalCheckQty)
    };
  }

  onGlobalSearch(): void { this.applyCombinedFilter(); }

  /**
   * Filters the data rows by the global search term, then RE-BUILDS the Sub
   * Total rows and the Grand Total over whatever matched - so totals always
   * reflect exactly what is on screen, and restore to the full dataset when
   * the search box is cleared.
   */
  private applyCombinedFilter(): void {
    let result = [...this.allRows];
    const term = this.globalSearch?.trim()?.toLowerCase() ?? '';
    if (term.length) {
      result = result.filter(r =>
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
        this.matches(this.formatDate(r.date), term) ||
        this.matchesNumber(r.receiveQty, term) ||
        this.matchesNumber(r.totalCheckQty, term) ||
        this.matchesNumber(r.totalOkayQty, term) ||
        this.matchesNumber(r.totalDefectQty, term) ||
        this.matchesNumber(r.defectsBalanceQty, term) ||
        this.matchesNumber(r.rectifyDefectsQty, term) ||
        this.matchesNumber(r.totalRejectQty, term)
      );
    }

    this.filteredRows = this.insertSubtotals(result);
    this.grandTotal = result.length ? this.computeTotals(result) : null;
  }

  /** Buyer/Job/Order/Style/Color grouping key - same grain as Date-wise Balance Dashboard. */
  private groupKey(r: QcPassDhuRow): string {
    return `${r.buyer}||${r.job}||${r.orderNo}||${r.style}||${r.color}`;
  }

  private groupThenDateCompare(a: QcPassDhuRow, b: QcPassDhuRow): number {
    const fields: (keyof QcPassDhuRow)[] = ['buyer', 'job', 'orderNo', 'style', 'color'];
    for (const f of fields) {
      const c = String(a[f] || '').localeCompare(String(b[f] || ''));
      if (c !== 0) return c;
    }
    const aTime = a.date ? new Date(a.date as any).getTime() : 0;
    const bTime = b.date ? new Date(b.date as any).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    return (a.batchNo || '').localeCompare(b.batchNo || '');
  }

  /** Appends a Sub Total row after each Buyer/Job/Order/Style/Color group (rows must be sorted by group). */
  private insertSubtotals(rows: QcPassDhuRow[]): QcPassDhuRow[] {
    const result: QcPassDhuRow[] = [];
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
        uom: rows[i].uom,
        batchNo: '',
        totalCheckQty: t.totalCheckQty,
        totalOkayQty: t.totalOkayQty,
        totalDefectQty: t.totalDefectQty,
        defectPercent: t.defectPercent,
        defectsBalanceQty: t.defectsBalanceQty,
        rectifyDefectsQty: t.rectifyDefectsQty,
        totalRejectQty: t.totalRejectQty,
        rejectPercent: t.rejectPercent,
        isSubtotal: true
      });
      i = j;
    }
    return result;
  }

  /**
   * QC quantities are per Date/Batch/Shift, so they are summed across every row.
   * Receive Qty is the Tracking No's receive quantity and repeats on every QC
   * row of that tracking, so it is counted ONCE per Tracking No + Color
   * (otherwise it would be multiplied by the number of QC rows).
   * Defect % / Reject % are recalculated from the summed quantities.
   */
  private computeTotals(rows: QcPassDhuRow[]): QcPassDhuTotals {
    let receiveQty = 0, totalCheckQty = 0, totalOkayQty = 0, totalDefectQty = 0;
    let defectsBalanceQty = 0, rectifyDefectsQty = 0, totalRejectQty = 0;
    const seenReceive = new Set<string>();

    for (const r of rows) {
      const receiveKey = `${r.trackingNo}||${r.color}`;
      if (!seenReceive.has(receiveKey)) {
        seenReceive.add(receiveKey);
        receiveQty += r.receiveQty ?? 0;
      }
      totalCheckQty += r.totalCheckQty ?? 0;
      totalOkayQty += r.totalOkayQty ?? 0;
      totalDefectQty += r.totalDefectQty ?? 0;
      defectsBalanceQty += r.defectsBalanceQty ?? 0;
      rectifyDefectsQty += r.rectifyDefectsQty ?? 0;
      totalRejectQty += r.totalRejectQty ?? 0;
    }

    return {
      receiveQty, totalCheckQty, totalOkayQty, totalDefectQty,
      defectPercent: this.calcPercent(totalDefectQty, totalCheckQty),
      defectsBalanceQty, rectifyDefectsQty, totalRejectQty,
      rejectPercent: this.calcPercent(totalRejectQty, totalCheckQty)
    };
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

    const totalsRow = (label: string, t: QcPassDhuTotals, uom: string) => ({
      'Date': label,
      'Tracking No.': '', 'Receive From': '', 'Buyer': '', 'Job': '', 'Order': '', 'Style': '', 'Color': '',
      'Dress Part': '', 'Wash Category': '', 'Item Name': '', 'Shift': '', 'QC Name': '',
      'Receive Qty': t.receiveQty,
      'UoM': uom,
      'Batch No': '',
      'Total Check QTY': t.totalCheckQty,
      'Total Okay QTY': t.totalOkayQty,
      'Total Defect QTY': t.totalDefectQty,
      'Defect %': this.formatPercent(t.defectPercent),
      'Defects Balance QTY': t.defectsBalanceQty,
      'Rectify Defects QTY': t.rectifyDefectsQty,
      'Total Reject QTY': t.totalRejectQty,
      'Reject %': this.formatPercent(t.rejectPercent)
    });

    const exportData = this.filteredRows.map(row => row.isSubtotal ? totalsRow('Sub Total:', {
      receiveQty: row.receiveQty ?? 0,
      totalCheckQty: row.totalCheckQty ?? 0,
      totalOkayQty: row.totalOkayQty ?? 0,
      totalDefectQty: row.totalDefectQty ?? 0,
      defectPercent: row.defectPercent,
      defectsBalanceQty: row.defectsBalanceQty ?? 0,
      rectifyDefectsQty: row.rectifyDefectsQty ?? 0,
      totalRejectQty: row.totalRejectQty ?? 0,
      rejectPercent: row.rejectPercent
    }, row.uom) : ({
      'Date': this.formatDate(row.date),
      'Tracking No.': row.trackingNo,
      'Receive From': row.receiveFrom,
      'Buyer': row.buyer,
      'Job': row.job,
      'Order': row.orderNo,
      'Style': row.style,
      'Color': row.color,
      'Dress Part': row.dressPart,
      'Wash Category': row.washCategory,
      'Item Name': row.itemName,
      'Shift': row.shift,
      'QC Name': row.qcName,
      'Receive Qty': row.receiveQty ?? '',
      'UoM': row.uom,
      'Batch No': row.batchNo,
      'Total Check QTY': row.totalCheckQty ?? '',
      'Total Okay QTY': row.totalOkayQty ?? '',
      'Total Defect QTY': row.totalDefectQty ?? '',
      'Defect %': this.formatPercent(row.defectPercent),
      'Defects Balance QTY': row.defectsBalanceQty ?? '',
      'Rectify Defects QTY': row.rectifyDefectsQty ?? '',
      'Total Reject QTY': row.totalRejectQty ?? '',
      'Reject %': this.formatPercent(row.rejectPercent)
    }));

    if (this.grandTotal) {
      exportData.push(totalsRow('Grand Total:', this.grandTotal, ''));
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 14 },
      { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
      { wch: 16 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 10 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QC Pass & DHU');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `DateWise_QC_Pass_DHU_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  formatPercent(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    return `${value.toFixed(1)}%`;
  }

  fmtNum(v: number | null | undefined, digits = 2): string {
    if (v === null || v === undefined || isNaN(v as any)) return '';
    return (v as number).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  trackByRow(index: number, row: QcPassDhuRow): string {
    if (row.isSubtotal) return `subtotal-${index}`;
    return `${row.batchNo}-${row.trackingNo}-${row.date}-${index}`;
  }

  private resetGrid(): void {
    this.allRows = [];
    this.filteredRows = [];
    this.grandTotal = null;
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

  private matches(value: string, term: string): boolean {
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
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? null : n;
  }

  private calcPercent(part: number | null, total: number | null): number | null {
    if (part === null || total === null || !total) return null;
    return (part / total) * 100;
  }

  private formatDate(d: any): string {
    if (!d) return '';
    return this.datePipe.transform(d, 'd-MMM-yy') || '';
  }

  private buildFallbackRows(): any[] {
    return [
      { date: '2026-07-02', trackingNo: '52679', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-25', orderNo: '2900317645', style: 'NEKURS-A/B (W6)', color: '15 BLACK/BEAUTY', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', shift: 'Night', qcName: 'Arif', receiveQty: 7500, uom: 'Kg', batchNo: 'WBN-2606301004', totalCheckQty: 142, totalOkayQty: 128, totalDefectQty: 16, defectPercent: 11.3, defectsBalanceQty: 7, rectifyDefectsQty: 9, totalRejectQty: 7, rejectPercent: 4.9 },
      { date: '2026-07-02', trackingNo: '52679', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-25', orderNo: '2900317645', style: 'NEKURS-A/B (W6)', color: '15 BLACK/BEAUTY', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Night', qcName: 'Arif', receiveQty: 7500, uom: 'Kg', batchNo: 'WBN-2606301005', totalCheckQty: 1570, totalOkayQty: 1410, totalDefectQty: 80, defectsBalanceQty: 48, rectifyDefectsQty: 32, totalRejectQty: 80 },
      { date: '2026-07-02', trackingNo: '52679', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-25', orderNo: '2900317645', style: 'NEKURS-A/B (W6)', color: '15 BLACK/BEAUTY', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Night', qcName: 'Arif', receiveQty: 7500, uom: 'Kg', batchNo: 'WBN-2606301006', totalCheckQty: 1020, totalOkayQty: 1010, totalDefectQty: 72, defectsBalanceQty: 52, rectifyDefectsQty: 20, totalRejectQty: 10 },
      { date: '2026-07-02', trackingNo: '52679', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-25', orderNo: '2900317645', style: 'NEKURS-A/B (W6)', color: '15 BLACK/BEAUTY', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Night', qcName: 'Arif', receiveQty: 7500, uom: 'Kg', batchNo: 'WBN-2606301007', totalCheckQty: 1300, totalOkayQty: 1192, totalDefectQty: 70, defectsBalanceQty: 20, rectifyDefectsQty: 50, totalRejectQty: 38 },
      { date: '2026-07-02', trackingNo: '52679', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-25', orderNo: '2900317645', style: 'NEKURS-A/B (W6)', color: '15 BLACK/BEAUTY', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Night', qcName: 'Arif', receiveQty: 7500, uom: 'Kg', batchNo: 'WBN-2606301008', totalCheckQty: 1010, totalOkayQty: 890, totalDefectQty: 62, defectsBalanceQty: 18, rectifyDefectsQty: 44, totalRejectQty: 58 },
      { date: '2026-07-10', trackingNo: '52680', receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-882815-10-26', orderNo: '127756', style: 'NEKURS-A/B (W6)', color: 'RED-JOY', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Night', qcName: 'Kamal', receiveQty: 8000, uom: 'Kg', batchNo: 'WBN-2606301011', totalCheckQty: 1050, totalOkayQty: 960, totalDefectQty: 86, defectsBalanceQty: 16, rectifyDefectsQty: 70, totalRejectQty: 4 },
      { date: '2026-07-13', trackingNo: '52680', receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-882815-10-26', orderNo: '127756', style: 'NEKURS-A/B (W6)', color: 'RED-JOY', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Night', qcName: 'Kamal', receiveQty: 8000, uom: 'Kg', batchNo: 'WBN-2606301012', totalCheckQty: 1010, totalOkayQty: 986, totalDefectQty: 74, defectsBalanceQty: 14, rectifyDefectsQty: 60, totalRejectQty: 24 },
      { date: '2026-07-15', trackingNo: '52680', receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-882815-10-26', orderNo: '127756', style: 'NEKURS-A/B (W6)', color: 'RED-JOY', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Night', qcName: 'Kamal', receiveQty: 8000, uom: 'Kg', batchNo: 'WBN-2606301013', totalCheckQty: 1010, totalOkayQty: 944, totalDefectQty: 80, defectsBalanceQty: 20, rectifyDefectsQty: 60, totalRejectQty: 66 },
      { date: '2026-07-20', trackingNo: '52681', receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-882815-10-26', orderNo: '127756', style: 'NEKURS-A/B (W6)', color: 'RED-JOY', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Morning', qcName: 'Kamal', receiveQty: 8000, uom: 'Pcs', batchNo: 'WBN-2606301014', totalCheckQty: 1264, totalOkayQty: 1130, totalDefectQty: 73, defectsBalanceQty: 23, rectifyDefectsQty: 50, totalRejectQty: 61 },
      { date: '2026-07-05', trackingNo: '52682', receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-882815-10-26', orderNo: '127756', style: 'New Black-cfd', color: 'New Black-cfd', dressPart: 'Top', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Morning', qcName: 'Kamal', receiveQty: 8000, uom: 'Pcs', batchNo: 'WBN-2606301015', totalCheckQty: 115, totalOkayQty: 107, totalDefectQty: 10, defectsBalanceQty: 3, rectifyDefectsQty: 7, totalRejectQty: 8 },
      { date: '2026-07-12', trackingNo: '52683', receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-882815-10-27', orderNo: '127756', style: 'NEKURS-A/B (W6)', color: 'RED-JOY', dressPart: 'Top', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Morning', qcName: 'Kamal', receiveQty: 14270, uom: 'Pcs', batchNo: 'WBN-2606301017', totalCheckQty: 190, totalOkayQty: 179, totalDefectQty: 9, defectsBalanceQty: 3, rectifyDefectsQty: 6, totalRejectQty: 2 },
      { date: '2026-07-13', trackingNo: '52684', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-27', orderNo: '7700341259', style: '04-PINK SOLID', color: '04-PINK SOLID', dressPart: 'Top', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Morning', qcName: 'Kamal', receiveQty: 14270, uom: 'Pcs', batchNo: 'WBN-2606301021', totalCheckQty: 95, totalOkayQty: 83, totalDefectQty: 4, defectsBalanceQty: 1, rectifyDefectsQty: 3, totalRejectQty: 8 },
      { date: '2026-07-15', trackingNo: '52685', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-28', orderNo: '7700341259', style: '04-PINK SOLID', color: '04-PINK SOLID', dressPart: 'Top', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Morning', qcName: 'Kamal', receiveQty: 14270, uom: 'Pcs', batchNo: 'WBN-2606301022', totalCheckQty: 114, totalOkayQty: 101, totalDefectQty: 11, defectsBalanceQty: 6, rectifyDefectsQty: 5, totalRejectQty: 2 },
      { date: '2026-07-18', trackingNo: '52686', receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-882815-10-28', orderNo: '7700341259', style: '04-PINK SOLID', color: '04-PINK SOLID', dressPart: 'Top', washCategory: 'Garment Dyeing', itemName: 'Complete Garment', shift: 'Morning', qcName: 'Kamal', receiveQty: 14270, uom: 'Pcs', batchNo: 'WBN-2606301023', totalCheckQty: 142, totalOkayQty: 127, totalDefectQty: 10, defectsBalanceQty: 7, rectifyDefectsQty: 3, totalRejectQty: 5 }
    ];
  }
}
