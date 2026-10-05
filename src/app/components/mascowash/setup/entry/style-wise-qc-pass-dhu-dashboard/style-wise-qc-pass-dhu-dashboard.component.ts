import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { WashSetupService } from '../../../services/washsetup.service';
import { DashboardPdfService, PdfColumn, PdfRow, PdfCell } from '../../../services/dashboard-pdf.service';
import { format } from 'date-fns';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

interface StyleWiseDhuRow {
  receiveFrom?: string;
  buyer?: string;
  job?: string;
  orderNo?: string;
  style?: string;
  color?: string;
  dressPart?: string;
  washCategory?: string;
  itemName?: string;
  receiveQty: number | null;
  uom: string;
  noOfBatch: number | null;
  totalCheckQty: number | null;
  totalOkayQty: number | null;
  totalDefectQty: number | null;
  defectPercent: number | null;
  defectsBalanceQty: number | null;
  rectifyDefectsQty: number | null;
  totalRejectQty: number | null;
  rejectPercent: number | null;
  /** Buyer|Job|Style|Order|Color|DressPart from the SP - each key's Receive Qty is counted once in totals. */
  receiveKey?: string;
  /** Every batch in the row is a re-wash batch (Check Qty 0 from the SP). */
  isReWash?: boolean;
  isSubTotal: boolean;
}

@Component({
  selector: 'app-style-wise-qc-pass-dhu-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  providers: [DatePipe],
  templateUrl: './style-wise-qc-pass-dhu-dashboard.component.html',
  styleUrls: ['./style-wise-qc-pass-dhu-dashboard.component.scss']
})
export class StyleWiseQcPassDhuDashboardComponent implements OnInit {

  filter: any = {
    UnitId: null,
    fromDate: null,
    toDate: new Date()
  };
  
  bsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'D MMM YYYY'
  };

  UnitList: any[] = [];
  globalSearch = '';
  isLoading = false;
  /** Filter values the grid was last loaded with - printed on the PDF, so it describes the data, not later edits to the inputs. */
  private exportFilter: any = null;

  /** Data rows only (no Sub Total rows), sorted Buyer -> Job -> Order -> Style -> Color. */
  allRows: StyleWiseDhuRow[] = [];
  /** Rows on screen: matched data rows + a Sub Total after each Buyer/Job/Order/Style/Color group. */
  filteredRows: StyleWiseDhuRow[] = [];
  /**
   * Grand Total footer - recomputed over whatever the global search currently
   * matches (see onGlobalSearch), so like the Sub Totals it updates as the user
   * types/clears the filter and falls back to the full dataset when empty.
   */
  grandTotal: StyleWiseDhuRow | null = null;

  constructor(
    private washService: WashSetupService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private pdf: DashboardPdfService
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

    this.exportFilter = { ...this.filter };
    this.isLoading = true;
    this.washService.getStyleWiseQcPassDhuData(request).subscribe({
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
        // Fallback to real API's date-wise endpoint to see if it has data
        this.washService.getDateWiseQcPassDhuData(request).subscribe({
          next: (res: any[]) => {
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
            this.processMockData();
            this.toastr.info('Showing preview data from screenshot');
          }
        });
      }
    });
  }

  private processRawData(rawData: any[]): void {
    let aggregated: StyleWiseDhuRow[] = [];
    const isAlreadyStyleWise = rawData.some(r => r.noOfBatch !== undefined || r.NoOfBatch !== undefined || r.noOfBatches !== undefined);

    if (isAlreadyStyleWise) {
      aggregated = rawData.map(r => ({
        receiveFrom: this.cleanStr(r.receiveFrom ?? r.ReceiveFrom ?? r.receiveForm ?? r.ReceiveForm),
        buyer: this.cleanStr(r.buyer ?? r.Buyer),
        job: this.cleanStr(r.job ?? r.Job),
        orderNo: this.cleanStr(r.orderNo ?? r.OrderNo ?? r.order ?? r.Order),
        style: this.cleanStr(r.style ?? r.Style),
        color: this.cleanStr(r.color ?? r.Color),
        dressPart: this.cleanStr(r.dressPart ?? r.DressPart),
        washCategory: this.cleanStr(r.washCategory ?? r.WashCategory),
        itemName: this.cleanStr(r.itemName ?? r.ItemName),
        receiveQty: this.toNumber(r.receiveQty ?? r.ReceiveQty ?? r.receivedQty ?? r.ReceivedQty),
        uom: this.cleanStr(r.uom ?? r.UoM ?? r.UOM),
        noOfBatch: this.toNumber(r.noOfBatch ?? r.NoOfBatch ?? r.noOfBatches ?? 1) || 1,
        totalCheckQty: this.toNumber(r.totalCheckQty ?? r.TotalCheckQty) || 0,
        totalOkayQty: this.toNumber(r.totalOkayQty ?? r.TotalOkayQty) || 0,
        totalDefectQty: this.toNumber(r.totalDefectQty ?? r.TotalDefectQty) || 0,
        defectPercent: this.toNumber(r.defectPercent ?? r.DefectPercent),
        defectsBalanceQty: this.toNumber(r.defectsBalanceQty ?? r.DefectsBalanceQty) || 0,
        rectifyDefectsQty: this.toNumber(r.rectifyDefectsQty ?? r.RectifyDefectsQty ?? r.rectifyDefectQty ?? r.RectifyDefectQty) || 0,
        totalRejectQty: this.toNumber(r.totalRejectQty ?? r.TotalRejectQty) || 0,
        rejectPercent: this.toNumber(r.rejectPercent ?? r.RejectPercent),
        receiveKey: this.cleanStr(r.receiveKey ?? r.ReceiveKey),
        isReWash: (r.isReWash ?? r.IsReWash) === true,
        isSubTotal: false
      }));
    } else {
      // Perform client-side style-wise aggregation of date/batch-wise rows
      const groups: { [key: string]: any[] } = {};
      rawData.forEach(r => {
        const key = `${r.receiveFrom ?? r.ReceiveFrom ?? ''}_${r.buyer ?? r.Buyer ?? ''}_${r.job ?? r.Job ?? ''}_${r.orderNo ?? r.OrderNo ?? r.order ?? r.Order ?? ''}_${r.style ?? r.Style ?? ''}_${r.color ?? r.Color ?? ''}_${r.dressPart ?? r.DressPart ?? ''}_${r.washCategory ?? r.WashCategory ?? ''}_${r.itemName ?? r.ItemName ?? ''}_${r.uom ?? r.UoM ?? r.UOM ?? ''}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(r);
      });

      Object.keys(groups).forEach(key => {
        const rows = groups[key];
        const first = rows[0];

        let totalCheckQty = 0;
        let totalOkayQty = 0;
        let totalDefectQty = 0;
        let defectsBalanceQty = 0;
        let rectifyDefectsQty = 0;
        let totalRejectQty = 0;

        // Receive Qty is per tracking no, repeated on every batch/shift row of
        // that tracking no - count it once per tracking no.
        const receiveByTracking = new Map<string, number>();

        rows.forEach(r => {
          const trackingKey = String(r.trackingNo ?? r.TrackingNo ?? r.batchNo ?? r.BatchNo ?? '');
          if (!receiveByTracking.has(trackingKey)) {
            receiveByTracking.set(trackingKey, this.toNumber(r.receiveQty ?? r.ReceiveQty ?? r.receivedQty ?? r.ReceivedQty) || 0);
          }
          totalCheckQty += this.toNumber(r.totalCheckQty ?? r.TotalCheckQty ?? r.totalCheckQTY) || 0;
          totalOkayQty += this.toNumber(r.totalOkayQty ?? r.TotalOkayQty ?? r.totalOkayQTY) || 0;
          totalDefectQty += this.toNumber(r.totalDefectQty ?? r.TotalDefectQty ?? r.totalDefectQTY) || 0;
          defectsBalanceQty += this.toNumber(r.defectsBalanceQty ?? r.DefectsBalanceQty ?? r.defectsBalanceQTY) || 0;
          rectifyDefectsQty += this.toNumber(r.rectifyDefectsQty ?? r.RectifyDefectsQty ?? r.rectifyDefectsQTY) || 0;
          totalRejectQty += this.toNumber(r.totalRejectQty ?? r.TotalRejectQty ?? r.totalRejectQTY) || 0;
        });

        aggregated.push({
          receiveFrom: this.cleanStr(first.receiveFrom ?? first.ReceiveFrom ?? first.receiveForm ?? first.ReceiveForm),
          buyer: this.cleanStr(first.buyer ?? first.Buyer),
          job: this.cleanStr(first.job ?? first.Job),
          orderNo: this.cleanStr(first.orderNo ?? first.OrderNo ?? first.order ?? first.Order),
          style: this.cleanStr(first.style ?? first.Style),
          color: this.cleanStr(first.color ?? first.Color),
          dressPart: this.cleanStr(first.dressPart ?? first.DressPart),
          washCategory: this.cleanStr(first.washCategory ?? first.WashCategory),
          itemName: this.cleanStr(first.itemName ?? first.ItemName),
          receiveQty: Array.from(receiveByTracking.values()).reduce((sum, q) => sum + q, 0),
          uom: this.cleanStr(first.uom ?? first.UoM ?? first.UOM),
          noOfBatch: rows.length,
          totalCheckQty,
          totalOkayQty,
          totalDefectQty,
          defectPercent: this.calcPercent(totalDefectQty, totalCheckQty),
          defectsBalanceQty,
          rectifyDefectsQty,
          totalRejectQty,
          rejectPercent: this.calcPercent(totalRejectQty, totalCheckQty),
          isSubTotal: false
        });
      });
    }

    // Sort so each Buyer/Job/Order/Style/Color group is contiguous and its
    // Sub Total lands right after the group's last row.
    aggregated.sort((a, b) => this.groupCompare(a, b));

    this.allRows = aggregated;
    this.globalSearch = '';
    this.applyView(this.allRows);
  }

  /** Buyer -> Job -> Order -> Style -> Color -> Dress Part comparator. */
  private groupCompare(a: StyleWiseDhuRow, b: StyleWiseDhuRow): number {
    return (a.buyer || '').localeCompare(b.buyer || '')
      || (a.job || '').localeCompare(b.job || '')
      || (a.orderNo || '').localeCompare(b.orderNo || '')
      || (a.style || '').localeCompare(b.style || '')
      || (a.color || '').localeCompare(b.color || '')
      || (a.dressPart || '').localeCompare(b.dressPart || '');
  }

  /** Buyer/Job/Order/Style/Color grouping key - same grain as Date-wise Balance Dashboard. */
  private groupKey(r: StyleWiseDhuRow): string {
    return `${r.buyer}||${r.job}||${r.orderNo}||${r.style}||${r.color}`;
  }

  /** Inserts a "Sub Total" row after the last row of each Buyer/Job/Order/Style/Color group. */
  private insertSubtotals(rows: StyleWiseDhuRow[]): StyleWiseDhuRow[] {
    const result: StyleWiseDhuRow[] = [];
    let i = 0;
    while (i < rows.length) {
      const key = this.groupKey(rows[i]);
      let j = i;
      while (j < rows.length && this.groupKey(rows[j]) === key) j++;
      const group = rows.slice(i, j);
      result.push(...group, this.calculateSubtotal(group));
      i = j;
    }
    return result;
  }

  /** Rebuilds the grid rows (with Sub Totals) and the Grand Total from the given data rows. */
  private applyView(rows: StyleWiseDhuRow[]): void {
    this.filteredRows = this.insertSubtotals(rows);
    this.grandTotal = rows.length ? this.calculateSubtotal(rows) : null;
  }

  private calculateSubtotal(group: StyleWiseDhuRow[]): StyleWiseDhuRow {
    let receiveQty = 0;
    let noOfBatch = 0;
    let totalCheckQty = 0;
    let totalOkayQty = 0;
    let totalDefectQty = 0;
    let defectsBalanceQty = 0;
    let rectifyDefectsQty = 0;
    let totalRejectQty = 0;
    // Receive Qty is the order's receive per Buyer/Job/Style/Order/Color/Dress Part and can sit
    // on several rows (e.g. two wash categories of the same dress part) - count each key once.
    const seenReceive = new Set<string>();

    group.forEach(r => {
      if (!r.receiveKey || !seenReceive.has(r.receiveKey)) {
        if (r.receiveKey) seenReceive.add(r.receiveKey);
        receiveQty += r.receiveQty || 0;
      }
      noOfBatch += r.noOfBatch || 0;
      totalCheckQty += r.totalCheckQty || 0;
      totalOkayQty += r.totalOkayQty || 0;
      totalDefectQty += r.totalDefectQty || 0;
      defectsBalanceQty += r.defectsBalanceQty || 0;
      rectifyDefectsQty += r.rectifyDefectsQty || 0;
      totalRejectQty += r.totalRejectQty || 0;
    });

    // Only show UoM when the whole group shares one (Pcs and Kg can't be mixed).
    const uoms = Array.from(new Set(group.map(r => r.uom).filter(u => !!u)));
    const uom = uoms.length === 1 ? uoms[0] : '';

    return {
      receiveQty,
      uom,
      noOfBatch,
      totalCheckQty,
      totalOkayQty,
      totalDefectQty,
      defectPercent: this.calcPercent(totalDefectQty, totalCheckQty),
      defectsBalanceQty,
      rectifyDefectsQty,
      totalRejectQty,
      rejectPercent: this.calcPercent(totalRejectQty, totalCheckQty),
      isSubTotal: true
    };
  }

  private processMockData(): void {
    this.allRows = this.buildMockRows().filter(r => !r.isSubTotal).sort((a, b) => this.groupCompare(a, b));
    this.globalSearch = '';
    this.applyView(this.allRows);
  }

  /**
   * Global search filters the data rows, then RE-BUILDS the Sub Total rows and
   * the Grand Total over whatever matched - so both always reflect exactly
   * what's on screen. Clearing the search restores the full dataset.
   */
  onGlobalSearch(): void {
    const term = this.globalSearch?.trim()?.toLowerCase() ?? '';
    const matched = term.length
      ? this.allRows.filter(r => this.rowMatches(r, term))
      : this.allRows;
    this.applyView(matched);
  }

  private rowMatches(r: StyleWiseDhuRow, term: string): boolean {
    return (
          this.matches(r.receiveFrom, term) ||
          this.matches(r.buyer, term) ||
          this.matches(r.job, term) ||
          this.matches(r.orderNo, term) ||
          this.matches(r.style, term) ||
          this.matches(r.color, term) ||
          this.matches(r.dressPart, term) ||
          this.matches(r.washCategory, term) ||
          this.matches(r.itemName, term) ||
          this.matches(r.uom, term) ||
          this.matchesNumber(r.receiveQty, term) ||
          this.matchesNumber(r.noOfBatch, term) ||
          this.matchesNumber(r.totalCheckQty, term) ||
          this.matchesNumber(r.totalOkayQty, term) ||
          this.matchesNumber(r.totalDefectQty, term) ||
          this.matchesNumber(r.defectsBalanceQty, term) ||
          this.matchesNumber(r.rectifyDefectsQty, term) ||
          this.matchesNumber(r.totalRejectQty, term)
    );
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

    const totalRow = (row: StyleWiseDhuRow, label: string) => ({
      'Receive form': '',
      'Buyer': '',
      'Job': '',
      'Order': '',
      'Style': '',
      'Color': label,
      'Dress Part': '',
      'Wash Category': '',
      'Item Name': '',
      'Received Qty': row.receiveQty ?? '',
      'UoM': row.uom,
      'No of Batch': row.noOfBatch ?? '',
      'Total Check QTY': row.totalCheckQty ?? '',
      'Total Okay QTY': row.totalOkayQty ?? '',
      'Total Defect QTY': row.totalDefectQty ?? '',
      'Defect %': this.formatPercent(row.defectPercent),
      'Defects Balance QTY': row.defectsBalanceQty ?? '',
      'Rectify Defects QTY': row.rectifyDefectsQty ?? '',
      'Total Reject QTY': row.totalRejectQty ?? '',
      'Reject %': this.formatPercent(row.rejectPercent)
    });

    const exportData: any[] = this.filteredRows.map(row => {
      if (row.isSubTotal) {
        return totalRow(row, 'Sub Total:');
      }
      return {
        'Receive form': row.receiveFrom,
        'Buyer': row.buyer,
        'Job': row.job,
        'Order': row.orderNo,
        'Style': row.style,
        'Color': row.color,
        'Dress Part': row.dressPart,
        'Wash Category': row.washCategory,
        'Item Name': row.itemName,
        'Received Qty': row.receiveQty ?? '',
        'UoM': row.uom,
        'No of Batch': row.noOfBatch ?? '',
        'Total Check QTY': row.totalCheckQty ?? '',
        'Total Okay QTY': row.totalOkayQty ?? '',
        'Total Defect QTY': row.totalDefectQty ?? '',
        'Defect %': this.formatPercent(row.defectPercent),
        'Defects Balance QTY': row.defectsBalanceQty ?? '',
        'Rectify Defects QTY': row.rectifyDefectsQty ?? '',
        'Total Reject QTY': row.totalRejectQty ?? '',
        'Reject %': this.formatPercent(row.rejectPercent)
      };
    });
    if (this.grandTotal) {
      exportData.push(totalRow(this.grandTotal, 'Grand Total:'));
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 18 },
      { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 8 }, { wch: 12 },
      { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 18 }, { wch: 18 },
      { wch: 16 }, { wch: 10 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StyleWise QC Pass & DHU');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `StyleWise_QC_Pass_DHU_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  /** PDF of exactly what the grid shows (search applied, Sub Totals + Grand Total included). */
  onPdf(): void {
    if (!this.filteredRows.length) {
      this.toastr.warning('No data to export');
      return;
    }
    const n = (v: number | null | undefined) =>
      v === null || v === undefined || isNaN(v as any) ? '' : v.toLocaleString('en-US', { maximumFractionDigits: 3 });
    const p = (v: number | null) => this.formatPercent(v);
    const label = (text: string): PdfCell => ({ content: text, colSpan: 9, align: 'right' });
    const totals = (r: StyleWiseDhuRow, text: string): PdfCell[] => [
      label(text), n(r.receiveQty), r.uom, r.noOfBatch ?? '', n(r.totalCheckQty), n(r.totalOkayQty), n(r.totalDefectQty),
      p(r.defectPercent), n(r.defectsBalanceQty), n(r.rectifyDefectsQty), n(r.totalRejectQty), p(r.rejectPercent)
    ];
    const f = this.exportFilter ?? this.filter;

    const columns: PdfColumn[] = [
      { header: 'Receive From', align: 'center' },
      { header: 'Buyer' }, { header: 'Job' }, { header: 'Order' }, { header: 'Style' }, { header: 'Color' },
      { header: 'Dress Part' }, { header: 'Wash Category' }, { header: 'Item Name' },
      { header: 'Received Qty', align: 'right' },
      { header: 'UoM', align: 'center' },
      { header: 'No of Batch', align: 'center' },
      { header: 'Total Check QTY', align: 'right' },
      { header: 'Total Okay QTY', align: 'right' },
      { header: 'Total Defect QTY', align: 'right' },
      { header: 'Defect %', align: 'right', minWidth: 10 },
      { header: 'Defects Balance QTY', align: 'right' },
      { header: 'Rectify Defects Qty', align: 'right' },
      { header: 'Total Reject QTY', align: 'right' },
      { header: 'Reject %', align: 'right', minWidth: 10 }
    ];
    const rows: PdfRow[] = this.filteredRows.map(r => r.isSubTotal
      ? { kind: 'subtotal', cells: totals(r, 'Sub Total:') }
      : { cells: [
          r.receiveFrom, r.buyer, r.job, r.orderNo, r.style, r.color, r.dressPart, r.washCategory, r.itemName,
          r.receiveQty != null ? n(r.receiveQty) : '-', r.uom, r.noOfBatch ?? '',
          n(r.totalCheckQty), n(r.totalOkayQty), n(r.totalDefectQty), p(r.defectPercent),
          n(r.defectsBalanceQty), n(r.rectifyDefectsQty), n(r.totalRejectQty), p(r.rejectPercent)
        ] });
    const unit = this.UnitList.find(u => u.value === f.UnitId)?.label;

    this.pdf.export({
      title: 'Style-wise QC Pass & DHU Dashboard',
      company: unit,
      meta: [
        { label: 'Unit', value: unit },
        { label: 'Period', value: `${this.formatPeriodDate(f.fromDate)} to ${this.formatPeriodDate(f.toDate)}` },
        { label: 'Search', value: this.globalSearch?.trim() ? `"${this.globalSearch.trim()}"` : '' }
      ],
      columns,
      rows,
      footRows: this.grandTotal ? [totals(this.grandTotal, 'Grand Total:')] : [],
      fileName: 'StyleWise_QC_Pass_DHU'
    })
      .then(() => this.toastr.success('PDF exported successfully'))
      .catch(() => this.toastr.error('Failed to export PDF'));
  }

  private formatPeriodDate(d: any): string {
    return d ? (this.datePipe.transform(d, 'd MMM yyyy') || '') : '...';
  }

  formatPercent(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    return `${value.toFixed(1)}%`;
  }

  trackByRow(index: number, row: StyleWiseDhuRow): string {
    return `${row.buyer}-${row.job}-${row.orderNo}-${row.style}-${row.color}-${row.isSubTotal}-${index}`;
  }

  private resetGrid(): void {
    this.allRows = [];
    this.filteredRows = [];
    this.grandTotal = null;
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
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? null : n;
  }

  private calcPercent(part: number | null, total: number | null): number | null {
    if (part === null || total === null || !total) return null;
    return (part / total) * 100;
  }

  private buildMockRows(): StyleWiseDhuRow[] {
    return [
      // Group 1
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2815-10-26', orderNo: '2900317645', style: '2900317645', color: '15 BLACK/BEAUTY', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 7500, uom: 'Pcs', noOfBatch: 5, totalCheckQty: 6092, totalOkayQty: 6068, totalDefectQty: 85, defectPercent: 1.4, defectsBalanceQty: 16, rectifyDefectsQty: 69, totalRejectQty: 8, rejectPercent: 0.1, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2815-10-26', orderNo: '2900317645', style: '2900317645', color: 'Charcole', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 7500, uom: 'Pcs', noOfBatch: 6, totalCheckQty: 5876, totalOkayQty: 5818, totalDefectQty: 91, defectPercent: 1.5, defectsBalanceQty: 48, rectifyDefectsQty: 43, totalRejectQty: 10, rejectPercent: 0.2, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2815-10-26', orderNo: '2900317645', style: '2900317645', color: 'White', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 7500, uom: 'Pcs', noOfBatch: 8, totalCheckQty: 4305, totalOkayQty: 4291, totalDefectQty: 132, defectPercent: 3.1, defectsBalanceQty: 6, rectifyDefectsQty: 126, totalRejectQty: 8, rejectPercent: 0.2, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2815-10-26', orderNo: '2900317645', style: '2900317645', color: 'Dk Blue', dressPart: 'TEE SHIRT', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 7500, uom: 'Pcs', noOfBatch: 7, totalCheckQty: 5641, totalOkayQty: 5623, totalDefectQty: 16, defectPercent: 0.3, defectsBalanceQty: 15, rectifyDefectsQty: 1, totalRejectQty: 3, rejectPercent: 0.1, isSubTotal: false },
      { receiveQty: 30000, uom: 'Pcs', noOfBatch: 26, totalCheckQty: 21914, totalOkayQty: 21800, totalDefectQty: 324, defectPercent: 1.5, defectsBalanceQty: 85, rectifyDefectsQty: 239, totalRejectQty: 29, rejectPercent: 0.1, isSubTotal: true },

      // Group 2
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2817-10-26', orderNo: '2900317646', style: '2900317640', color: 'RED-HJY', dressPart: 'Top', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 7500, uom: 'Pcs', noOfBatch: 9, totalCheckQty: 5515, totalOkayQty: 5505, totalDefectQty: 8, defectPercent: 0.1, defectsBalanceQty: 2, rectifyDefectsQty: 6, totalRejectQty: 8, rejectPercent: 0.1, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2817-10-26', orderNo: '2900317645', style: '2900317645', color: '15 BLACK/BEAUTY', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 7500, uom: 'Pcs', noOfBatch: 9, totalCheckQty: 5777, totalOkayQty: 5743, totalDefectQty: 59, defectPercent: 1.0, defectsBalanceQty: 27, rectifyDefectsQty: 32, totalRejectQty: 7, rejectPercent: 0.1, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2817-10-26', orderNo: '2900317646', style: 'NEKURS-A/B (W6)', color: 'RED-HJY', dressPart: 'Top', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 8000, uom: 'Pcs', noOfBatch: 9, totalCheckQty: 5495, totalOkayQty: 5464, totalDefectQty: 102, defectPercent: 1.9, defectsBalanceQty: 23, rectifyDefectsQty: 79, totalRejectQty: 8, rejectPercent: 0.1, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2817-10-26', orderNo: '2900317646', style: 'NEKURS-A/B (W6)', color: '15 BLACK/BEAUTY', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 8000, uom: 'Pcs', noOfBatch: 10, totalCheckQty: 7713, totalOkayQty: 7693, totalDefectQty: 47, defectPercent: 0.6, defectsBalanceQty: 13, rectifyDefectsQty: 34, totalRejectQty: 7, rejectPercent: 0.1, isSubTotal: false },
      { receiveQty: 31000, uom: 'Pcs', noOfBatch: 37, totalCheckQty: 24500, totalOkayQty: 24405, totalDefectQty: 216, defectPercent: 0.9, defectsBalanceQty: 65, rectifyDefectsQty: 151, totalRejectQty: 30, rejectPercent: 0.1, isSubTotal: true },

      // Group 3
      { receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-BB2818-10-26', orderNo: '1327250', style: 'NEKURS-A/B (W6)', color: '54-203 Aop', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 8000, uom: 'Pcs', noOfBatch: 7, totalCheckQty: 5990, totalOkayQty: 5859, totalDefectQty: 186, defectPercent: 3.1, defectsBalanceQty: 123, rectifyDefectsQty: 63, totalRejectQty: 8, rejectPercent: 0.1, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-BB2818-10-26', orderNo: '1327250', style: 'NEKURS-A/B (W6)', color: 'Ecru', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 8000, uom: 'Pcs', noOfBatch: 6, totalCheckQty: 6916, totalOkayQty: 6789, totalDefectQty: 177, defectPercent: 2.6, defectsBalanceQty: 123, rectifyDefectsQty: 54, totalRejectQty: 4, rejectPercent: 0.1, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-BB2818-10-26', orderNo: '1327250', style: 'NEKURS-A/B (W6)', color: 'White', dressPart: 'Bottom', washCategory: 'Garment Dyeing', itemName: 'Complete Garments', receiveQty: 8000, uom: 'Pcs', noOfBatch: 6, totalCheckQty: 4560, totalOkayQty: 4510, totalDefectQty: 70, defectPercent: 1.5, defectsBalanceQty: 44, rectifyDefectsQty: 26, totalRejectQty: 6, rejectPercent: 0.1, isSubTotal: false },
      { receiveQty: 55000, uom: 'Pcs', noOfBatch: 56, totalCheckQty: 41966, totalOkayQty: 41563, totalDefectQty: 649, defectPercent: 1.5, defectsBalanceQty: 355, rectifyDefectsQty: 294, totalRejectQty: 48, rejectPercent: 0.1, isSubTotal: true },

      // Group 4
      { receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-BB2819-10-26', orderNo: '1327250', style: 'NEKURS-A/B (W6)', color: 'New Black-cvi', dressPart: 'Bottom', washCategory: 'Normal Wash', itemName: 'Fabric', receiveQty: 2000, uom: 'Kg', noOfBatch: 8, totalCheckQty: 1659, totalOkayQty: 1564, totalDefectQty: 103, defectPercent: 6.2, defectsBalanceQty: 85, rectifyDefectsQty: 18, totalRejectQty: 10, rejectPercent: 0.6, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-BB2819-10-26', orderNo: '1327250', style: 'NEKURS-A/B (W6)', color: '04-PINK SOLID', dressPart: 'Bottom', washCategory: 'Normal Wash', itemName: 'Fabric', receiveQty: 2000, uom: 'Kg', noOfBatch: 7, totalCheckQty: 1764, totalOkayQty: 1735, totalDefectQty: 182, defectPercent: 10.3, defectsBalanceQty: 22, rectifyDefectsQty: 160, totalRejectQty: 7, rejectPercent: 0.4, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'LC Waikiki', job: 'SEL-BB2819-10-26', orderNo: '1327250', style: 'NEKURS-A/B (W6)', color: 'RED-HJY', dressPart: 'Bottom', washCategory: 'Normal Wash', itemName: 'Fabric', receiveQty: 2000, uom: 'Kg', noOfBatch: 5, totalCheckQty: 1215, totalOkayQty: 1186, totalDefectQty: 40, defectPercent: 3.3, defectsBalanceQty: 20, rectifyDefectsQty: 20, totalRejectQty: 9, rejectPercent: 0.7, isSubTotal: false },
      { receiveQty: 61000, uom: 'Kg', noOfBatch: 76, totalCheckQty: 46604, totalOkayQty: 46048, totalDefectQty: 974, defectPercent: 2.1, defectsBalanceQty: 482, rectifyDefectsQty: 492, totalRejectQty: 74, rejectPercent: 0.2, isSubTotal: true },

      // Group 5
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2815-10-25', orderNo: '3700334259', style: '46-212', dressPart: 'Top', washCategory: 'Normal Wash', itemName: 'Fabric', receiveQty: 300, uom: 'Kg', noOfBatch: 9, totalCheckQty: 278, totalOkayQty: 265, totalDefectQty: 17, defectPercent: 6.1, defectsBalanceQty: 9, rectifyDefectsQty: 8, totalRejectQty: 4, rejectPercent: 1.4, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2815-10-26', orderNo: '3700334259', style: 'Grey Melange', dressPart: 'Top', washCategory: 'Normal Wash', itemName: 'Fabric', receiveQty: 300, uom: 'Kg', noOfBatch: 8, totalCheckQty: 260, totalOkayQty: 230, totalDefectQty: 24, defectPercent: 9.2, defectsBalanceQty: 20, rectifyDefectsQty: 4, totalRejectQty: 10, rejectPercent: 3.8, isSubTotal: false },
      { receiveFrom: 'SEL', buyer: 'Target (Australia)', job: 'SEL-BB2815-10-27', orderNo: '3700334259', style: 'Ecru', dressPart: 'Top', washCategory: 'Normal Wash', itemName: 'Cutting Parts', receiveQty: 300, uom: 'Kg', noOfBatch: 5, totalCheckQty: 205, totalOkayQty: 124, totalDefectQty: 142, defectPercent: 69.3, defectsBalanceQty: 75, rectifyDefectsQty: 67, totalRejectQty: 6, rejectPercent: 2.9, isSubTotal: false },
      { receiveQty: 61900, uom: 'Kg', noOfBatch: 98, totalCheckQty: 47347, totalOkayQty: 46667, totalDefectQty: 1157, defectPercent: 2.4, defectsBalanceQty: 586, rectifyDefectsQty: 571, totalRejectQty: 94, rejectPercent: 0.2, isSubTotal: true }
    ];
  }
}
