import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { Router } from '@angular/router';
import { de, is, th } from 'date-fns/locale';
import { T } from '@angular/cdk/keycodes';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { environment } from 'src/environments/environment';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
@Component({
  selector: 'app-wash-prepare-action',
  templateUrl: './wash-prepare-action.component.html',
  styleUrls: ['./wash-prepare-action.component.scss']
})
export class WashPrepareActionComponent implements OnInit {
 isLoading:any = false;

  //  toppings = new FormControl('');
  // toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

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
    buyer: '',
    jobNo: '',
    styleNo: '',
    orderNo: '',
    process: '',
    batchNo: '',
    documentNo: '',
    effectiveDate: new Date(),
    revisionDate: '',
    revisionNo: '',
    date: '',
    fabrication: '',
    composition: '',
    gsm: '',
    color: '',
    type: '',
    trackingNo: '',
    AutoBatchNo: ''
  };


  // ======= ID STORAGE FOR SAVE =========
  batchIds: any = {};

  saveButtonTitle = 'Save';
  machineRows = new Array(6);

  sizeQty: { sizeId?: number | null; size: string; pcs: number; kg: number }[] = [];

  totalPcs = 0;
  totalKg;
   bsConfig: Partial<BsDatepickerConfig>;
   ReportUrl:SafeResourceUrl;
   public _dom22:any|string;
   baseUrl = environment.apiUrl;
   baseUrl_ = this.baseUrl.replace(/[?&]$/, '');
  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router,
    private _dom: DomSanitizer,
    private http: HttpClient,
    private route: Router,
     private cdr: ChangeDetectorRef
  )
     {
       this.bsConfig = { dateInputFormat: 'DD-MMM-YYYY' };
       this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl("");
      
   }

  ngOnInit(): void {
    debugger;
    this.loadProcessDDL();
    // this.loadMachineDDL(); // ✅ initially true
  this.loadDataFromParent();   

  }

onSelectionChangeProcess(event: MatSelectChange) {
  debugger;

  const selectedIds: number[] = event.value || [];

  // ✅ store only IDs
  this.Model.processList = selectedIds;

  console.log('Process IDs ARRAY:', selectedIds);

  if (selectedIds.length === 0) {
    this.machineList = [];
    this.Model.machineList = [];
    return;
  }

  // ✅ convert to comma-separated string
  const processIds = selectedIds.join(',');

  console.log('Process IDs STRING:', processIds);

  this.service.GetMachineByProcess(processIds).subscribe({
    next: (res: any) => {
      debugger;

      // ✅ normalize response
      const data = Array.isArray(res) ? res : res?.data || res?.result || [];

      console.log('Machine API Data:', data);

      // ✅ simple mapping (NO Map needed unless duplicate exists)
      this.machineList = data.map((x: any) => ({
        label: x.displayName ?? x.DisplayName ?? x.machineName ?? x.MachineName,
        value: x.id ?? x.ID ?? x.machineDetailId ?? x.MachineDetailId
      }));

      // ✅ reset selected machines
      this.Model.machineList = [];

      // ✅ force UI update (if needed)
      this.cdr.detectChanges();
    },

    error: (err: any) => {
      console.error('API ERROR:', err);
      this.machineList = [];
      this.Model.machineList = [];
    }
  });
}
onlyNumber(event: any) {
  const input = event.target.value;

  // ✅ allow only digits
  const cleanValue = input.replace(/[^0-9]/g, '');

  event.target.value = cleanValue;
  this.totalPcs = cleanValue ? Number(cleanValue) : 0;
}
Number(event: any) {
  const input = event.target.value;

  // ✅ allow only digits
  const cleanValue = input.replace(/[^0-9]/g, '');

  event.target.value = cleanValue;
  this.totalKg = cleanValue ? Number(cleanValue) : 0;
}
initialTotalPcs: number = 0; // ✅ DB value


