import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';

/* ===================== INTERFACES ===================== */
interface DropdownItem {
  label: string;
  value: number | string;
}

interface SizeDetail {
  sizeId: number;
  size: string;
  qty: number;
}

interface WashBatchRow {
  trackingNo: string;

  unitId: number;
  unitName: string;

  buyerNo: number;
  buyerName: string;

  jobId: number;
  jobInfo: string;

  styleNo: number;
  styleName: string;

  orderId: number;
  orderNo: string;

  type: string;

  fabricationId: number;
  fabricationName: string;
  composition: string;

  gsmId: number;
  gsm: string;

  colorId: number;
  colorName: string;

  dressPartId: number;
  dressPartName: string;

  uomId: number;
  uomName: string;

  sizeDetails: SizeDetail[];
  totalQty: number;
}

/* ===================== COMPONENT ===================== */
@Component({
    selector: 'app-wash-item-delivery',
    templateUrl: './wash-item-delivery.component.html',
    styleUrls: ['./wash-item-delivery.component.scss'],
    standalone: false
})
export class WashItemDeliveryComponent implements OnInit {

  /* ===================== SEARCH MODEL ===================== */
  model = {
    unitId: null as number | null,
    fromDate: '',
    toDate: '',
    trackingBatchNo: ''
  };

  /* ===================== GRID ===================== */
  detailList: WashBatchRow[] = [];
  gridList: WashBatchRow[] = [];

  /* ===================== DROPDOWNS ===================== */
  UnitList: DropdownItem[] = [];
  trackingList: DropdownItem[] = [];
  buyerList: DropdownItem[] = [];
  jobList: DropdownItem[] = [];
  styleList: DropdownItem[] = [];
  orderList: DropdownItem[] = [];
  colorList: DropdownItem[] = [];

  /* ===================== SIZE POPUP ===================== */
  sizePopupVisible = false;
  selectedRow!: WashBatchRow;
  sizeList: SizeDetail[] = [];
  totalSizeQty = 0;

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }
saveButtonTitle = 'Save';
  /* ===================== SEARCH ===================== */
  onSearch(): void {
    const params = {
      unitId: this.model.unitId,
      fromDate: this.model.fromDate,
      toDate: this.model.toDate,
      trackingBatchNo: this.model.trackingBatchNo
    };

    this.service.GetWashItemDeliveryList(params).subscribe({
    
      next: (res: any[]) => {
        console.log(res);
        this.bindDetailRows(res || []);
      },
      error: () => this.toastr.error('Failed to load data')
    });
  }

  /* ===================== GRID BIND ===================== */
  bindDetailRows(rows: any[]): void {
    const map = new Map<string, WashBatchRow>();

    rows.forEach(r => {

      const key = [
        r.trackingNo,
        r.unitId,
        r.buyerNo,
        r.jobId,
        r.styleNo,
        r.orderId,
        r.fabricationId,
        r.gsmId,
        r.icleid,
        r.dressPartId,
        r.uomDetailsId,
        r.type || ''
      ].join('|');

      if (!map.has(key)) {
        map.set(key, {
          trackingNo: r.trackingNo,

          unitId: r.unitId,
          unitName: r.fromUnitName ?? '',

          buyerNo: Number(r.buyerNo),
          buyerName: r.buyerName,

          jobId: Number(r.jobId),
          jobInfo: r.jobInfo,

          styleNo: Number(r.styleNo),
          styleName: r.styleName,

          orderId: Number(r.orderId),
          orderNo: r.orderNo,

          type: r.type || '',

          fabricationId: r.fabricationId,
          fabricationName: r.fabricationName,
          composition: r.composition ?? '',

          gsmId: r.gsmId,
          gsm: r.gsm,

          colorId: r.icleid,
          colorName: r.color,

          dressPartId: r.dressPartId,
          dressPartName: r.dressPart,

          uomId: r.uomDetailsId,
          uomName: r.uom,

          sizeDetails: [],
          totalQty: 0
        });
      }

      const row = map.get(key)!;

      row.sizeDetails.push({
        sizeId: r.iszid,
        size: r.size,
        qty: Number(r.qty || 0)
      });

      row.totalQty += Number(r.qty || 0);
    });

    this.detailList = Array.from(map.values());
    this.gridList = [...this.detailList];

    this.bindDropdowns();
  }

  /* ===================== DROPDOWNS ===================== */
  bindDropdowns(): void {
    this.trackingList = this.uniqueBy(this.detailList, 'trackingNo', 'trackingNo');
    this.buyerList    = this.uniqueBy(this.detailList, 'buyerNo', 'buyerName');
    this.jobList      = this.uniqueBy(this.detailList, 'jobId', 'jobInfo');
    this.styleList    = this.uniqueBy(this.detailList, 'styleNo', 'styleName');
    this.orderList    = this.uniqueBy(this.detailList, 'orderId', 'orderNo');
    this.colorList    = this.uniqueBy(this.detailList, 'colorId', 'colorName');
  }

  uniqueBy(arr: any[], valueKey: string, labelKey: string): DropdownItem[] {
    const map = new Map<any, DropdownItem>();

    arr.forEach(x => {
      const value = x[valueKey];
      if (value !== undefined && value !== null && value !== '') {
        map.set(value, {
          value,
          label: x[labelKey] ?? value
        });
      }
    });

    return Array.from(map.values());
  }

  /* ===================== SIZE POPUP ===================== */
  openSizePopup(row: WashBatchRow): void {
    this.selectedRow = row;
    this.sizeList = [...row.sizeDetails];
    this.sizePopupVisible = true;
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalSizeQty = this.sizeList.reduce(
      (sum, s) => sum + (Number(s.qty) || 0), 0
    );
  }

  confirmSizeQty(): void {
    if (this.selectedRow) {
      this.selectedRow.totalQty = this.totalSizeQty;
    }
    this.closeSizePopup();
  }

  closeSizePopup(): void {
    this.sizePopupVisible = false;
  }

  /* ===================== LOAD UNIT DROPDOWN ===================== */
  loadDropdowns(): void {
    this.service.GetUnitName().subscribe(res => {
      this.UnitList = (res || []).map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
    });
  }



   clearAll(): void {
    // this.detailList = [];
  }

