import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SizeQuantityComponent } from '../../../../advanced-ui/modals/size-quantity/size-quantity.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { de } from 'date-fns/locale';

/* ===================== INTERFACES ===================== */
interface DropdownItem {
  label: string;
  value: number | string;
}

interface SizeDetail {
  sizeId?: number | null;
  size: string;
  qty: number;
  kg: number;
}

interface WashBatchRow {
  masterId:     number;
  trackingNo:   string;
  batchNo:      string;
  documentNo:   string;
  loadunload:   string;

  buyerId:      number;
  buyerName:    string;

  jobId:        number;
  jobInfo:      string;

  styleId:      number;
  styleName:    string;

  orderId:      number;
  orderNo:      string;

  type:         string;
  shade:        any;

  // ✅ SP returns MasterTotalPcs / MasterTotalKg
  totalPcs:     number;
  totalKg:      number;

  processIds:   string;
  machineIds:   string;

  fabricationId:   number;
  fabricationName: string;

  icleid:       number;
  color:        string;

  dressPartId:  number;
  dressPart:    string;

  uomDetailsId: number;
  uom:          string;

  gsmId:        number;
  gsm:          string;

  fromUnitId:   number;
  fromUnitName: string;

  alreadyPreparedQty: number;
  alreadyPreparedKg:  number;
  remainingQty:       number;
  remainingKg:        number;
  sizeTotalQty:       number;
  sizeTotalKg:        number;

  shipmentDate:         Date | null;
  probableDeliveryDate: Date | null;
  sourceTable:          string;
  qty:                  number; // for size popup binding
  kg:                   number; // for size popup binding
  sizeDetails: SizeDetail[];
  revesionNo?: number | null; 
  revisionDate?: Date | null;


  // ✅ Computed from sizeDetails sum (or masterTotalPcs if no sizes)
  totalQty: number;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    SizeQuantityComponent,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule,
    CardModule
  ],
  selector: 'app-batch-card-modification',
  templateUrl: './batch-card-modification.component.html',
  styleUrls: ['./batch-card-modification.component.scss']
})
export class BatchCardModificationComponent implements OnInit {

  /* ===================== FILTER MODEL ===================== */
  Model = {
    UnitId:  null as number | null,
    BuyerId: null as number | null,
    JobId:   null as number | null,
    StyleId: null as number | null,
    OrderId: null as number | null
  };

  /* ===================== GRID ===================== */
  detailList: WashBatchRow[] = [];
  UnitList:   any[]          = [];

  /* ===================== DROPDOWNS ===================== */
  buyerList:       DropdownItem[] = [];
  jobList:         DropdownItem[] = [];
  styleList:       DropdownItem[] = [];
  orderList:       DropdownItem[] = [];
  fabricationList: DropdownItem[] = [];
  colorList:       DropdownItem[] = [];
  dressPartList:   DropdownItem[] = [];
  uomList:         DropdownItem[] = [];

  /* ===================== SIZE POPUP ===================== */
  sizePopupVisible = false;
  selectedRow!:    WashBatchRow;
  sizeList:        SizeDetail[] = [];
  totalSizeQty     = 0;