isTotalEditable: boolean = false;
onToggleTotalEdit() {
debugger;

  if (this.isTotalEditable) {
    // ✅ when checked → show blank (null)
    this.totalKg = null;
  }

}

  loadProcessDDL() {
    debugger;
  
    this.service.GetProcessNameDDL().subscribe(res => {
      this.processList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id ?? x.ID
      }));
    });
    console.log('Process List:', this.processList);
  }

  loadMachineDDL() {
    this.service.GetMachineNoDDL().subscribe(res => {
      this.machineList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id ?? x.ID
      }));
    });
  }

  /* ================= PROCESS ================= */
  // onSelectionChangeProcess(event: any) {
  //   this.Model.processList = this.Model.processList?.filter((x: any) => x !== null);
  // }

  toggleAllSelectionProcess() {
    this.allSelectedProcess = !this.allSelectedProcess;
    this.Model.processList = this.allSelectedProcess ? [...this.processList] : [];
  }

  isAllSelectedProcess(): boolean {
    return this.Model.processList?.length === this.processList.length;
  }

  /* ================= MACHINE ================= */
  onSelectionChangeMachine(event: any) {
    this.Model.machineList = this.Model.machineList?.filter((x: any) => x !== null);
  }

  toggleAllSelectionMachine() {
    this.allSelectedMachine = !this.allSelectedMachine;
    this.Model.machineList = this.allSelectedMachine ? [...this.machineList] : [];
  }

  isAllSelectedMachine(): boolean {
    return this.Model.machineList?.length === this.machineList.length;
  }

  /* ================= UI FOCUS ================= */
  setFocus(field: string) {
    this.currentFocus = field;
  }

  clearFocus() {
    this.currentFocus = null;
  }
showSizeDetails: boolean = true;
applyToAll: boolean = false;
remainingPcs: number = 0;
toggleSizeView() {
  this.showSizeDetails = !this.showSizeDetails;
}

applyFirstValueToAll() {
  if (!this.sizeQty.length) return;

  const firstValue = this.sizeQty[0].pcs;

  this.sizeQty.forEach(x => {
    x.pcs = firstValue;
  });

  this.calculateTotals();
  this.calculateTotalsKG();
}
  private loadDataFromParent(): void {
debugger;
    const navState = localStorage.getItem('WASH_PREPARE_NAV_STATE');

    if (!navState) {
      console.error('❌ No navigation state found');
      return;
    }
   
    const data = JSON.parse(navState);
    console.log('✅ Loaded Navigation State:', data);
     const today = new Date();
   // ✅ DIRECT TOTAL FROM DB (NO SIZE DEPENDENCY)
  this.totalPcs = data.totalQty ?? 0;
 this.remainingPcs = data.remainingQty;

  // ✅ STORE ORIGINAL VALUE (VERY IMPORTANT)
this.initialTotalPcs = this.totalPcs ?? 0;
this.MasterId = data.MasterId ?? 0;





    /* ================= STORE IDS (FOR SAVE) ================= */
    this.batchIds = {
      buyerId: data.buyerId ?? null,
      jobId: data.jobId ?? null,
      styleId: data.styleId ?? null,
      orderId: data.orderId ?? null,
      fabricationId: data.fabricationId ?? null,
      colorId: data.colorId ?? null,
      dressPartId: data.dressPartId ?? null,
      uomId: data.uomId ?? null,
      fromUnitId: data.fromUnitId ?? null,
      iszid: data.iszid ?? null
    };

    /* ================= HEADER DISPLAY ================= */
    this.batch.buyer = data.buyer ?? '';
    this.batch.jobNo = data.jobNo ?? '';
    this.batch.styleNo = data.styleNo ?? '';
    this.batch.orderNo = data.orderNo ?? '';
    this.batch.documentNo = 'CKL-Wash-024';
    this.batch.effectiveDate = new Date();
    this.batch.revisionDate = data.revisionDate ?? '';
    this.batch.revisionNo = data.revisionNo ?? '';
    this.batch.date = data.date ?? '';
    this.batch.fabrication = data.fabrication ?? '';
    this.batch.composition = data.composition ?? '';
    this.batch.color = data.color ?? '';
    this.batch.gsm = data.gsm ?? '';
    this.batch.type = data.type ?? '';
    this.batch.trackingNo = data.trackingNo ?? '';
    this.batch.batchNo = data.batchNo ?? '';
    this.batch.AutoBatchNo = data.AutoBatchNo ?? '';
    this.totalKg = data.totalKg ?? 0;
    /* ================= SIZE DETAILS (MERGE + ID) ================= */
    this.showSizeDetails = false; // ✅ default hidden
    if (Array.isArray(data.sizeDetails)) {

      const sizeMap = new Map<string, any>();

      data.sizeDetails.forEach((x: any) => {
        const key = x.sizeId ?? x.size;

        if (sizeMap.has(key)) {
          sizeMap.get(key).pcs += +x.qty || +x.pcs;
        } else {
          sizeMap.set(key, {
            sizeId: x.sizeId ?? null,
            size: x.size,
            pcs: +x.qty || +x.pcs,
            kg: +x.kg 
          });
        }
      });
console.log('✅ Merged Size Map:', sizeMap);
      this.sizeQty = Array.from(sizeMap.values());
      // this.calculateTotals();
      

      // ✅ KEY LOGIC
  if (this.batch.AutoBatchNo && this.batch.AutoBatchNo.trim() !== '') {
    this.saveButtonTitle = 'Update';
  } else {
    this.saveButtonTitle = 'Save';
  }
    }
  }

  calculateTotals(): void {
    this.totalPcs = this.sizeQty.reduce((s, x) => s + (+x.pcs || 0), 0);
    // this.totalKg = this.sizeQty.reduce((s, x) => s + (+x.kg|| ''), '');

  }
