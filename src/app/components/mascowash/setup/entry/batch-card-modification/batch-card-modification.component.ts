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

/* ===================== INTERFACES ===================== */
interface DropdownItem {
  label: string;
  value: number | string;
}

interface SizeDetail {
  sizeId?: number | null;
  size: string;
  qty: number;
}

interface WashBatchRow {
  masterId: number;
  trackingNo: string;
  batchNo: string;
  documentNo: string;

  buyerId: number;
  buyerName: string;

  jobId: number;
  jobInfo: string;

  styleId: number;
  styleName: string;

  orderId: number;
  orderNo: string;

  type: string;
  shade: string;
  totalPcs: number;
  totalKg: number;

  processIds: string;
  machineIds: string;

  fabricationId: number;
  fabricationName: string;

  icleid: number;
  color: string;

  dressPartId: number;
  dressPart: string;

  uomDetailsId: number;
  uom: string;

  gsmId: number;
  gsm: string;
  loadunload: string;

  fromUnitId: number;
  fromUnitName: string;

  alreadyPreparedQty: number;
  alreadyPreparedKg: number;
  remainingQty: number;
  remainingKg: number;
  sizeTotalQty: number;
  sizeTotalKg: number;

  shipmentDate: Date | null;
  probableDeliveryDate: Date | null;