  /* ===================== PRINT / REPORT ===================== */
  isLoading = false;
  ReportUrl: SafeResourceUrl;
  baseUrl  = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  constructor(
    private service: WashSetupService,
    private toastr:  ToastrService,
    private router:  Router,
    private http:    HttpClient,
    private _dom:    DomSanitizer
  ) {
    this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl('');
  }

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    this.loadUnits();
  }

  /* ===================== LOAD UNIT ===================== */
  loadUnits(): void {
    this.service.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID         ?? x.id
      }));

      const found = this.UnitList.find(x => x.value === 60);
      if (found) {
        this.Model.UnitId = found.value;
        this.onUnitChange();
      }
    });
  }

  /* ===================== UNIT CHANGE ===================== */
  onUnitChange(): void {
    if (!this.Model.UnitId) return;

    this.service.GetBuyerNameDDL().subscribe(res => {
      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.BuyerName,
        value: x.ID          ?? x.id          ?? x.BuyerNo
      }));

      if (this.buyerList.length === 1) {
        this.Model.BuyerId = Number(this.buyerList[0].value);
        this.onBuyerChange();
      }
    });
  }

  /* ===================== BUYER CHANGE ===================== */
  onBuyerChange(): void {
    this.jobList   = [];
    this.styleList = [];
    this.orderList = [];
    this.Model.JobId   = null;
    this.Model.StyleId = null;
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId) return;

    this.service.GetJobNoWithParameterDDL({
      unitId:  this.Model.UnitId,
      buyerId: this.Model.BuyerId
    }).subscribe(res => {
      this.jobList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.jobInfo,
        value: x.ID          ?? x.id          ?? x.JobId
      }));

      if (this.jobList.length === 1) {
        this.Model.JobId = Number(this.jobList[0].value);
        this.onJobChange();
      }
    });
  }

  /* ===================== JOB CHANGE ===================== */
  onJobChange(): void {
    this.styleList = [];
    this.orderList = [];
    this.Model.StyleId = null;
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId) return;

    this.service.GetStyleNoWithParameterDDL({
      unitId:  this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId:   this.Model.JobId
    }).subscribe(res => {
      this.styleList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID          ?? x.id ?? x.StyleId
      }));

      if (this.styleList.length === 1) {
        this.Model.StyleId = Number(this.styleList[0].value);
        this.onStyleChange();
      }
    });
  }

  /* ===================== STYLE CHANGE ===================== */
  onStyleChange(): void {
    this.orderList = [];
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId || !this.Model.StyleId) return;

    this.service.GetOrderNoWithParameterDDL({
      unitId:  this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId:   this.Model.JobId,
      styleId: this.Model.StyleId
    }).subscribe(res => {
      this.orderList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID          ?? x.id ?? x.OrderId
      }));

      if (this.orderList.length === 1) {
        this.Model.OrderId = Number(this.orderList[0].value);
      }
    });
  }

  /* ===================== SEARCH ===================== */
  onSearch(): void {
    if (!this.Model.UnitId  || !this.Model.BuyerId ||
        !this.Model.JobId   || !this.Model.StyleId  || !this.Model.OrderId) {
      this.toastr.warning('Please select all fields before searching');
      return;
    }

    const params = {
      unitId:  this.Model.UnitId,
      buyerId: this.Model.BuyerId,
      jobId:   this.Model.JobId,
      styleId: this.Model.StyleId,
      orderId: this.Model.OrderId
    };

    this.service.getWashBatchPrepareGridEdit(params).subscribe({
      next: (res: any[]) => {
        console.log('✅ Edit Grid Response:', res);
        this.bindDetailRows(res);
debugger;
        this.Model.BuyerId = null;
        this.Model.JobId   = null;
        this.Model.StyleId = null;
        this.Model.OrderId = null;
        this.loadUnits();
      },
      error: (err) => {
        console.error('❌ Edit Grid Error:', err);
        this.toastr.error('Failed to load grid data');
      }
    });
  }

  /* ===================== BIND GRID ===================== */
  bindDetailRows(rows: any[]): void {
    debugger;
    const map = new Map<string, WashBatchRow>();

    rows.forEach(r => {

      // ✅ SP returns AutoBatchNo as BatchNo — use masterId as safest unique key
      const key = String(r.masterId ?? r.MasterId ?? r.batchNo ?? r.BatchNo ?? r.autoBatchNo ?? r.AutoBatchNo ?? '');

      if (!map.has(key)) {
        map.set(key, {
          masterId:    r.masterId    ?? r.MasterId    ?? 0,
          trackingNo:  r.trackingNo  ?? r.TrackingNo  ?? '',
          batchNo:     r.batchNo     ?? r.BatchNo     ?? r.autoBatchNo ?? r.AutoBatchNo ?? '',
          loadunload:  r.loadUnload  ?? r.LoadUnload  ?? r.loadunload  ?? '',
          documentNo:  r.documentNo  ?? r.DocumentNo  ?? '',

          buyerId:     r.buyerId     ?? r.BuyerId     ?? 0,
          buyerName:   r.buyerName   ?? r.BuyerName   ?? '',

          jobId:       r.jobId       ?? r.JobId       ?? 0,
          jobInfo:     r.jobInfo     ?? r.JobInfo      ?? '',

          styleId:     r.styleId     ?? r.StyleId     ?? 0,
          styleName:   r.styleName   ?? r.StyleName   ?? '',

          orderId:     r.orderId     ?? r.OrderId     ?? 0,
          orderNo:     r.orderNo     ?? r.OrderNo     ?? '',

          type:        r.type        ?? r.Type        ?? '',
          shade:       r.shade       ?? r.Shade       ?? false,

          // ✅ SP column names: MasterTotalPcs / MasterTotalKg
          totalPcs:    r.masterTotalPcs ?? r.MasterTotalPcs ?? r.totalPcs ?? r.TotalPcs ?? 0,
          totalKg:     r.masterTotalKg  ?? r.MasterTotalKg  ?? r.totalKg  ?? r.TotalKg  ?? 0,

          // ✅ Comma-separated strings from SP
          processIds:  r.processIds  ?? r.ProcessIds  ?? '',
          machineIds:  r.machineIds  ?? r.MachineIds  ?? '',

          fabricationId:   r.fabricationId   ?? r.FabricationId   ?? 0,
          fabricationName: r.fabricationName ?? r.FabricationName ?? '',

          icleid:      r.icleid      ?? r.ICLEID      ?? 0,
          color:       r.color       ?? r.Color       ?? '',

          dressPartId: r.dressPartId ?? r.DressPartId ?? 0,
          dressPart:   r.dressPart   ?? r.DressPart   ?? '',

          uomDetailsId: r.uomDetailsId ?? r.UOMDetailsId ?? 0,
          uom:          r.uom          ?? r.UOM          ?? '',

          gsmId: r.gsmId ?? r.GsmId ?? 0,
          gsm:   r.gsm   ?? r.GSM   ?? '',

          fromUnitId:   r.fromUnitId   ?? r.FromUnitId   ?? 0,
          fromUnitName: r.fromUnitName ?? r.FromUnitName ?? '',

          alreadyPreparedQty: r.alreadyPreparedQty ?? r.AlreadyPreparedQty ?? 0,
          alreadyPreparedKg:  r.alreadyPreparedKg  ?? r.AlreadyPreparedKg  ?? 0,
          remainingQty:       r.remainingQty       ?? r.RemainingQty       ?? 0,
          remainingKg:        r.remainingKg        ?? r.RemainingKg        ?? 0,
          sizeTotalQty:       r.sizeTotalQty       ?? r.SizeTotalQty       ?? 0,
          sizeTotalKg:        r.sizeTotalKg        ?? r.SizeTotalKg        ?? 0,

          shipmentDate:         r.shipmentDate         ? new Date(r.shipmentDate)         : null,
          probableDeliveryDate: r.probableDeliveryDate ? new Date(r.probableDeliveryDate) : null,
          sourceTable:          r.sourceTable          ?? r.SourceTable          ?? '',
          sizeDetails: [],
          qty: Number(r.qty ?? r.Qty ?? 0), // for size popup binding
          kg: Number(r.kg ?? r.Kg ?? 0), // for size popup binding

          totalQty: Number(r.totalQty ?? r.TotalQty ?? r.masterTotalPcs ?? r.MasterTotalPcs ?? 0),
          revesionNo: r.revesionNo ?? r.revisionNo ?? 0, 
          revisionDate: r.revisionDate   ? new Date(r.shipmentDate)         : null,
         // will be accumulated below
        });
      }

      const row = map.get(key)!;

      // ✅ SP returns ISZID for size — check all casing variants
      const sizeId = r.iszid ?? r.ISZID ?? r.sizeId ?? r.SizeId ?? null;
      const qty    = Number(r.qty ?? r.Qty ?? 0);
      const kg     = Number(r.kg  ?? r.Kg  ?? 0);
      const size   = r.size ?? r.Size ?? '';

      if (sizeId != null) {
        // ✅ Size-wise row: push into sizeDetails and accumulate totalQty
        row.sizeDetails.push({ sizeId, size, qty, kg });
        //row.totalQty += qty + row.remainingQty;
      }
    });

    // ✅ If no size rows came, fall back to masterTotalPcs
    Array.from(map.values()).forEach(row => {
      if (row.sizeDetails.length === 0) {
        row.totalQty = row.totalQty || 0;
      }
    });

    this.detailList = Array.from(map.values());

    // ✅ Populate all dropdowns from bound data
    this.buyerList       = this.unique(this.detailList, 'buyerId',       'buyerName');
    this.jobList         = this.unique(this.detailList, 'jobId',         'jobInfo');
    this.styleList       = this.unique(this.detailList, 'styleId',       'styleName');
    this.orderList       = this.unique(this.detailList, 'orderId',       'orderNo');
    this.fabricationList = this.unique(this.detailList, 'fabricationId', 'fabricationName');
    this.colorList       = this.unique(this.detailList, 'icleid',        'color');
    this.dressPartList   = this.unique(this.detailList, 'dressPartId',   'dressPart');
    this.uomList         = this.unique(this.detailList, 'uomDetailsId',  'uom');

    console.log('✅ Bound Detail List:', this.detailList);
  }

  /* ===================== UNIQUE HELPER ===================== */
  unique(arr: any[], value: string, label: string): DropdownItem[] {
    const map = new Map<any, DropdownItem>();
    arr.forEach(x => {
      if (x[value] != null) {
        map.set(x[value], { value: x[value], label: x[label] ?? '' });
      }
    });
    return Array.from(map.values());
  }

  /* ===================== SIZE POPUP ===================== */
  openSizePopup(row: WashBatchRow): void {
    this.selectedRow = row;

    if (row.sizeDetails && row.sizeDetails.length > 0) {
      // ✅ Size-wise data exists: group by sizeId (deduplicate if needed)
      const grouped = new Map<any, SizeDetail>();
      row.sizeDetails.forEach(item => {
        const id = item.sizeId ?? item.size;
        if (!grouped.has(id)) {
          grouped.set(id, {
            sizeId: item.sizeId,
            size:   item.size,
            qty:    Number(item.qty || 0),
            kg:     Number((item as any).kg || 0)
          });
        } else {
          grouped.get(id)!.qty += Number(item.qty || 0);
        }
      });
      this.sizeList = Array.from(grouped.values());

    } else {
      // ✅ No size data: show single row with master total
      this.sizeList = [{
        sizeId: null,
        size:   'Total',
        qty:    row.totalQty ?? row.totalPcs ?? 0,
        kg:     row.totalKg ?? 0
      }];
    }

    this.calculateTotal();
    this.sizePopupVisible = true;
  }

  calculateTotal(): void {
    this.totalSizeQty = this.sizeList.reduce((s, x) => s + (+x.qty || 0), 0);
  }

  confirmSizeQty(): void {
    this.selectedRow.totalQty    = this.totalSizeQty;
    this.selectedRow.sizeDetails = [...this.sizeList];
    this.sizePopupVisible        = false;
  }

  /* ===================== PRINT ===================== */
  onPrint(row: WashBatchRow): void {
    if (!row.batchNo) {
      this.toastr.warning('No Batch No available to print.');
      return;
    }
    this.printReport('Batch Card Preview', row.batchNo);
  }

  printReport(reportType: string, batchNo: string): void {
    this.isLoading = true;

    const token   = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const objparam = {
      ReportName:     'Batch Card Preview',
      Type:           'PDF',
      GenerateNumber: batchNo
    };

    this.http.post<any>(`${this.baseUrl_}Report/ShowReport`, objparam, { headers })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.url) {
            this.ReportUrl = this._dom.bypassSecurityTrustResourceUrl(response.url);
            window.open(
              this.router.serializeUrl(
                this.router.createUrlTree(['/mascowash/report-view'], {
                  queryParams: { url: response.url, TrackingNo: batchNo }
                })
              ),
              '_blank'
            );
          } else {
            console.error('No URL returned from backend.');
          }
        },
        error: (err) => {
          console.error('Report error:', err);
          this.toastr.warning(err?.error ?? 'Failed to load report');
          this.isLoading = false;
        }
      });
  }

  /* ===================== OPEN PREPARE TAB (EDIT MODE) ===================== */
  /* ===================== OPEN PREPARE TAB (EDIT MODE) ===================== */
