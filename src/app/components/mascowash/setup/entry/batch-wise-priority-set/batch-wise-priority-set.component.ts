import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { de } from 'date-fns/locale';

interface SizeRecord {
  sizeId: number;
  size: string;
  sizeQty: number;
}

interface BatchRecord {
  BatchId: number;
  BatchNo: string;

  BuyerName: string;
  JobName: string;
  StyleName: string;
  OrderName: string;
  ColorName: string;

  MachineNo: string;

  Priority: number;

  totalQty: number;
  sizeDetails: SizeRecord[];
  // ===== IDs for save =====
  MachineId: number;
  BuyerId: number;
  JobId: number;
  StyleId: number;
  OrderId: number;
  ColorId: number;
}

@Component({
    selector: 'app-batch-wise-priority-set',
  templateUrl: './batch-wise-priority-set.component.html',
  styleUrls: ['./batch-wise-priority-set.component.scss']
})
export class BatchWisePrioritySetComponent implements OnInit {

  Model: any = {
    UnitId: null,
    Date: null
  };

  UnitList: any[] = [];
  priorityList: number[] = [];

  dataList: BatchRecord[] = [];

  // ===== size popup =====
  sizePopupVisible = false;
  sizeList: SizeRecord[] = [];
  totalSizeQty = 0;
  selectedRow!: BatchRecord;

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
    this.priorityList = Array.from({ length: 100 }, (_, i) => i + 1);
  }

  // ================= UNITS =================
  loadUnits() {
    this.service.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
    });
  }

  // ================= SEARCH =================
  onSearch() {

    if (!this.Model.UnitId || !this.Model.date) {
      this.toastr.warning('Select Unit and Date');
      return;
    }

    this.service.getBatchPriorityList({
      unitId: this.Model.UnitId,
      date: this.Model.date
    }).subscribe(res => {

      this.dataList = this.groupRows(res);

      if (!this.dataList.length)
        this.toastr.info('No data found');
    });
  }

  // ================= UNIQUE GROUPING =================
//  groupRows(rows: any[]): BatchRecord[] {
//  console.log(rows);
//   const map = new Map<string, BatchRecord>();

//   rows.forEach(r => {

//     // ✅ include machineNo in key
//     const key = `${r.batchNo}|${r.buyerName}|${r.jobName}|${r.styleName}|${r.orderName}|${r.colorName}|${r.machineNo}`;

//     if (!map.has(key)) {

//       map.set(key, {
//         BatchId: r.batchId,
//         BatchNo: r.batchNo,

//         BuyerName: r.buyerName,
//         JobName: r.jobName,
//         StyleName: r.styleName,
//         OrderName: r.orderName,
//         ColorName: r.colorName,

//         // ✅ machine wise now
//         MachineNo: r.machineNo,

//         Priority: r.priority ?? 1,

//         totalQty: 0,
//         sizeDetails: []
//       });
//     }

//     const row = map.get(key)!;

//     row.sizeDetails.push({
//       sizeId: r.sizeId,
//       size: r.size,
//       sizeQty: r.sizeQty
//     });

//     row.totalQty += Number(r.sizeQty || 0);
//   });

//   return Array.from(map.values());
// }
groupRows(rows: any[]): BatchRecord[] {

  const map = new Map<string, BatchRecord>();

  rows.forEach(r => {

    // ✅ use IDs (NOT names)
    const key =
      `${r.batchNo}|${r.machineId}|${r.buyerId}|${r.jobId}|${r.styleId}|${r.orderId}|${r.colorId}`;

    if (!map.has(key)) {

      map.set(key, {
        BatchId: r.batchId,
        BatchNo: r.batchNo,

        // ===== store ALL IDs for save =====
        MachineId: r.machineId,
        BuyerId: r.buyerId,
        JobId: r.jobId,
        StyleId: r.styleId,
        OrderId: r.orderId,
        ColorId: r.colorId,

        // ===== display only =====
        MachineNo: r.machineNo,
        BuyerName: r.buyerName,
        JobName: r.jobName,
        StyleName: r.styleName,
        OrderName: r.orderName,
        ColorName: r.colorName,

        Priority: r.priority ?? 1,

        totalQty: 0,
        sizeDetails: []
      });
    }

    const row = map.get(key)!;

    row.sizeDetails.push({
      sizeId: r.sizeId,
      size: r.size,
      sizeQty: r.sizeQty
    });

    row.totalQty += Number(r.sizeQty || 0);
  });

  return Array.from(map.values());
}

  // ================= SIZE POPUP =================
  openSizePopup(row: BatchRecord) {
    this.selectedRow = row;
    this.sizeList = row.sizeDetails.map(x => ({ ...x }));
    this.calculateTotal();
    this.sizePopupVisible = true;
  }

  calculateTotal() {
    this.totalSizeQty = this.sizeList.reduce((s, x) => s + (+x.sizeQty || 0), 0);
  }

  confirmSizeQty() {
    this.selectedRow.sizeDetails = [...this.sizeList];
    this.selectedRow.totalQty = this.totalSizeQty;
    this.sizePopupVisible = false;
  }

  // ================= SAVE =================
onSubmit() {
  if (!this.dataList?.length) {
    this.toastr.warning('No data to save');
    return;
  }

  // Wrap array inside 'Rows' property
  const payload = {
    Rows: this.dataList.map(x => ({
      CreatedBy: 'Admin', // or dynamic _currentUser
      UnitId: this.Model.UnitId,
      Date: this.Model.date, // make sure this is Date object

      BatchNo: x.BatchNo,
      MachineId: x.MachineId,

      Priority: x.Priority,
      Qty: x.totalQty, // summed quantity

      BuyerId: x.BuyerId,
      JobId: x.JobId,
      StyleId: x.StyleId,
      OrderId: x.OrderId,
      ColorId: x.ColorId
    }))
  };

  console.log('SAVE PAYLOAD =>', payload);
  debugger;

  this.service.saveBatchPriorityBulk(payload).subscribe({
    next: () => {
      this.toastr.success('Saved successfully');
      this.onSearch(); // reload grid
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('Save failed');
    }
  });
}


}