calculateTotalsKG(): void {
  this.totalKg = this.sizeQty.reduce((sum, x) => sum + (+x.kg || 0), 0);
}

clearAll(): void {

  // ================= MODEL =================
  this.Model = {
    processList: [],
    machineList: [],
    shade: true
  };

  // ================= BATCH INFO =================
  this.batch = {
    buyer: '',
    jobNo: '',
    styleNo: '',
    orderNo: '',
    process: '',
    batchNo: '',
    documentNo: '',
    effectiveDate: new Date(),
    revisionDate: '',
    revisionNo: '',
    date: '',
    fabrication: '',
    composition: '',
    gsm: '',
    color: '',
    type: '',
    trackingNo: '',
    AutoBatchNo: ''
    
  };

  // ================= IDS =================
  this.batchIds = {};

  // ================= SIZE GRID =================
  this.sizeQty = [];

  // ================= TOTALS =================
  this.totalPcs = 0;
  this.totalKg = 0;
  this.initialTotalPcs = 0;
  this.remainingPcs = 0;

  // ================= FLAGS =================
  this.isTotalEditable = false;
  this.showSizeDetails = true;
  this.allSelectedProcess = false;
  this.allSelectedMachine = false;

  // Optional UI state reset
  this.currentFocus = null;
}

onTotalPcsChange() {

  // handle empty / null / 0
  if (!this.totalPcs) {
    this.totalPcs = this.initialTotalPcs;
    return;
  }

  // ❌ exceed check
  if (this.totalPcs > this.initialTotalPcs) {

    this.toastr.warning(
      `Max allowed: ${this.initialTotalPcs}`,
      'Invalid Total Pcs'
    );

    // ✅ revert to original (NOT 0)
    this.totalPcs = this.initialTotalPcs;
  }
}
onTotalKgChange() {

 
}
onSubmit(): void {
  debugger;

  /* ================= VALIDATION ================= */
  if (!this.Model.processList?.length) {
    this.toastr.warning('Please select process');
    return;
  }

  if (!this.Model.machineList?.length) {
    this.toastr.warning('Please select machine');
    return;
  }

  /* ================= SAFE VALUES ================= */
  const safeTotalPcs = Number(this.totalPcs) || 0;
  const safeTotalKg = Number(this.totalKg) || 0;

  /* ================= DATE FORMAT FIX ================= */
  const formatDate = (date: any) => {
    return date ? new Date(date).toISOString() : null;
  };

  /* ================= MASTER ================= */
  const master = {
  
    operation: "INSERT",
    createdBy: "SYSTEM",
    masterId: this.MasterId ?? 0,

    unitId: this.batchIds.fromUnitId,
    trackingNo: this.batch.trackingNo ?? '',

    batchNo: this.batch.batchNo ?? '',
    type: this.batch.type ?? '',
    documentNo: this.batch.documentNo = 'CKL-Wash-024',

    effectiveDate: formatDate(this.batch.effectiveDate),
    revisionDate: formatDate(this.batch.revisionDate),
    revisionNo: this.batch.revisionNo ?? '',
    date: formatDate(this.batch.date),

    composition: this.batch.composition ?? '',

    buyerId: this.batchIds.buyerId ?? 0,
    jobId: this.batchIds.jobId ?? 0,
    styleId: this.batchIds.styleId ?? 0,
    orderId: this.batchIds.orderId ?? 0,
    fabricationId: this.batchIds.fabricationId ?? 0,
    colorId: this.batchIds.colorId ?? null,
    dressPartId: this.batchIds.dressPartId ?? null,
    uomId: this.batchIds.uomId ?? null,
    iszId: this.batchIds.iszid ?? null,
    processIds: (this.Model.processList || []).join(','),
    // processIds: (this.Model.processList || []).map((x: any) => x.value).join(','),
    machineIds: (this.Model.machineList || []).map((x: any) => x.value).join(','),

    totalPcs: safeTotalPcs,
    totalKg: safeTotalKg,

    IsManualTotal: !!this.isTotalEditable,
  shade: this.Model.shade ? 1 : 0
  };

  /* ================= SIZE DETAILS ================= */
  let sizeDetails: any[] = [];

  if (!this.isTotalEditable && this.sizeQty?.length) {
    sizeDetails = this.sizeQty.map(x => ({
      sizeId: x.sizeId ?? null,
      size: x.size ?? '',
      qty: Number(x.pcs) || 0,
      kg: Number(x.kg) || 0
    }));
  }

  /* ================= FINAL PAYLOAD ================= */
  const payload = {
    master: master,
    sizeDetails: sizeDetails // ✅ ALWAYS ARRAY (NEVER NULL)
  };

  console.log('✅ FINAL PAYLOAD:', payload);

  /* ================= API CALL ================= */
  this.service.SaveWashPrepare(payload).subscribe({

    next: (res: any) => {
      console.log("✅ RESPONSE:", res);

      if (res?.succeeded) {
        this.toastr.success('Saved successfully');

        this.batch.AutoBatchNo = res.message;

        this.printReport("Batch Card Preview", res.message);
      } else {
        this.toastr.error(res?.errors?.[0] || 'Save failed');
      }
    },

    error: (err: any) => {
      console.error('❌ ERROR:', err);

      // 🔥 SHOW BACKEND VALIDATION ERROR
      if (err?.error?.errors) {
        const firstError = Object.values(err.error.errors)[0];
        this.toastr.error(firstError as any);
      } else {
        this.toastr.error(
          err?.error?.message ||
          err?.message ||
          'Server error / Controller not hit'
        );
      }
    },

    complete: () => {
      console.log('✅ API CALL COMPLETED');
    }
  });
  this.clearAll();
}
// onSubmit(): void {
//   debugger;