// openPrepareTab(row: WashBatchRow): void {
// debugger;
// console.log('Edit button clicked for row:', row);

//   if (row.loadunload === 'Exist') {
//     this.toastr.warning('Load/Unload already exists(Start-End) for this batch.');
//     return;
//   }

//   if (!row?.orderId) return;

//   const navState = {

   
//     buyerId:      row.buyerId,       
//     jobId:        row.jobId,
//     styleId:      row.styleId,
//     orderId:      row.orderId,
//     fabricationId:row.fabricationId,
//     colorId:      row.icleid,        
//     dressPartId:  row.dressPartId,
//     uomId:        row.uomDetailsId,   
//     fromUnitId:   row.fromUnitId,
//     iszid:        row.gsmId ?? null, 


//     buyer:        row.buyerName      ?? '',
//     jobNo:        row.jobInfo        ?? '',
//     styleNo:      row.styleName      ?? '',
//     orderNo:      row.orderNo        ?? '',
//     documentNo:   row.documentNo     ?? '',
//     fabrication:  row.fabricationName ?? '',
//     composition:  '',                  
//     color:        row.color          ?? '',
//     gsm:          row.gsm            ?? '',
//     type:         row.type           ?? '',
//     shade:        row.shade,
//     date:         new Date().toISOString().split('T')[0],  


