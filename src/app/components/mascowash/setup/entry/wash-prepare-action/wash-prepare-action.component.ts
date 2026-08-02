import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { Router } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-wash-prepare-action',
  templateUrl: './wash-prepare-action.component.html',
  styleUrls: ['./wash-prepare-action.component.scss']
})
export class WashPrepareActionComponent implements OnInit {

  isLoading: any = false;

  Model: any = {
    processList: [],
    machineList: [],
    shade: true
  };

  processList: any[] = [];
  machineList: any[] = [];
  MasterId: number = 0;

  allSelectedProcess = false;
  allSelectedMachine = false;
  currentFocus: string | null = null;

  batch = {
    buyer:         '',
    jobNo:         '',
    styleNo:       '',
    orderNo:       '',
    process:       '',
    batchNo:       '',
    documentNo:    '',
    effectiveDate: new Date(),
    revisionDate:   new Date(),
    revisionNo:    '',
    date:          '',
    fabrication:   '',
    composition:   '',
    gsm:           '',
    color:         '',
    type:          '',
    trackingNo:    '',
    AutoBatchNo:   '',
    revesionNo:      ''
  };

  batchIds: any = {};

  saveButtonTitle  = 'Save';
  machineRows      = new Array(6);

  sizeQty: { sizeId?: number | null; size: string; pcs: number; kg: number }[] = [];

  totalPcs         = 0;
  totalKg: any     = 0;
  initialTotalPcs  = 0;
  isTotalEditable  = false;
  showSizeDetails  = true;
  applyToAll       = false;
  remainingPcs     = 0;

