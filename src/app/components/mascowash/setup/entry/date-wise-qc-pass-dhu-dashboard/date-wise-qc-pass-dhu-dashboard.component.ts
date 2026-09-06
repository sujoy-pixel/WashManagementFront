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
  filteredRows: QcPassDhuRow[] = [];

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
    this.globalSearch = '';
    this.filteredRows = [...this.allRows];
  }

  private mapRow(row: any): QcPassDhuRow {
    const totalCheckQty = this.toNumber(row.totalCheckQty ?? row.TotalCheckQty ?? row.totalCheckQTY);
    const totalOkayQty = this.toNumber(row.totalOkayQty ?? row.TotalOkayQty ?? row.totalOkayQTY);
    const totalDefectQty = this.toNumber(row.totalDefectQty ?? row.TotalDefectQty ?? row.totalDefectQTY);
    const totalRejectQty = this.toNumber(row.totalRejectQty ?? row.TotalRejectQty ?? row.totalRejectQTY);
    const defectsBalanceQty = this.toNumber(row.defectsBalanceQty ?? row.DefectsBalanceQty ?? row.defectsBalanceQTY);
    const rectifyDefectsQty = this.toNumber(row.rectifyDefectsQty ?? row.RectifyDefectsQty ?? row.rectifyDefectsQTY);

    return {
      date: row.date ?? row.Date ?? null,
      trackingNo: this.cleanStr(row.trackingNo ?? row.TrackingNo),
      receiveFrom: this.cleanStr(row.receiveFrom ?? row.ReceiveFrom),
      buyer: this.cleanStr(row.buyer ?? row.Buyer),
      job: this.cleanStr(row.job ?? row.Job),
      orderNo: this.cleanStr(row.orderNo ?? row.OrderNo ?? row.order ?? row.Order),
      style: this.cleanStr(row.style ?? row.Style),
      color: this.cleanStr(row.color ?? row.Color),
      dressPart: this.cleanStr(row.dressPart ?? row.DressPart),
      washCategory: this.cleanStr(row.washCategory ?? row.WashCategory),
      itemName: this.cleanStr(row.itemName ?? row.ItemName),
      shift: this.cleanStr(row.shift ?? row.Shift),
      qcName: this.cleanStr(row.qcName ?? row.QcName),
      receiveQty: this.toNumber(row.receiveQty ?? row.ReceiveQty),
      uom: this.cleanStr(row.uoM ?? row.uoM ?? row.uoM),
      batchNo: this.cleanStr(row.batchNo ?? row.BatchNo),
      totalCheckQty,
      totalOkayQty,
      totalDefectQty,
      defectPercent: this.toNumber(row.defectPercent ?? row.DefectPercent) ?? this.calcPercent(totalDefectQty, totalCheckQty),
      defectsBalanceQty,
      rectifyDefectsQty,
      totalRejectQty,
      rejectPercent: this.toNumber(row.rejectPercent ?? row.RejectPercent) ?? this.calcPercent(totalRejectQty, totalCheckQty)
    };
  }

  onGlobalSearch(): void { this.applyCombinedFilter(); }

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

    this.filteredRows = result;
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

    const exportData = this.filteredRows.map(row => ({
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

  trackByRow(index: number, row: QcPassDhuRow): string {
    return `${row.batchNo}-${row.trackingNo}-${row.date}-${index}`;
  }

  private resetGrid(): void {
    this.allRows = [];
    this.filteredRows = [];
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