  sizeDetails: SizeDetail[];
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
    UnitId: null as number | null,
    BuyerId: null as number | null,
    JobId: null as number | null,
    StyleId: null as number | null,
    OrderId: null as number | null
  };

  /* ===================== GRID ===================== */
  detailList: WashBatchRow[] = [];
  UnitList: any[] = [];

  /* ===================== DROPDOWNS ===================== */
  buyerList: DropdownItem[] = [];
  jobList: DropdownItem[] = [];
  styleList: DropdownItem[] = [];
  orderList: DropdownItem[] = [];
  fabricationList: DropdownItem[] = [];
  colorList: DropdownItem[] = [];
  dressPartList: DropdownItem[] = [];
  uomList: DropdownItem[] = [];

  /* ===================== SIZE POPUP ===================== */
  sizePopupVisible = false;
  selectedRow!: WashBatchRow;
  sizeList: SizeDetail[] = [];
  totalSizeQty = 0;

  /* ===================== PRINT / REPORT ===================== */
  isLoading = false;
  ReportUrl: SafeResourceUrl;
  baseUrl = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router,
    private http: HttpClient,
    private _dom: DomSanitizer
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
        value: x.ID ?? x.id
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
        value: x.ID ?? x.id ?? x.BuyerNo
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

  /* ===================== JOB CHANGE ===================== */
  onJobChange(): void {
    this.styleList = [];
    this.orderList = [];
    this.Model.StyleId = null;
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId) return;

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

  /* ===================== STYLE CHANGE ===================== */
  onStyleChange(): void {
    this.orderList = [];
    this.Model.OrderId = null;

    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId || !this.Model.StyleId) return;

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

  /* ===================== SEARCH ===================== */
  onSearch(): void {
    if (!this.Model.UnitId || !this.Model.BuyerId || !this.Model.JobId ||
        !this.Model.StyleId || !this.Model.OrderId) {
      this.toastr.warning('Please select all fields before searching');
      return;
    }

    const params = {
      unitId:   this.Model.UnitId,
      buyerId:  this.Model.BuyerId,
      jobId:    this.Model.JobId,
      styleId:  this.Model.StyleId,
      orderId:  this.Model.OrderId
    };

    this.service.getWashBatchPrepareGridEdit(params).subscribe({
      next: (res: any[]) => {
        console.log('✅ WashBatchPrepareGrid Response:', res);
        this.bindDetailRows(res);

        // Reset filter selections after search
        this.Model.BuyerId = null;
        this.Model.JobId   = null;
        this.Model.StyleId = null;
        this.Model.OrderId = null;
        this.loadUnits();
      },
      error: (err) => {
        console.error('❌ WashBatchPrepareGrid Error:', err);
        this.toastr.error('Failed to load grid data');
      }
    });
  }

  /* ===================== BIND GRID (BatchNo-wise) ===================== */
  bindDetailRows(rows: any[]): void {
    const map = new Map<string, WashBatchRow>();

    rows.forEach(r => {
debugger;
      // ✅ Group ONLY by BatchNo — SP already returns BatchNo-wise data
      const key = r.batchNo ?? r.BatchNo ?? '';

      if (!map.has(key)) {
        map.set(key, {
          masterId:           r.masterId           ?? r.MasterId          ?? 0,
          trackingNo:         r.trackingNo         ?? r.TrackingNo        ?? '',
          batchNo:            r.batchNo            ?? r.BatchNo           ?? '',
          loadunload:         r.loadUnload         ?? r.LoadUnload        ?? '',
          documentNo:         r.documentNo         ?? r.DocumentNo        ?? '',

          // ✅ Fixed: SP returns BuyerId not BuyerNo
          buyerId:            r.buyerId            ?? r.BuyerId           ?? 0,
          buyerName:          r.buyerName          ?? r.BuyerName         ?? '',

          jobId:              r.jobId              ?? r.JobId             ?? 0,
          jobInfo:            r.jobInfo            ?? r.JobInfo           ?? '',

          // ✅ Fixed: SP returns StyleId not StyleNo
          styleId:            r.styleId            ?? r.StyleId           ?? 0,
          styleName:          r.styleName          ?? r.StyleName         ?? '',

          orderId:            r.orderId            ?? r.OrderId           ?? 0,
          orderNo:            r.orderNo            ?? r.OrderNo           ?? '',

          type:               r.type               ?? r.Type              ?? '',
          shade:              r.shade              ?? r.Shade             ?? '',
          totalPcs:           r.totalPcs           ?? r.TotalPcs          ?? 0,
          totalKg:            r.totalKg            ?? r.TotalKg           ?? 0,

          processIds:         r.processIds         ?? r.ProcessIds        ?? '',
          machineIds:         r.machineIds         ?? r.MachineIds        ?? '',

          fabricationId:      r.fabricationId      ?? r.FabricationId     ?? 0,
          fabricationName:    r.fabricationName    ?? r.FabricationName   ?? '',

          icleid:             r.icleid             ?? r.ICLEID            ?? 0,
          color:              r.color              ?? r.Color             ?? '',

          dressPartId:        r.dressPartId        ?? r.DressPartId       ?? 0,
          dressPart:          r.dressPart          ?? r.DressPart         ?? '',

          uomDetailsId:       r.uomDetailsId       ?? r.UOMDetailsId      ?? 0,
          uom:                r.uom                ?? r.UOM               ?? '',

          gsmId:              r.gsmId              ?? r.GsmId             ?? 0,
          gsm:                r.gsm                ?? r.GSM               ?? '',

      
          fromUnitId:         r.fromUnitId         ?? r.FromUnitId        ?? 0,
          fromUnitName:       r.fromUnitName       ?? r.FromUnitName      ?? '',

          alreadyPreparedQty: r.alreadyPreparedQty ?? r.AlreadyPreparedQty ?? 0,
          alreadyPreparedKg:  r.alreadyPreparedKg  ?? r.AlreadyPreparedKg  ?? 0,
          remainingQty:       r.remainingQty       ?? r.RemainingQty       ?? 0,
          remainingKg:        r.remainingKg        ?? r.RemainingKg        ?? 0,
          sizeTotalQty:       r.sizeTotalQty       ?? r.SizeTotalQty       ?? 0,
          sizeTotalKg:        r.sizeTotalKg        ?? r.SizeTotalKg        ?? 0,

          shipmentDate:         r.shipmentDate         ? new Date(r.shipmentDate)         : null,
          probableDeliveryDate: r.probableDeliveryDate ? new Date(r.probableDeliveryDate) : null,

          sizeDetails: [],
          totalQty:    0
        });
      }

      const row = map.get(key)!;

      // ✅ Only push size row if SizeId exists (SP can return NULL DetailId)
      const sizeId = r.sizeId ?? r.SizeId;
      if (sizeId) {
        row.sizeDetails.push({
          sizeId: sizeId,
          size:   r.size ?? r.Size ?? '',
          qty:    r.qty  ?? r.Qty  ?? 0
        });
        row.totalQty += (r.qty ?? r.Qty ?? 0);
      }
    });

    this.detailList = Array.from(map.values());

    // ✅ Populate inline dropdowns from bound data (fixed field names)
    this.buyerList       = this.unique(this.detailList, 'buyerId',      'buyerName');
    this.jobList         = this.unique(this.detailList, 'jobId',        'jobInfo');
    this.styleList       = this.unique(this.detailList, 'styleId',      'styleName');
    this.orderList       = this.unique(this.detailList, 'orderId',      'orderNo');
    this.fabricationList = this.unique(this.detailList, 'fabricationId','fabricationName');
    this.colorList       = this.unique(this.detailList, 'icleid',       'color');
    this.dressPartList   = this.unique(this.detailList, 'dressPartId',  'dressPart');
    this.uomList         = this.unique(this.detailList, 'uomDetailsId', 'uom');

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

    const grouped = row.sizeDetails.reduce((acc: any, item: any) => {
      if (!acc[item.sizeId]) {
        acc[item.sizeId] = { sizeId: item.sizeId, size: item.size, qty: 0 };
      }
      acc[item.sizeId].qty += Number(item.qty);
      return acc;
    }, {});

    this.sizeList = Object.values(grouped);
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
                  queryParams: {
                    url:        response.url,
                    TrackingNo: batchNo
                  }
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

  /* ===================== OPEN PREPARE TAB ===================== */
  openPrepareTab(row: WashBatchRow): void {
debugger;
    // ✅ Fixed: use remainingQty instead of comparing totalQty === alreadyPreparedQty
   if (row.loadunload === 'Exist') {
  this.toastr.warning('Load/Unload already exists for this batch.');
  return;
}
    if (!row?.orderId) return;

    const navState = {
      // IDs
      buyerId:      row.buyerId,
      jobId:        row.jobId,
      styleId:      row.styleId,        // ✅ was row.styleNo
      orderId:      row.orderId,
      fabricationId:row.fabricationId,
      colorId:      row.icleid,
      dressPartId:  row.dressPartId,
      uomId:        row.uomDetailsId,
      fromUnitId:   row.fromUnitId,
      // BatchNo:        row.batchNo,
      // Display labels
      buyer:        row.buyerName     ?? '',
      jobNo:        row.jobInfo       ?? '',
      styleNo:      row.styleName     ?? '',
      orderNo:      row.orderNo       ?? '',
      documentNo:   row.documentNo    ?? '',  // ✅ was receiveNo
      fabrication:  row.fabricationName ?? '',
      color:        row.color         ?? '',
      gsm:          row.gsm           ?? '',
      type:         row.type          ?? '',
      shade:        row.shade         ?? '',

      // Tracking
      trackingNo:   row.trackingNo    ?? '',
      AutoBatchNo:      row.batchNo       ?? '',

      // Qty
      sizeDetails:  row.sizeDetails   ?? [],
      totalQty:     row.alreadyPreparedQty  > 0 ? row.alreadyPreparedQty : row.totalQty,
      totalKg:      row.alreadyPreparedKg  > 0 ? row.alreadyPreparedKg : row.totalKg     ?? 0,
      MasterId:      row.masterId       ?? 0
    };

    localStorage.setItem('WASH_PREPARE_NAV_STATE', JSON.stringify(navState));

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/mascowash/setup/entry/wash-prepare-action'])
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