//     trackingNo:   row.trackingNo     ?? '',
//     AutoBatchNo:  row.batchNo        ?? '',  
//     MasterId:     row.masterId       ?? 0,


//     processIds:   row.processIds     ?? '',   
//     machineIds:   row.machineIds     ?? '',   

 
//      totalKg:      row.alreadyPreparedKg        ?? 0,

   
//     RemainingQty: row.remainingQty   ?? 0,
//      totalQty: row.alreadyPreparedQty,
   
//     sizeDetails:  row.sizeDetails    ?? []    
//   };





//   console.log('✅ navState to action page (edit):', navState);
//   localStorage.setItem('WASH_PREPARE_NAV_STATE', JSON.stringify(navState));

//   const url = this.router.serializeUrl(
//     this.router.createUrlTree(['/mascowash/setup/entry/wash-prepare-action'])
//   );

//   window.open(url, '_blank', 'noopener');
//   this.resetForm();
//   this.loadUnits();
// }

// openPrepareTab(row: WashBatchRow): void {
//   debugger;
  
//   // ✅ Block if Load/Unload already exists
//   if (row.loadunload === 'Exist') {
//     this.toastr.warning('Load/Unload already exists(Start-End) for this batch.');
//     return;
//   }

//   if (!row?.orderId) return;