//   /* ================= VALIDATION ================= */
//   if (!this.Model.processList?.length) {
//     this.toastr.warning('Please select process');
//     return;
//   }

//   if (!this.Model.machineList?.length) {
//     this.toastr.warning('Please select machine');
//     return;
//   }

//   /* ================= BUILD PAYLOAD ================= */
//   const payload: any = {
//     master: {
//       operation: "INSERT",
//       createdBy: "SYSTEM",
//       masterId: 0,
//       unitId: this.batchIds.fromUnitId,
//       trackingNo: this.batch.trackingNo ?? '',

//       batchNo: this.batch.batchNo,
//       documentNo: this.batch.documentNo,
//       effectiveDate: this.batch.effectiveDate,
//       revisionDate: this.batch.revisionDate,
//       revisionNo: this.batch.revisionNo,
//       date: this.batch.date,
//       composition: this.batch.composition,
//       Type: this.batch.type,

//       buyerId: this.batchIds.buyerId,
//       jobId: this.batchIds.jobId,
//       styleId: this.batchIds.styleId,
//       orderId: this.batchIds.orderId,
//       fabricationId: this.batchIds.fabricationId,
//       colorId: this.batchIds.colorId,
//       dressPartId: this.batchIds.dressPartId,
//       uomId: this.batchIds.uomId,
//       iszId: this.batchIds.iszid,