  bsConfig: Partial<BsDatepickerConfig>;
  ReportUrl: SafeResourceUrl;
  baseUrl  = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  constructor(
    private service: WashSetupService,
    private toastr:  ToastrService,
    private router:  Router,
    private _dom:    DomSanitizer,
    private http:    HttpClient,
    private route:   Router,
    private cdr:     ChangeDetectorRef
  ) {
    this.bsConfig = { dateInputFormat: 'DD-MMM-YYYY' };
    this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl('');
  }

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    // ✅ Load process DDL first — THEN load parent data
    // This guarantees processList is ready when pre-selection runs
    this.loadProcessDDLThenData();
  }

  /* ===================== LOAD PROCESS DDL → THEN PARENT DATA ===================== */
  loadProcessDDLThenData(): void {
    this.service.GetProcessNameDDL().subscribe({
      next: (res: any) => {
        this.processList = res.map((x: any) => ({
          label: x.displayName ?? x.DisplayName,
          value: x.id          ?? x.ID
        }));
        console.log('✅ Process List loaded:', this.processList);

        // ✅ NOW safe to load — processList is ready
        this.loadDataFromParent();
      },
      error: (err) => {
        console.error('❌ Process DDL load error:', err);
        // still attempt to load parent data
        this.loadDataFromParent();
      }
    });
  }

  /* ===================== PROCESS SELECTION CHANGE (Manual — New Batch) ===================== */
  onSelectionChangeProcess(event: MatSelectChange): void {
    const selectedIds: number[] = event.value || [];
    this.Model.processList = selectedIds;

    console.log('Process IDs ARRAY:', selectedIds);

    if (selectedIds.length === 0) {
      this.machineList       = [];
      this.Model.machineList = [];
      return;
    }

    const processIds = selectedIds.join(',');
    console.log('Process IDs STRING:', processIds);

    this.service.GetMachineByProcess(processIds).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data || res?.result || [];

        this.machineList = data.map((x: any) => ({
          label: x.displayName     ?? x.DisplayName     ?? x.machineName     ?? x.MachineName,
          value: x.id              ?? x.ID              ?? x.machineDetailId ?? x.MachineDetailId
        }));

        // ✅ Reset machine selection — user picks manually
        this.Model.machineList = [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        this.machineList       = [];
        this.Model.machineList = [];
      }
    });
  }

  /* ===================== NUMBER INPUT HANDLERS ===================== */
  onlyNumber(event: any): void {
    const cleanValue        = event.target.value.replace(/[^0-9]/g, '');
    event.target.value      = cleanValue;
    this.totalPcs           = cleanValue ? Number(cleanValue) : 0;
  }

  Number(event: any): void {
    const cleanValue        = event.target.value.replace(/[^0-9]/g, '');
    event.target.value      = cleanValue;
    this.totalKg            = cleanValue ? Number(cleanValue) : 0;
  }

  onToggleTotalEdit(): void {
    if (this.isTotalEditable) {
      this.totalKg = null;
    }
  }

  /* ===================== PROCESS HELPERS ===================== */
  toggleAllSelectionProcess(): void {
    this.allSelectedProcess  = !this.allSelectedProcess;
    this.Model.processList   = this.allSelectedProcess ? [...this.processList.map(x => x.value)] : [];
  }

  isAllSelectedProcess(): boolean {
    return this.Model.processList?.length === this.processList.length;
  }

  /* ===================== MACHINE HELPERS ===================== */
  onSelectionChangeMachine(event: any): void {
    this.Model.machineList = this.Model.machineList?.filter((x: any) => x !== null);
  }

  toggleAllSelectionMachine(): void {
    this.allSelectedMachine  = !this.allSelectedMachine;
    this.Model.machineList   = this.allSelectedMachine ? [...this.machineList] : [];
  }

  isAllSelectedMachine(): boolean {
    return this.Model.machineList?.length === this.machineList.length;
  }

  /* ===================== UI FOCUS ===================== */
  setFocus(field: string):  void { this.currentFocus = field; }
  clearFocus():             void { this.currentFocus = null;  }

  /* ===================== SIZE VIEW ===================== */
  toggleSizeView(): void {
    this.showSizeDetails = !this.showSizeDetails;
  }

  applyFirstValueToAll(): void {
    if (!this.sizeQty.length) return;
    const firstValue = this.sizeQty[0].pcs;
    this.sizeQty.forEach(x => x.pcs = firstValue);
    this.calculateTotals();
    this.calculateTotalsKG();
  }

  /* ===================== LOAD DATA FROM LOCALSTORAGE ===================== */
  private loadDataFromParent(): void {
    const navState = localStorage.getItem('WASH_PREPARE_NAV_STATE');
    if (!navState) {
      console.error('❌ No navigation state found');
      return;
    }

    const data = JSON.parse(navState);
    console.log('✅ Loaded Navigation State:', data);

    /* ===== TOTALS ===== */
    this.totalPcs        = data.totalQty              ?? 0;
    this.remainingPcs    = data.RemainingQty ?? data.remainingQty ?? 0;
    this.initialTotalPcs = this.totalPcs;
    this.MasterId        = data.MasterId              ?? 0;
     this.totalKg        = data.kg             ?? data.totalKg ?? 0 //data.totalKg ;  //data.totalKg  

    /* ===== IDs ===== */
    this.batchIds = {
      buyerId:      data.buyerId       ?? null,
      jobId:        data.jobId         ?? null,
      styleId:      data.styleId       ?? null,
      orderId:      data.orderId       ?? null,
      fabricationId:data.fabricationId ?? null,
      colorId:      data.colorId       ?? null,
      dressPartId:  data.dressPartId   ?? null,
      uomId:        data.uomId         ?? null,
      fromUnitId:   data.fromUnitId    ?? null,
      iszid:        data.iszid         ?? null
    };

    /* ===== HEADER DISPLAY ===== */
    this.batch.buyer         = data.buyer        ?? '';
    this.batch.jobNo         = data.jobNo         ?? '';
    this.batch.styleNo       = data.styleNo       ?? '';
    this.batch.orderNo       = data.orderNo       ?? '';
    this.batch.documentNo    = 'CKL-Wash-024';
    this.batch.effectiveDate = new Date();
    this.batch.revisionDate = new Date();
    this.batch.revesionNo    = data.revesionNo    ?? '';
    this.batch.date          = data.date          ?? '';
    this.batch.fabrication   = data.fabrication   ?? '';
    this.batch.composition   = data.composition   ?? '';
    this.batch.color         = data.color         ?? '';
    this.batch.gsm           = data.gsm           ?? '';
    this.batch.type          = data.type          ?? '';
    this.batch.trackingNo    = data.trackingNo    ?? '';
    this.batch.batchNo       = data.batchNo       ?? '';
    this.batch.AutoBatchNo   = data.AutoBatchNo   ?? '';

    /* ===== SHADE ===== */
    this.Model.shade = data.shade === 1 || data.shade === true || data.shade === '1';

    /* ===== SAVE / UPDATE ===== */
    this.saveButtonTitle = this.batch.AutoBatchNo?.trim() ? 'Update' : 'Save';

    /* ===== SIZE DETAILS ===== */
    this.showSizeDetails = false;
    if (Array.isArray(data.sizeDetails) && data.sizeDetails.length > 0) {
      const sizeMap = new Map<any, any>();
      data.sizeDetails.forEach((x: any) => {
        const key = x.sizeId ?? x.size;
        if (sizeMap.has(key)) {
          sizeMap.get(key).pcs += Number(x.qty  || x.pcs || 0);
          sizeMap.get(key).kg  += Number(x.kg   || 0);
        } else {
          sizeMap.set(key, {
            sizeId: x.sizeId ?? null,
            size:   x.size   ?? '',
            pcs:    Number(x.qty || x.pcs || 0),
            kg:     Number(x.kg  || 0)
          });
        }
      });
      this.sizeQty = Array.from(sizeMap.values());
      console.log('✅ Size Qty:', this.sizeQty);
    }

    /* ===== ✅ KEY DECISION: NEW vs MODIFICATION ===== */
    const processIdsStr = data.processIds ?? '';
    const machineIdsStr = data.machineIds ?? '';

    if (processIdsStr && processIdsStr.trim() !== '') {
      // ✅ MODIFICATION MODE — came from modification page with saved process/machine
      console.log('🔵 Modification mode — pre-selecting process & machine');
      this.preSelectProcessAndMachine(processIdsStr, machineIdsStr);
    } else {
      // ✅ NEW BATCH MODE — came from mother page; user selects manually as usual
      console.log('🟢 New batch mode — user selects process & machine manually');
      this.Model.processList = [];
      this.Model.machineList = [];
      this.machineList       = [];
    }
  }

  /* ===================== PRE-SELECT PROCESS + MACHINE (Modification Only) ===================== */
  private preSelectProcessAndMachine(processIdsStr: string, machineIdsStr: string): void {

    // ✅ Parse comma strings → number arrays
    const processIdArr: number[] = processIdsStr
      .split(',')
      .map((x: string) => Number(x.trim()))
      .filter(Boolean);

    const machineIdArr: number[] = machineIdsStr
      ? machineIdsStr.split(',').map((x: string) => Number(x.trim())).filter(Boolean)
      : [];

    console.log('🔵 Process IDs to select:', processIdArr);
    console.log('🔵 Machine IDs to select:', machineIdArr);

    // ✅ Pre-select process — processList already loaded before this runs
    this.Model.processList = processIdArr.filter(id =>
      this.processList.some(p => Number(p.value) === id)
    );
    console.log('✅ Process pre-selected:', this.Model.processList);

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

        console.log('✅ Machine list loaded:', this.machineList);
        console.log('✅ Machine pre-selected:', this.Model.machineList);

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Machine load error:', err);
        this.machineList       = [];
        this.Model.machineList = [];
      }
    });
  }

  /* ===================== TOTALS ===================== */
  calculateTotals(): void {
    this.totalPcs = this.sizeQty.reduce((s, x) => s + (+x.pcs || 0), 0);
  }

  calculateTotalsKG(): void {
    this.totalKg = this.sizeQty.reduce((s, x) => s + (+x.kg || 0), 0);
  }

  