//   // ✅ Check the SourceTable column from SP to know if it's Acid or Wash
//   const isAcidBatch = row.sourceTable === 'Acid';

//   const navState = {
//     // ===== MASTER IDs — same keys as mother page =====
//     buyerId:      row.buyerId,
//     jobId:        row.jobId,
//     styleId:      row.styleId,
//     orderId:      row.orderId,
//     fabricationId:row.fabricationId,
//     colorId:      row.icleid,         // action page reads: data.colorId
//     dressPartId:  row.dressPartId,
//     uomId:        row.uomDetailsId,   // action page reads: data.uomId
//     fromUnitId:   row.fromUnitId,
//     iszid:        row.gsmId ?? null,  // action page reads: data.iszid → batchIds.iszid

//     // ===== DISPLAY — same keys as mother page =====
//     buyer:        row.buyerName      ?? '',
//     jobNo:        row.jobInfo        ?? '',
//     styleNo:      row.styleName      ?? '',
//     orderNo:      row.orderNo        ?? '',
//     documentNo:   row.documentNo     ?? '',
//     fabrication:  row.fabricationName ?? '',
//     composition:  '',                  // not available in edit SP — send empty
//     color:        row.color          ?? '',
//     gsm:          row.gsm            ?? '',
//     type:         row.type           ?? '',
//     shade:        row.shade,
//     date:         new Date().toISOString().split('T')[0],  // ✅ same as mother page

//     // ===== TRACKING =====
//     trackingNo:   row.trackingNo     ?? '',
//     AutoBatchNo:  row.batchNo        ?? '',   // For Acid: WBN-...(A1), For Wash: WBN-...
//     MasterId:     row.masterId       ?? 0,

//     // ===== PROCESS / MACHINE — extra for edit mode =====
//     processIds:   row.processIds     ?? '',   
//     machineIds:   row.machineIds     ?? '',   

//     // ===== QTY — same logic as mother page =====
//     totalKg:      row.alreadyPreparedKg ?? 0,
//     RemainingQty: row.remainingQty   ?? 0,
//     totalQty:     row.alreadyPreparedQty,
//     Kg:           row.kg ?? 0, // for size popup binding
//     qty:          row.qty ?? 0, // for size popup binding

//     // ===== SIZE DETAILS — same key as mother page =====
//     sizeDetails:  row.sizeDetails    ?? []    
//   };

//   console.log('✅ navState to action page (edit):', navState);
//   localStorage.setItem('WASH_PREPARE_NAV_STATE', JSON.stringify(navState));

//   // ✅ Route condition: Go to Acid page if SourceTable is 'Acid', else Wash page
//   const routeUrl = isAcidBatch 
//     ? '/mascowash/setup/entry/acid-wash-batch-prepare' 
//     : '/mascowash/setup/entry/wash-prepare-action';

