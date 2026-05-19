import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { Router } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

/* ─────────────────────────────────────────────
   INTERFACES — local grid model
───────────────────────────────────────────── */
interface SizeQtyModel {
  sizeId?:     number | null;
  size:        string;
  preparePcs:  number;
  prepareKg:   number;
  preparedPcs: number;
  preparedKg:  number;
}

interface AcidWashBatchPrepareResponse {
  unitName:           string;
  unitId:             number;
  batchNo:            string;
  buyerName:          string;
  buyerId:            number;
  jobNo:              string;
  jobId:              number;
  styleName:          string;
  styleId:            number;
  orderNo:            string;
  orderId:            number;
  color:              string;
  colorId:            number;
  sizeId:             number | null;
  size:               string;
  totalQty:           number;
  totalKg:            number;
  alreadyPreparedQty: number;
  alreadyPreparedKg:  number;
  remainingQty:       number;
  remainingKg:        number;
}

/* ─────────────────────────────────────────────
   API PAYLOAD INTERFACES
   — property names match C# camelCase exactly
     (ASP.NET Core default JSON serialisation)
───────────────────────────────────────────── */

/** Maps to AcidWashPrepareMasterDto */
interface ApiMasterDto {
  operation:  string;   // "INSERT" | "UPDATE"
  masterId:   number;   // 0 for INSERT
  batchNo:    string;   // ← washBatchNo
  totalPcs:   number;   // ← totalPreparePcs
  totalKg:    number;   // ← totalPrepareKg
  processIds: string;   // comma-separated
  machineIds: string;   // comma-separated
}

/** Maps to AcidWashPrepareSizeDto */
interface ApiSizeDto {
  sizeId:     number | null;
  sizeName:   string;   // ← size
  sizeQty:    number;   // ← preparePcs
  sizeWeight: number;   // ← prepareKg
}

/** Maps to SaveAcidWashBatchPrepareCommand */
interface ApiPayload {
  master:  ApiMasterDto;
  details: ApiSizeDto[];
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
@Component({
  selector: 'app-acid-wash-batch-prepare',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './acid-wash-batch-prepare.component.html',
  styleUrls:   ['./acid-wash-batch-prepare.component.scss']
})
export class AcidWashBatchPrepareComponent implements OnInit {

  @ViewChild('batchInput') batchInput!: ElementRef;

  isLoading: boolean        = false;
  isSaving:  boolean        = false;
  bsConfig:  Partial<BsDatepickerConfig>;
  ReportUrl: SafeResourceUrl;

  baseUrl  = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  Model: any = {
    processList: [],
    machineList: []
  };

  processList: any[] = [];
  machineList: any[] = [];

  /* ── Top Section ── */
  washBatchNo: string = '';
  batchQtyPcs: number = 0;
  batchQtyKg:  number = 0;

  batchHeader = {
    prepareDate:  new Date(),
    revisionNo:   '',
    revisionDate: null as Date | null,
    prepareBy:    'SYSTEM',
    buyer:        '',
    jobNo:        '',
    styleNo:      '',
    orderNo:      '',
    itemType:     '',
    composition:  '',
    gsm:          '',
    color:        ''
  };

  /* ── Middle Section ── */
  acidBatchNo: string = '';

  /* ── Bottom Section (Grid) ── */
  sizeQty:         SizeQtyModel[] = [];
  totalPreparePcs: number = 0;
  totalPrepareKg:  number = 0;
  totalPreparedPcs: number = 0;
  totalPreparedKg:  number = 0;

  isTotalEditable: boolean = false;
  showSizeDetails: boolean = true;
  applyToAll:      boolean = false;

  maxQty: number = 0;
  maxKg:  number = 0;

  alreadyPreparedQty: number = 0;
  alreadyPreparedKg:  number = 0;
  initialTotalPcs:    number = 0;
  RemainingQty:       number = 0;
  RemainingKg:        number = 0;

  constructor(
    private service: WashSetupService,
    private toastr:  ToastrService,
    private cdr:     ChangeDetectorRef,
    private _dom:    DomSanitizer,
    private http:    HttpClient,
    private route:   Router
  ) {
    this.bsConfig  = { dateInputFormat: 'DD-MMM-YYYY' };
    this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl('');
  }

  /* ─────────────────────────────────────────────
     LIFECYCLE
  ───────────────────────────────────────────── */
  ngOnInit(): void {
    this.loadProcessDDL();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.batchInput?.nativeElement.focus(), 100);
  }