onSubmit(): void {

  /* ================= VALIDATION ================= */
  if (!this.gridList?.length) {
    this.toastr.warning('No data found in grid');
    return;
  }

  /* ================= BUILD PAYLOAD ================= */

  // Use the first row to set master info
  const firstRow = this.gridList[0];

  const payload: any = {
    master: {
      operation: "INSERT",
      createdBy: "SYSTEM",
      masterId: 0,

      unitId: this.model.unitId ?? 0,
      trackingNo: this.model.trackingBatchNo ?? '',

      // Master display fields
      buyerId: firstRow?.buyerNo ?? null,
      jobId: firstRow?.jobId ?? null,
      styleId: firstRow?.styleNo ?? null,
      orderId: firstRow?.orderId ?? null,
      fabricationId: firstRow?.fabricationId ?? null,
      colorId: firstRow?.colorId ?? null,
      dressPartId: firstRow?.dressPartId ?? null,
      uomId: firstRow?.uomId ?? null,
      gsmId: firstRow?.gsmId ?? null,
      type: firstRow?.type ?? '',

      totalQty: 0
    },

    sizeDetails: []
  };

  // Combine all size details from all grid rows
  this.gridList.forEach((row: WashBatchRow) => {
    payload.master.totalQty += row.totalQty;

    row.sizeDetails.forEach(s => {
      payload.sizeDetails.push({
        sizeId: s.sizeId ?? null,
        size: s.size,
        qty: Number(s.qty) || 0
      });
    });
  });

  console.log('✅ SAVE PAYLOAD:', payload);

  /* ================= API CALL ================= */
  this.service.SaveWashItemDelivery(payload).subscribe({
    next: (res: any) => {
      this.toastr.success('Saved successfully');
      this.clearAll();
    },
    error: (err: any) => {
      console.error('❌ Save Error:', err);
      this.toastr.error('Save failed');
    }
  });
}


}