//       processIds: this.Model.processList.map((x: any) => x.value).join(','),
//       machineIds: this.Model.machineList.map((x: any) => x.value).join(','),

//       totalPcs: this.totalPcs,
//       totalKg: this.totalKg,

//       shade: this.Model.shade ? 1 : 0,
//       IsManualTotal: this.isTotalEditable ? 1 : 0
      
//     }
//   };

//   /* ================= CONDITION FOR SIZE DETAILS ================= */
//   if (!this.isTotalEditable) {
//     payload.sizeDetails = this.sizeQty.map(x => ({
//       sizeId: x.sizeId ?? null,
//       size: x.size,
//       qty: Number(x.pcs),
//       kg: Number(x.kg)
//     }));
//   }

//   console.log('✅ SAVE PAYLOAD:', payload);

//   /* ================= API CALL ================= */
//   this.service.SaveWashPrepare(payload).subscribe({
//     next: (res: any) => {
//       debugger;

//       console.log("Full Response:", res);

//       if (res && res.succeeded === true) {

//         this.toastr.success('Saved successfully');

//         this.batch.AutoBatchNo = res.message;

//         this.printReport("Batch Card Preview", res.message);

//       } else {
//         this.toastr.warning(res?.errors?.length ? res.errors[0] : 'Save failed');
//       }
//     },

  
//   });
// }
// onShadeChange() {
//   this.Model.shade = this.Model.shade ? 1 : 0;
// }

onShadeChange(event: any) {
  this.Model.shade = event.target.checked ? 1 : 0;
}
  ReportUrlTab:any;
  printReport(ReportType,GenerateNumber)
  {
    debugger;
      this.isLoading=true;
      const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    console.log("headers",headers);
       var objparam = {
         ReportName: "Batch Card Preview",
         Type: "PDF",
         GenerateNumber: GenerateNumber,
         //FromDate: "",
         //ToDate:""

       }
      const queryParams = new URLSearchParams(objparam as any).toString();
 
 
      this.http.post<any>(`${this.baseUrl_}Report/ShowReport`, objparam, { headers }).subscribe(
       (response) => {
         if (response && response.url) {
         
          
           this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl(response.url);
          //if(ReportType==="PDF"){
             this.isLoading=false;
           window.open(
             this.route.serializeUrl(
               this.route.createUrlTree(['/mascowash/report-view'], {
                  queryParams: { 
                  url: response.url, 
                  TrackingNo: GenerateNumber,
                 
    
       }
               })
             ),
             '_blank'
           );
         //}
           //this.route.navigate(['/report-view'], { queryParams: { url: response.url } });
         } else {
          this.isLoading=false;
           console.error('No URL returned from the backend.');
         }
       },
       (error) => {
         console.error('Error fetching the report URL:', error);
          this.toastr.warning(error.error);
         this.isLoading=false;
       }
       );
       
  }

  
}