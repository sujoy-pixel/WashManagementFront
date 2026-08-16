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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  isLoading = false;
  ReportUrl: SafeResourceUrl;
  baseUrl = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  /* ===================== BATCH NO AUTOCOMPLETE ===================== */
  // Subject that ng-select's [typeahead] pushes every keystroke into.
  batchNoInput$ = new Subject<string>();
  // Bound to ng-select's [loading] so the spinner shows while a search is in flight.
  batchLoading = false;
  // Minimum characters typed before we bother hitting the server.
  private readonly BATCH_NO_MIN_CHARS = 2;

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
    private http: HttpClient,
    private router: Router,
    private _dom: DomSanitizer
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
    //this.loadReports();
    //this.setupBatchNoTypeahead();
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
  onShiftChange(): void {
   debugger;
  this.batchList = [];
  this.Model.BatchNo = null;

  if (!this.Model.Date || !this.Model.ShiftId) {
    return;
  }

  const dateStr = this.formatDate(this.Model.Date);
  const shiftId = this.getShiftId();

  if (!shiftId) {
    return;
  }

  this.service.GetBatchNoByDateAndShift({
    date: dateStr,
    shiftId: shiftId
  }).subscribe({
    next: (res: any[]) => {

      this.batchList = (res || []).map((x: any) => ({
        label: x.BatchNo ?? x.batchNo,
        value: x.BatchNo ?? x.batchNo,
        masterId: x.MasterId ?? x.masterId
      }));

      if (this.batchList.length === 1) {
        this.Model.BatchNo = this.batchList[0].value;
      }
    },

    error: (err) => {

      this.batchList = [];
      this.Model.BatchNo = null;

      console.error(
        'Get Batch No By Date And Shift Error:',
        err
      );

      this.toastr.error(
        err?.error?.message ??
        err?.error ??
        'Failed to load Batch No.'
      );
    }
  });
}

  // private setupBatchNoTypeahead(): void {
  //   debugger;
  //   this.batchNoInput$
  //     .pipe(
  //       debounceTime(300),
  //       distinctUntilChanged(),

  //       switchMap((term: string) => {

  //         const searchText = (term || '').trim();

  //         console.log('Batch Search:', searchText);

  //         if (searchText.length < 2) {
  //           this.batchLoading = false;
  //           this.batchList = [];
  //           return of([]);
  //         }

  //         this.batchLoading = true;

  //         return this.service.GetBatchNoQCAutoComplete(searchText)
  //           .pipe(
  //             catchError((error) => {

  //               console.error(
  //                 'Batch No autocomplete API error:',
  //                 error
  //               );

  //               this.batchLoading = false;
  //               this.batchList = [];

  //               this.toastr.error(
  //                 'Failed to load Batch No.'
  //               );

  //               return of([]);
  //             })
  //           );

  //       })
  //     )
  //     .subscribe((res: any[]) => {

  //       this.batchLoading = false;

  //       console.log('Batch API Response:', res);

  //       this.batchList = (res || []).map((x: any) => ({
  //         label: x.batchNo ?? x.BatchNo,
  //         value: x.batchNo ?? x.BatchNo,
  //         masterId: x.masterId ?? x.MasterId
  //       }));

  //     });
  // }
  // Bound to ng-select's (change) - fires when the user actually picks a batch.
  onBatchNoChange(selected: any): void {
    this.Model.BatchNo = selected?.value ?? selected ?? null;
  }

  // Bound to ng-select's (clear) - fires when the user clicks the "x".
  onBatchNoClear(): void {
    this.Model.BatchNo = null;
    this.batchList = [];
    
  }

  /* ===================== VALIDATION ===================== */
private isFormValid(): boolean {
debugger;
  // ==========================================
  // CASE 1: Batch No selected
  // ==========================================
  // If Batch No is selected, nothing else is mandatory.
  if (this.Model.BatchNo) {
    return true;
  }

  // ==========================================
  // CASE 2: Batch No NOT selected
  // ==========================================
  // All normal filters are mandatory.

  if (!this.Model.UnitId) {
    this.toastr.warning('Please select a Unit.');
    return false;
  }

  if (!this.Model.BuyerId) {
    this.toastr.warning('Please select a Buyer.');
    return false;
  }

  if (!this.Model.JobId) {
    this.toastr.warning('Please select a Job.');
    return false;
  }

  if (!this.Model.StyleId) {
    this.toastr.warning('Please select a Style.');
    return false;
  }

  if (!this.Model.OrderId) {
    this.toastr.warning('Please select an Order.');
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
    debugger;
    this.isLoading = true;

    const token = localStorage.getItem('token');
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
                    url: response.url,
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
    const idx = levels.indexOf(level);

    if (idx <= 0) {
      this.buyerList = [];
      this.Model.BuyerId = null;
    }
    if (idx <= 1) {
      this.jobList = [];
      this.Model.JobId = null;
    }
    if (idx <= 2) {
      this.styleList = [];
      this.Model.StyleId = null;
    }
    if (idx <= 3) {
      this.orderList = [];
      this.Model.OrderId = null;
      this.batchList = [];
      this.Model.BatchNo = null;
    }
  }

  /* ===================== DATE FORMAT HELPER ===================== */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}