  /* ─────────────────────────────────────────────
     DDL LOADERS
  ───────────────────────────────────────────── */
  loadProcessDDL() {
    this.service.GetProcessNameDDL().subscribe(res => {
      this.processList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id          ?? x.ID
      }));
    });
  }

  loadMachineDDL() {
    this.service.GetMachineNoDDL().subscribe(res => {
      this.machineList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id          ?? x.ID
      }));
    });
  }

  onSelectionChangeProcess(event: MatSelectChange) {
    const selectedIds: number[] = event.value || [];
    this.Model.processList = selectedIds;

    if (selectedIds.length === 0) {
      this.machineList       = [];
      this.Model.machineList = [];
      return;
    }

    this.service.GetMachineByProcess(selectedIds.join(',')).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data || res?.result || [];
        this.machineList = data.map((x: any) => ({
          label: x.displayName   ?? x.DisplayName   ??
                 x.machineName   ?? x.MachineName,
          value: x.id            ?? x.ID             ??
                 x.machineDetailId ?? x.MachineDetailId
        }));
        this.Model.machineList = [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Machine DDL error:', err);
        this.machineList       = [];
        this.Model.machineList = [];
      }
    });
  }

  /* ─────────────────────────────────────────────
     LOAD BATCH DATA
  ───────────────────────────────────────────── */
  loadBatchData() {
    if (!this.washBatchNo) {
      this.toastr.warning('Enter Wash Batch No');
      return;
    }

    this.service.getBatchWishAsidPrepareData(this.washBatchNo).subscribe({
      next: (res: any) => {
        const data: AcidWashBatchPrepareResponse[] =
          Array.isArray(res) ? res : res.data;

        if (!data || data.length === 0) {
          this.toastr.warning('No data found for this Batch');
          return;
        }

        const first = data[0];

        /* Header */
        this.batchHeader.buyer   = first.buyerName  || '';
        this.batchHeader.jobNo   = first.jobNo       || '';
        this.batchHeader.styleNo = first.styleName  || '';
        this.batchHeader.orderNo = first.orderNo    || '';
        this.batchHeader.color   = first.color      || '';

        /* Batch totals */
        this.batchQtyPcs = data.reduce((s, x) => s + (Number(x.totalQty) || 0), 0);
        this.batchQtyKg  = data.reduce((s, x) => s + (Number(x.totalKg)  || 0), 0);

        /* Size grid */
        this.sizeQty = data.map(x => ({
          sizeId:      x.sizeId,
          size:        x.size || 'ALL',
          preparePcs:  Number(x.remainingQty)       || 0,
          prepareKg:   Number(x.remainingKg)        || 0,
          preparedPcs: Number(x.alreadyPreparedQty) || 0,
          preparedKg:  Number(x.alreadyPreparedKg)  || 0
        }));

        /* Max caps */
        this.maxQty = this.sizeQty.reduce((s, x) => s + x.preparePcs, 0);
        this.maxKg  = this.sizeQty.reduce((s, x) => s + x.prepareKg,  0);

        this.calculateTotals();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error loading batch');
      }
    });
  }

  /* ─────────────────────────────────────────────
     GRID HELPERS
  ───────────────────────────────────────────── */
  toggleSizeView() {
    this.showSizeDetails = !this.showSizeDetails;
  }

  applyFirstValueToAll() {
    if (!this.sizeQty.length) return;
    const firstValue = this.sizeQty[0].preparePcs;
    this.sizeQty.forEach(x => x.preparePcs = firstValue);
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalPreparePcs  = this.sizeQty.reduce((s, x) => s + (Number(x.preparePcs)  || 0), 0);
    this.totalPrepareKg   = this.sizeQty.reduce((s, x) => s + (Number(x.prepareKg)   || 0), 0);
    this.totalPreparedPcs = this.sizeQty.reduce((s, x) => s + (Number(x.preparedPcs) || 0), 0);
    this.totalPreparedKg  = this.sizeQty.reduce((s, x) => s + (Number(x.preparedKg)  || 0), 0);
  }

  /* ─────────────────────────────────────────────
     INPUT VALIDATION
  ───────────────────────────────────────────── */
  onlyNumber(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
    setTimeout(() => {
      if (this.totalPreparePcs > this.maxQty) {
        this.totalPreparePcs = this.maxQty;
        this.toastr.warning(`Max allowed Pcs: ${this.maxQty}`, 'Limit Exceeded');
      }
      if (this.totalPrepareKg > this.maxKg) {
        this.totalPrepareKg = this.maxKg;
        this.toastr.warning(`Max allowed Kg: ${this.maxKg}`, 'Limit Exceeded');
      }
    });
  }

  onTotalPcsChange() {
    if (this.totalPreparePcs > this.maxQty) {
      this.totalPreparePcs = this.maxQty;
      this.toastr.warning(`Max allowed Pcs: ${this.maxQty}`, 'Limit Exceeded');
    }
  }

  /* ─────────────────────────────────────────────
     SAVE
  ───────────────────────────────────────────── */
  onSubmit() {

    /* ── Validation ── */
    if (!this.washBatchNo) {
      this.toastr.warning('Wash Batch No is required');
      return;
    }
    if (!this.Model.processList?.length) {
      this.toastr.warning('Please select at least one Process');
      return;
    }
    if (!this.Model.machineList?.length) {
      this.toastr.warning('Please select at least one Machine');
      return;
    }
    if (this.totalPreparePcs <= 0 && this.totalPrepareKg <= 0) {
      this.toastr.warning('Prepare Qty (Pcs or Kg) must be greater than 0');
      return;
    }

    /* ── Build API Payload ──────────────────────────────────────
       Property names must match C# AcidWashPrepareMasterDto and
       AcidWashPrepareSizeDto exactly (ASP.NET camelCase binding)
    ─────────────────────────────────────────────────────────── */
    const payload: ApiPayload = {
      master: {
        operation:  'INSERT',
        masterId:   0,
        batchNo:    this.washBatchNo,         // washBatchNo   → BatchNo
        totalPcs:   this.totalPreparePcs,     // totalPreparePcs → TotalPcs
        totalKg:    this.totalPrepareKg,      // totalPrepareKg  → TotalKg
        processIds: (this.Model.processList as number[]).join(','),
        machineIds: (this.Model.machineList  as number[]).join(',')
      },
      details: this.sizeQty.map(s => ({
        sizeId:     s.sizeId ?? null,
        sizeName:   s.size,                   // size       → SizeName
        sizeQty:    Number(s.preparePcs) || 0, // preparePcs → SizeQty
        sizeWeight: Number(s.prepareKg)  || 0  // prepareKg  → SizeWeight
      }))
    };

    console.log('API Payload:', payload);

    /* ── API Call ── */
    this.isSaving = true;

    this.service.SaveAcidWashBatchPrepare(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;

        if (res?.succeeded === false) {
          this.toastr.error(res?.errors?.[0] || 'Save failed', 'Error');
          return;
        }

        this.toastr.success('Saved successfully');

        // res.message contains the generated AcidBatchNo on success
        if (res?.message) {
          this.acidBatchNo = res.message;
          this.printReport('Batch Card Preview', this.acidBatchNo);
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('Save error:', err);
        this.toastr.error(
          err?.error?.errors?.[0] || err?.error?.message || 'Failed to save. Please try again.',
          'Save Error'
        );
      }
    });
    this.onClear();
  }

  /* ─────────────────────────────────────────────
     PRINT REPORT
  ───────────────────────────────────────────── */
  ReportUrlTab: any;

  printReport(ReportType: string, GenerateNumber: string) {
    debugger;
    this.isLoading = true;
    const token   = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const objparam = {
      ReportName:     'Batch Card Preview',
      Type:           'PDF',
      GenerateNumber: GenerateNumber
    };

    this.http.post<any>(`${this.baseUrl_}Report/ShowReport`, objparam, { headers })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.url) {
            this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl(response.url);
            window.open(
              this.route.serializeUrl(
                this.route.createUrlTree(['/mascowash/report-view'], {
                  queryParams: { url: response.url, TrackingNo: GenerateNumber }
                })
              ),
              '_blank'
            );
          } else {
            console.error('No URL returned from the backend.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error fetching the report URL:', error);
          this.toastr.warning(error.error);
        }
      });
  }

  /* ─────────────────────────────────────────────
     CLEAR / RESET
  ───────────────────────────────────────────── */
  onClear() {
    this.washBatchNo = '';
    this.acidBatchNo = '';
    this.batchQtyPcs = 0;
    this.batchQtyKg  = 0;
    this.sizeQty     = [];
    this.maxQty      = 0;
    this.maxKg       = 0;
    this.isSaving    = false;

    this.Model.processList = [];
    this.Model.machineList = [];

    this.batchHeader = {
      prepareDate:  new Date(),
      revisionNo:   '',
      revisionDate: null,
      prepareBy:    'SYSTEM',
      buyer:        '',
      jobNo:        '',
      styleNo:      '',
      orderNo:      '',
      itemType:     '',
      composition:  '',
      gsm:          '',
      color:        ''
    };

    this.showSizeDetails  = true;
    this.applyToAll       = false;
    this.isTotalEditable  = false;
    this.totalPreparePcs  = 0;
    this.totalPrepareKg   = 0;
    this.totalPreparedPcs = 0;
    this.totalPreparedKg  = 0;
    this.initialTotalPcs  = 0;
    this.RemainingQty     = 0;
    this.RemainingKg      = 0;

    setTimeout(() => this.batchInput?.nativeElement.focus(), 100);
  }

  /* ─────────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────────── */
  private formatDate(date: Date | null): string {
    if (!date) return '';
    const d    = new Date(date);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}