onTotalPcsChange(): void {
debugger;
  // ✅ UPDATE MODE — validate against RemainingQty
  // if (this.saveButtonTitle === 'Update') {
  //   if (!this.totalPcs) {
  //     this.totalPcs = this.remainingPcs;
  //     return;
  //   }
  //   if (this.totalPcs > this.remainingPcs) {
  //     this.toastr.warning(`Max allowed: ${this.remainingPcs}`, 'Exceeds Remaining Qty');
  //     this.totalPcs = this.remainingPcs;
  //   }
  //   return;
  // }
// ✅ UPDATE MODE — validate against (RemainingQty + CurrentTotalQty)
if (this.saveButtonTitle === 'Update') {
  
  const maxAllowed = this.remainingPcs + (this.initialTotalPcs ?? 0);

  if (!this.totalPcs) {
    this.totalPcs = this.remainingPcs;
    return;
  }

  if (this.totalPcs > maxAllowed) {
    this.toastr.warning(`Max allowed: ${maxAllowed}`, 'Exceeds Remaining Qty');
    this.totalPcs = maxAllowed;
  }
  return;
}
  // ✅ SAVE MODE — validate against initialTotalPcs
  if (!this.totalPcs) {
    this.totalPcs = this.initialTotalPcs;
    return;
  }
  if (this.totalPcs > this.initialTotalPcs) {
    this.toastr.warning(`Max allowed: ${this.initialTotalPcs}`, 'Invalid Total Pcs');
    this.totalPcs = this.initialTotalPcs;
  }
}
  onTotalKgChange(): void { }

  /* ===================== SHADE ===================== */
  onShadeChange(event: any): void {
    this.Model.shade = event.target.checked ? 1 : 0;
  }

  /* ===================== CLEAR ALL ===================== */
  clearAll(): void {
    this.Model = { processList: [], machineList: [], shade: true };

    this.batch = {
      buyer: '', jobNo: '', styleNo: '', orderNo: '', process: '',
      batchNo: '', documentNo: '', effectiveDate: new Date(),
      revisionDate: new Date(), revisionNo: '', date: '', fabrication: '',
      composition: '', gsm: '', color: '', type: '', trackingNo: '', AutoBatchNo: '', revesionNo: ''
    };

    this.batchIds        = {};
    this.sizeQty         = [];
    this.totalPcs        = 0;
    this.totalKg         = 0;
    this.initialTotalPcs = 0;
    this.remainingPcs    = 0;
    this.isTotalEditable = false;
    this.showSizeDetails = true;
    this.allSelectedProcess = false;
    this.allSelectedMachine = false;
    this.currentFocus    = null;
    this.machineList     = [];
  }

  /* ===================== SUBMIT ===================== */
  onSubmit(): void {
    debugger;
    /* ===== VALIDATION ===== */
    if (!this.Model.processList?.length) {
      this.toastr.warning('Please select process');
      return;
    }
    if (!this.Model.machineList?.length) {
      this.toastr.warning('Please select machine');
      return;
    }

    const safeTotalPcs = Number(this.totalPcs) || 0;
    const safeTotalKg = Number(this.totalKg) || 0;

    const formatDate = (date: any) => date ? new Date(date).toISOString() : null;

    /* ===== MASTER ===== */
    const master = {
      operation:     this.MasterId ? 'UPDATE' : 'INSERT',
      createdBy:     'SYSTEM',
      masterId:      this.MasterId ?? 0,

      unitId:        this.batchIds.fromUnitId,
      trackingNo:    this.batch.trackingNo  ?? '',
      batchNo:       this.batch.batchNo     ?? '',
      type:          this.batch.type        ?? '',
      documentNo:    'CKL-Wash-024',

      effectiveDate: formatDate(this.batch.effectiveDate),
      revisionDate:  formatDate(this.batch.revisionDate),
      revisionNo:    this.batch.revesionNo  ?? '',
      date:          formatDate(this.batch.date),
      composition:   this.batch.composition ?? '',

      buyerId:       this.batchIds.buyerId       ?? 0,
      jobId:         this.batchIds.jobId         ?? 0,
      styleId:       this.batchIds.styleId       ?? 0,
      orderId:       this.batchIds.orderId       ?? 0,
      fabricationId: this.batchIds.fabricationId ?? 0,
      colorId:       this.batchIds.colorId       ?? null,
      dressPartId:   this.batchIds.dressPartId   ?? null,
      uomId:         this.batchIds.uomId         ?? null,
      iszId:         this.batchIds.iszid         ?? null,

      // ✅ processList holds array of IDs (numbers) — join directly
      processIds:    (this.Model.processList || []).join(','),

      // ✅ machineList holds objects {label, value} — map to value then join
      machineIds:    (this.Model.machineList || []).map((x: any) =>
                       typeof x === 'object' ? x.value : x
                     ).join(','),

      totalPcs:      safeTotalPcs,
      totalKg:       safeTotalKg,
      IsManualTotal: !!this.isTotalEditable,
      shade:         this.Model.shade ? 1 : 0
    };

    /* ===== SIZE DETAILS ===== */
    let sizeDetails: any[] = this.sizeQty?.map(x => ({
  sizeId: x.sizeId ?? null,
  size:   x.size   ?? '',
  qty:    Number(x.pcs) || 0,
  kg:     Number(x.kg)  || 0
})) ?? [];
    // let sizeDetails: any[] = [];
    // if (!this.isTotalEditable && this.sizeQty?.length) {
    //   sizeDetails = this.sizeQty.map(x => ({
    //     sizeId: x.sizeId ?? null,
    //     size:   x.size   ?? '',
    //     qty:    Number(x.pcs) || 0,
    //     kg:     Number(x.kg)  || 0
    //   }));
    // }

    const payload = { master, sizeDetails };
    console.log('✅ FINAL PAYLOAD:', payload);

    /* ===== API CALL ===== */
    this.service.SaveWashPrepare(payload).subscribe({
      next: (res: any) => {
        console.log('✅ RESPONSE:', res);
        if (res?.succeeded) {
          this.toastr.success('Saved successfully');
          this.batch.AutoBatchNo = res.message;
          this.printReport('Batch Card Preview', res.message);
        } else {
          this.toastr.error(res?.errors?.[0] || 'Save failed');
        }
      },
      error: (err: any) => {
        console.error('❌ ERROR:', err);
        if (err?.error?.errors) {
          this.toastr.error(Object.values(err.error.errors)[0] as any);
        } else {
          this.toastr.error(err?.error?.message || err?.message || 'Server error');
        }
      },
      complete: () => console.log('✅ API CALL COMPLETED')
    });

    this.clearAll();
  }

  /* ===================== PRINT ===================== */
  ReportUrlTab: any;
  printReport(ReportType: string, GenerateNumber: string): void {
    this.isLoading = true;
    const token    = localStorage.getItem('token');
    const headers  = { Authorization: `Bearer ${token}` };

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
            console.error('No URL returned from backend.');
          }
        },
        error: (error) => {
          console.error('Report error:', error);
          this.toastr.warning(error.error);
          this.isLoading = false;
        }
      });
  }
}

function getFormattedDate(arg0: any): any {
  throw new Error('Function not implemented.');
}
               