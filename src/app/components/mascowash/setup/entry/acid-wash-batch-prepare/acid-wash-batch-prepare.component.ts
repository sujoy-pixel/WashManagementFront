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
  id?:          number | null; // ✅ Added ID for Update tracking
  sizeId?:      number | null;
  size:         string;
  preparePcs:   number;
  prepareKg:    number;
  preparedPcs:  number;
  preparedKg:   number;
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
  qty?:               number; // ✅ For Edit Mode mapping
  kg?:                number; // ✅ For Edit Mode mapping
  detailId?:          number; // ✅ To capture ID from API for updates
}

/* ─────────────────────────────────────────────
   API PAYLOAD INTERFACES
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
  id?:        number | null; // ✅ Added for Update
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

  // ✅ Edit Mode Tracking
  isEditMode:      boolean = false;
  MasterId:        number = 0;
  saveButtonTitle: string = 'Save';

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
    //  preparePcs: 0,
    //   prepareKg: 0,
    //  preparedPcs: 0,
    //   preparedKg: 0
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
    // ✅ Load process DDL first — THEN load parent data
    this.loadProcessDDLThenData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.batchInput?.nativeElement.focus(), 100);
  }

  /* ─────────────────────────────────────────────
     ✅ LOAD PROCESS DDL → THEN PARENT DATA
  ───────────────────────────────────────────── */
  loadProcessDDLThenData(): void {
    this.service.GetProcessNameDDL().subscribe({
      next: (res: any) => {
        this.processList = res.map((x: any) => ({
          label: x.displayName ?? x.DisplayName,
          value: x.id          ?? x.ID
        }));
        // ✅ NOW safe to load — processList is ready
        this.loadDataFromParent();
      },
      error: (err) => {
        console.error('❌ Process DDL load error:', err);
        this.loadDataFromParent();
      }
    });
  }


    /* ─────────────────────────────────────────────
     ✅ LOAD DATA FROM LOCALSTORAGE (EDIT MODE)
  ───────────────────────────────────────────── */
  private loadDataFromParent(): void {
    debugger;
    const navState = localStorage.getItem('WASH_PREPARE_NAV_STATE');
    if (!navState) {
      console.log('🟢 New batch mode — user selects process & machine manually');
      return;
    }

    const data = JSON.parse(navState);
    console.log('✅ Loaded Navigation State:', data);

    /* ===== Edit Mode Detection ===== */
    this.MasterId   = data.MasterId ?? 0;
    this.isEditMode = this.MasterId > 0;
  if (this.MasterId > 0) 
  {
    this.saveButtonTitle = this.MasterId ? 'Update' : 'Save';
  }

  
    
    /* ===== Batch No & Headers ===== */
    // ✅ Strip the Acid portion (e.g., "(A1)", "(A2)", "(A3)") to get the parent Wash Batch
    let rawBatchNo = data.AutoBatchNo ?? '';
    this.washBatchNo = rawBatchNo.replace(/\(A.*\)/, '').trim(); 
    
    this.batchHeader.buyer = data.buyer   ?? '';
    this.batchHeader.jobNo   = data.jobNo   ?? '';
    this.batchHeader.styleNo = data.styleNo ?? '';
    this.batchHeader.orderNo = data.orderNo ?? '';
    this.batchHeader.color   = data.color   ?? '';
    this.acidBatchNo = rawBatchNo; // Keep the original for display and API calls
    this.batchQtyPcs=data.totalQty;
    this.batchQtyKg=(data.RemainingKg + data.alreadyPreparedKg);

      this.totalPreparePcs = data.qty;
      this.totalPrepareKg = data.Kg || 0;
      this.totalPreparedPcs = data.alreadyPreparedQty || 0;
      this.totalPreparedKg = data.alreadyPreparedKg || 0;
    // /* ===== Load Grid Data via API ===== */
    // if (this.washBatchNo) {
    //   this.loadBatchData();
    // }

    /* ===== Process & Machine Pre-Selection ===== */
    const processIdsStr = data.processIds ?? '';
    const machineIdsStr = data.machineIds ?? '';

    if (processIdsStr && processIdsStr.trim() !== '') {
      console.log('🔵 Modification mode — pre-selecting process & machine');
      this.preSelectProcessAndMachine(processIdsStr, machineIdsStr);
    } else {
      this.Model.processList = [];
      this.Model.machineList = [];
    }
  }
  // private loadDataFromParent(): void {
  //   debugger;
  //   const navState = localStorage.getItem('WASH_PREPARE_NAV_STATE');
  //   if (!navState) {
  //     console.log('🟢 New batch mode — user selects process & machine manually');
  //     return;
  //   }

  //   const data = JSON.parse(navState);
  //   console.log('✅ Loaded Navigation State:', data);

  //   /* ===== Edit Mode Detection ===== */
  //   this.MasterId   = data.MasterId ?? 0;
  //   this.isEditMode = this.MasterId > 0 || (data.AutoBatchNo && data.AutoBatchNo.includes('('));
  //   this.saveButtonTitle = this.isEditMode ? 'Update' : 'Save';

  //   /* ===== Batch No & Headers ===== */
  //   this.washBatchNo       = data.washBatchNo ?? '';
  //   this.batchHeader.buyer = data.buyer   ?? '';
  //   this.batchHeader.jobNo   = data.jobNo   ?? '';
  //   this.batchHeader.styleNo = data.styleNo ?? '';
  //   this.batchHeader.orderNo = data.orderNo ?? '';
  //   this.batchHeader.color   = data.color   ?? '';

  //   /* ===== Load Grid Data via API ===== */
  //   if (this.washBatchNo) {
  //     this.loadBatchData();
  //   }

  //   /* ===== Process & Machine Pre-Selection ===== */
  //   const processIdsStr = data.processIds ?? '';
  //   const machineIdsStr = data.machineIds ?? '';

  //   if (processIdsStr && processIdsStr.trim() !== '') {
  //     console.log('🔵 Modification mode — pre-selecting process & machine');
  //     this.preSelectProcessAndMachine(processIdsStr, machineIdsStr);
  //   } else {
  //     this.Model.processList = [];
  //     this.Model.machineList = [];
  //   }
  // }

  /* ─────────────────────────────────────────────
     ✅ PRE-SELECT PROCESS + MACHINE (Modification Only)
  ───────────────────────────────────────────── */
  private preSelectProcessAndMachine(processIdsStr: string, machineIdsStr: string): void {
    const processIdArr: number[] = processIdsStr
      .split(',')
      .map((x: string) => Number(x.trim()))
      .filter(Boolean);

    const machineIdArr: number[] = machineIdsStr
      ? machineIdsStr.split(',').map((x: string) => Number(x.trim())).filter(Boolean)
      : [];

    // ✅ Pre-select process
    this.Model.processList = processIdArr.filter(id =>
      this.processList.some(p => Number(p.value) === id)
    );

    if (!machineIdArr.length) return;

    // ✅ Load machines for these processes, then pre-select saved machines
    this.service.GetMachineByProcess(processIdArr.join(',')).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.data || res?.result || [];

        this.machineList = list.map((x: any) => ({
          label: x.displayName     ?? x.DisplayName     ?? x.machineName     ?? x.MachineName,
          value: x.id              ?? x.ID              ?? x.machineDetailId ?? x.MachineDetailId
        }));

        // ✅ Pre-select only saved machines that exist in loaded list
        this.Model.machineList = this.machineList.filter(m =>
          machineIdArr.includes(Number(m.value))
        );

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Machine load error:', err);
        this.machineList       = [];
        this.Model.machineList = [];
      }
    });
  }

  /* ─────────────────────────────────────────────
     DDL LOADERS
  ───────────────────────────────────────────── */
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
      debugger;
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
      // if (this.totalPreparePcs > this.maxQty) {
      //   this.totalPreparePcs = this.maxQty;
      //   this.toastr.warning(`Max allowed Pcs: ${this.maxQty}`, 'Limit Exceeded');
      // }
      // if (this.totalPrepareKg > this.maxKg) {
      //   this.totalPrepareKg = this.maxKg;
      //   this.toastr.warning(`Max allowed Kg: ${this.maxKg}`, 'Limit Exceeded');
      // }
    });
  }

  onTotalPcsChange() {
    // if (this.totalPreparePcs > this.maxQty) {
    //   this.totalPreparePcs = this.maxQty;
    //   this.toastr.warning(`Max allowed Pcs: ${this.maxQty}`, 'Limit Exceeded');
    // }
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

    /* ── Build API Payload ────────────────────────────────────── */
    const payload: ApiPayload = {
      master: {
        operation:  this.isEditMode ? 'UPDATE' : 'INSERT', // ✅ Dynamic Operation
        masterId:   this.MasterId ?? 0,                    // ✅ Use stored MasterId
        batchNo:    this.washBatchNo,         
        totalPcs:   this.totalPreparePcs,     
        totalKg:    this.totalPrepareKg,      
        processIds: (this.Model.processList || []).join(','),
        // ✅ Safe mapping in case machineList holds objects
        machineIds: (this.Model.machineList  || []).map((x: any) => 
                        typeof x === 'object' ? x.value : x
                     ).join(',')
      },
      details: this.sizeQty.map(s => ({
        id:         s.id ?? null,                          // ✅ Include ID for Update
        sizeId:     s.sizeId ?? null,
        sizeName:   s.size,                   
        sizeQty:    Number(s.preparePcs) || 0, 
        sizeWeight: Number(s.prepareKg)  || 0  
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

        this.toastr.success(this.isEditMode ? 'Updated successfully' : 'Saved successfully');

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

    // ✅ Reset Edit Mode flags
    this.isEditMode      = false;
    this.MasterId        = 0;
    this.saveButtonTitle = 'Save';

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
    // this.totalPreparePcs  = 0;
    // this.totalPrepareKg   = 0;
    // this.totalPreparedPcs = 0;
    // this.totalPreparedKg  = 0;
    // this.initialTotalPcs  = 0;
    // this.RemainingQty     = 0;
    // this.RemainingKg      = 0;

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