//   const url = this.router.serializeUrl(
//     this.router.createUrlTree([routeUrl])
//   );

//   window.open(url, '_blank', 'noopener');
//   this.resetForm();
//   this.loadUnits();
// }

openPrepareTab(row: WashBatchRow): void {
  debugger;
  
  // ✅ Block if Load/Unload already exists
  if (row.loadunload === 'Exist') {
    this.toastr.warning('Load/Unload already exists(Start-End) for this batch.');
    return;
  }

  if (!row?.orderId) return;

  // ✅ Check the SourceTable column from SP to know if it's Acid or Wash
  const isAcidBatch = row.sourceTable === 'Acid';

  const navState = {
    // ===== MASTER IDs =====
    buyerId:       row.buyerId,
    jobId:         row.jobId,
    styleId:       row.styleId,
    orderId:       row.orderId,
    fabricationId: row.fabricationId,
    colorId:       row.icleid,           // Maps to colorId
    dressPartId:   row.dressPartId,
    uomId:         row.uomDetailsId,     // Maps to uomId
    fromUnitId:    row.fromUnitId,
    iszid:         row.gsmId ?? null,    // Maps to iszid

    // ===== DISPLAY =====
    buyer:        row.buyerName       ?? '',
    jobNo:        row.jobInfo         ?? '',
    styleNo:      row.styleName       ?? '',
    orderNo:      row.orderNo         ?? '',
    documentNo:   row.documentNo      ?? '',
    fabrication:  row.fabricationName ?? '',
    composition:  '',                  // Not available in SP
    color:        row.color           ?? '',
    gsm:          row.gsm             ?? '',
    type:         row.type            ?? '',
    shade:        row.shade,
    date:         new Date().toISOString().split('T')[0],  

    // ===== TRACKING =====
    trackingNo:   row.trackingNo      ?? '',
    AutoBatchNo:  row.batchNo         ?? '',   // For Acid: WBN-...(A1), For Wash: WBN-...
    MasterId:     row.masterId        ?? 0,

    // ===== PROCESS / MACHINE =====
    processIds:   row.processIds      ?? '',   
    machineIds:   row.machineIds      ?? '',   

    // ===== QTY & TOTALS =====
    totalQty:            row.totalQty            ?? 0,  // Order Total Qty (10348)
    totalKg:             row.alreadyPreparedKg             ?? 0,  
    alreadyPreparedQty:  row.alreadyPreparedQty  ?? 0,  // Cumulative prepared
    alreadyPreparedKg:   row.alreadyPreparedKg   ?? 0,  // Cumulative prepared Kg
    RemainingQty:        row.remainingQty        ?? 0,  // Cumulative remaining
    RemainingKg:         row.remainingKg         ?? 0,  // Cumulative remaining Kg
    qty:                 row.qty                 ?? 0,  // Row specific size qty
    Kg:                  row.kg                  ?? 0,  // Row specific size kg

    // ===== SIZE DETAILS =====
    sizeDetails:  row.sizeDetails     ?? [],    
    revesionNo:   row.revesionNo      ?? 0,
    revisionDate: row.revisionDate    ?? null
  };

  console.log('✅ navState to action page (edit):', navState);
  localStorage.setItem('WASH_PREPARE_NAV_STATE', JSON.stringify(navState));

  // ✅ Route condition: Go to Acid page if SourceTable is 'Acid', else Wash page
  const routeUrl = isAcidBatch 
    ? '/mascowash/setup/entry/acid-wash-batch-prepare' 
    : '/mascowash/setup/entry/wash-prepare-action';

  const url = this.router.serializeUrl(
    this.router.createUrlTree([routeUrl])
  );

  window.open(url, '_blank', 'noopener');
  this.resetForm();
  this.loadUnits();
}
  /* ===================== RESET ===================== */
  resetForm(): void {
    this.Model = {
      UnitId:  null,
      BuyerId: null,
      JobId:   null,
      StyleId: null,
      OrderId: null
    };
    this.buyerList       = [];
    this.jobList         = [];
    this.styleList       = [];
    this.orderList       = [];
    this.fabricationList = [];
    this.colorList       = [];
    this.dressPartList   = [];
    this.uomList         = [];
    this.detailList      = [];
    this.sizeList        = [];
    this.sizePopupVisible = false;
  }

}