import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { WashSetupService } from '../../../services/washsetup.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-date-wise-hourly-qc-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule,
    CardModule
  ],
  templateUrl: './date-wise-hourly-qc-report.component.html',
  styleUrl: './date-wise-hourly-qc-report.component.scss'
})
export class DateWiseHourlyQcReportComponent implements OnInit {

  UnitList: any[] = [];
  buyerList: any[] = [];
  styleList: any[] = [];
  orderList: any[] = [];
  jobList: any[] = [];
  reportList: any[] = [];
  batchList: any[] = [];
  shiftList = [
  { label: 'M', value: 'M' },
  { label: 'N', value: 'N' }
];

  /* ===================== ADDED MISSING PROPERTIES ===================== */
  isLoading  = false;
  ReportUrl: SafeResourceUrl;
  baseUrl  = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

Model = {
  UnitId: null as number | null,
  BuyerId: null as number | null,
  StyleId: null as number | null,
  OrderId: null as number | null,
  JobId: null as number | null,
  ReportId: null as number | null,
  BatchNo: null as string | null,
  ShiftId: null as 'M' | 'N' | null,
  QcName: 'SYSTEM',
  Date: new Date()
};
  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    /* ===================== ADDED MISSING INJECTIONS ===================== */
    private http:   HttpClient,
    private router: Router,
    private _dom:   DomSanitizer
  ) {
    this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl('');
  }
private getShiftId(): number | null {

  if (this.Model.ShiftId === 'M') {
    return 1;
  }

  if (this.Model.ShiftId === 'N') {
    return 2;
  }

  return null;
}
  ngOnInit(): void {
    this.loadUnits();
    // this.loadReports();
  }

  /* ===================== LOAD REPORTS ===================== */
  loadReports(): void {
    this.service.GetReportNameDDL('Date Wise Hourly QC Report').subscribe(res => {
      this.reportList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));

      // Optionally auto-select the first report if needed
      // if (this.reportList.length > 0) {
      //   this.Model.ReportId = Number(this.reportList[0].value);
      // }
    });
  }

  /* ===================== LOAD UNIT ===================== */
  loadUnits(): void {
    this.service.GetUnitName().subscribe(res => {

      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));

      const found = this.UnitList.find(x => x.value === 60);
      if (found) {
        this.Model.UnitId = found.value;
        this.onUnitChange();
      }
    });
  }

  onUnitChange(): void {

    if (!this.Model.UnitId) return;

    this.service.GetBuyerNameDDL().subscribe(res => {

      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.BuyerName,
        value: x.ID ?? x.id ?? x.BuyerNo
      }));

      if (this.buyerList.length === 1) {
        this.Model.BuyerId = Number(this.buyerList[0].value);
        this.onBuyerChange();
      }
    });
  }

  /* ===================== BUYER CHANGE → LOAD JOB ===================== */
  onBuyerChange(): void {

    this.jobList = [];
    this.styleList = [];
    this.orderList = [];

    this.Model.JobId = null;
    this.Model.StyleId = null;
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId) {
      return;
    }

    this.service.GetJobNoWithParameterDDL({
      unitId: this.Model.UnitId,
      buyerId: this.Model.BuyerId
    }).subscribe(res => {

      this.jobList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.jobInfo,
        value: x.ID ?? x.id ?? x.JobId
      }));

      if (this.jobList.length === 1) {
        this.Model.JobId = Number(this.jobList[0].value);
        this.onJobChange();
      }
    });
  }

  /* ===================== JOB CHANGE → LOAD STYLE ===================== */
  onJobChange(): void {

    this.styleList = [];
    this.orderList = [];

    this.Model.StyleId = null;
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId) {
      return;
    }

    this.service.GetStyleNoWithParameterDDL({
      unitId: this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId: this.Model.JobId
    }).subscribe(res => {

      this.styleList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id ?? x.StyleId
      }));

      if (this.styleList.length === 1) {
        this.Model.StyleId = Number(this.styleList[0].value);
        this.onStyleChange();
      }
    });
  }

  /* ===================== STYLE CHANGE → LOAD ORDER ===================== */
  onStyleChange(): void {

    this.orderList = [];
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId || !this.Model.StyleId) {
      return;
    }

    this.service.GetOrderNoWithParameterDDL({
      unitId: this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId: this.Model.JobId,
      styleId: this.Model.StyleId
    }).subscribe(res => {

      this.orderList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id ?? x.OrderId
      }));

      if (this.orderList.length === 1) {
        this.Model.OrderId = Number(this.orderList[0].value);
      }
    });
  }

  /* ===================== VALIDATION ===================== */
 private isFormValid(): boolean {

  if (!this.Model.UnitId) {
    this.toastr.warning('Please select a Unit.');
    return false;
  }

  if (!this.Model.BuyerId) {
    this.toastr.warning('Please select a Buyer.');
    return false;
  }

  if (!this.Model.StyleId) {
    this.toastr.warning('Please select a Style.');
    return false;
  }

  if (!this.Model.ShiftId) {
    this.toastr.warning('Please select a Shift.');
    return false;
  }

  if (!this.Model.Date) {
    this.toastr.warning('Please select a Date.');
    return false;
  }

  return true;
}

  /* ===================== SEARCH → SHOW REPORT ===================== */
  onSearch(): void {
    if (!this.isFormValid()) return;
    this.printReport();
  }

  printReport(): void {
    this.isLoading = true;

    const token   = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const dateStr = this.formatDate(this.Model.Date);

   const objparam = {
  ReportName: 'Date Wise Hourly QC Report',
  Type: 'PDF',
  UnitId: this.Model.UnitId,
  BuyerId: this.Model.BuyerId,
  StyleId: this.Model.StyleId,
  Date: dateStr,
  OrderId: this.Model.OrderId ?? null,
  JobId: this.Model.JobId ?? null,
  BatchNo: this.Model.BatchNo ?? null,
  ShiftId: this.getShiftId()
};

    this.http.post<any>(`${this.baseUrl_}Report/ShowReportMultiResult`, objparam, { headers })
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response?.url) {
            this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl(response.url);

            window.open(
              this.router.serializeUrl(
                this.router.createUrlTree(['/mascowash/report-view'], {
                  queryParams: {
                    url:        response.url,
                    TrackingNo: this.Model.BatchNo ?? dateStr
                  }
                })
              ),
              '_blank'
            );
          } else {
            this.toastr.warning('No report URL returned from server.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Report error:', err);
          this.toastr.error(err?.error ?? 'Failed to load report.');
        }
      });
  }

  /* ===================== RESET HELPERS ===================== */
  private resetFrom(level: 'unit' | 'buyer' | 'job' | 'style'): void {
    const levels = ['unit', 'buyer', 'job', 'style'];
    const idx    = levels.indexOf(level);

    if (idx <= 0) {
      this.buyerList     = [];
      this.Model.BuyerId = null;
    }
    if (idx <= 1) {
      this.jobList     = [];
      this.Model.JobId = null;
    }
    if (idx <= 2) {
      this.styleList     = [];
      this.Model.StyleId = null;
    }
    if (idx <= 3) {
      this.orderList     = [];
      this.Model.OrderId = null;
      this.batchList     = [];
      this.Model.BatchNo = null;
    }
  }

  /* ===================== DATE FORMAT HELPER ===================== */
  private formatDate(date: Date): string {
    const d    = new Date(date);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}