import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { WashSetupService } from '../../../services/washsetup.service';

// --- Per-operation row (5 cells in the grid) ---
interface Operation {
  sortOrder:     number;
  operationName: string;
  machineName:   string;
  operatorName:  string;
  loadStart:     string;
  loadEnd:       string;
  duration:      string;
}

// --- One per unique batchNo (master info + nested operations) ---
interface BatchRow {
  sl:                 number;
  batchNo:            string;
  buyer:              string;
  job:                string;
  style:              string;
  order:              string;
  type:               string;
  fabrication:        string;
  color:              string;
  dressPart:          string;
  gsm:                string;
  shadeBody:          string;
  shadeFabric:        string;
  fabricQtyBody:      number | null;
  fabricQtyOther:     number | null;
  garmentsQty:        number | null;
  operationStartDate: string | null;
  operations:         Operation[];   // exactly 6 rows after dedup
  totalDuration:      string;
  status:             string;
}

// Canonical 6-step order (SRS 3.2.C).
const OPERATION_ORDER: { [key: string]: number } = {
  'Dyeing':         1,
  'Acid Wash':      2,
  'Neutralization': 3,
  'Wash':           4,
  'Hydro':          5,
  'Dryer':          6
};

@Component({
  selector: 'app-floor-status-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  providers: [DatePipe],
  templateUrl: './floor-status-dashboard.component.html',
  // styleUrl: './floor-new.scss'
  styleUrls: ['./floor-status-dashboard.component.scss']
})
export class FloorStatusDashboardComponent implements OnInit {

  filter: any = {
    UnitId: null,
    fromDate: null,
    toDate: null,
    orderType: 'Bulk'
  };

  UnitList: any[] = [];
  statusList: any[] = [];
  selectedStatus: string = '';
  globalSearch: string = '';

  allBatches: BatchRow[] = [];
  filteredBatches: BatchRow[] = [];

  constructor(
    private washService: WashSetupService,
    private datePipe: DatePipe,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.washService.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
      const found = this.UnitList.find(x => x.value === 60);
      if (found) this.filter.UnitId = 60;
    });
  }

  // ================= SEARCH =================
  onSearch() {
    if (!this.filter.UnitId) { this.toastr.warning('Please Select Unit'); return; }
    if (!this.filter.fromDate && !this.filter.toDate) {
      this.toastr.warning('Please select From Date and To Date'); return;
    }
    if ((this.filter.fromDate && !this.filter.toDate) || (!this.filter.fromDate && this.filter.toDate)) {
      this.toastr.warning('Please select both From Date and To Date'); return;
    }

    const request = {
      orderType: this.filter.orderType,
      unitId:    this.filter.UnitId,
      fromDate:  this.datePipe.transform(this.filter.fromDate, 'yyyy-MM-dd') || '',
      toDate:    this.datePipe.transform(this.filter.toDate,   'yyyy-MM-dd') || ''
    };

    this.washService.getFloorStatusData(request).subscribe({
      next: (res: any[]) => {
        // console.log('Floor status data received:', res);
        if (res?.length) {
          this.processRawData(res);
        } else {
          this.toastr.info('No data found');
          this.allBatches = [];
          this.filteredBatches = [];
          this.statusList = [];
          this.selectedStatus = '';
        }
      },
      error: () => {
        this.toastr.error('Failed to load floor status data');
        this.allBatches = [];
        this.filteredBatches = [];
      }
    });
  }

  // ===================================================================
  // GROUP FLAT DATA INTO BATCHES
  // Guarantees:
  //   1. One BatchRow per unique batchNo (collapses SL=1/2/3 dupes)
  //   2. One Operation per unique operationName within a batch
  //      (keep the row with actual data; if both have data, keep
  //       the one with the latest LoadStart)
  //   3. Operations sorted by canonical 6-step order
  // ===================================================================
  private processRawData(rawData: any[]) {
    const grouped   = new Map<string, BatchRow>();
    const opByBatch = new Map<string, Map<string, Operation>>();

    rawData.forEach(row => {
      const batchNo = (row.batchNo ?? '').toString().trim();
      if (!batchNo) return;

      // ---- 1. Create / fetch batch header (once per batchNo) ----
      if (!grouped.has(batchNo)) {
        grouped.set(batchNo, {
          sl:                 row.sl ?? 0,
          batchNo,
          buyer:              this.cleanStr(row.buyer),
          job:                this.cleanStr(row.job),
          style:              this.cleanStr(row.style),
          order:              this.cleanStr(row.order),
          type:               this.cleanStr(row.type),
          fabrication:        this.cleanStr(row.fabrication),
          color:              this.cleanStr(row.color),
          dressPart:          this.cleanStr(row.dressPart),
          gsm:                this.cleanStr(row.gsm),
          shadeBody:          this.cleanStr(row.shadeBody),
          shadeFabric:        this.cleanStr(row.shadeFabric),
          fabricQtyBody:      this.toNumber(row.fabricQtyBody),
          fabricQtyOther:     this.toNumber(row.fabricQtyOther),
          garmentsQty:        this.toNumber(row.garmentsQty),
          operationStartDate: row.operationStartDate ?? null,
          operations:         [],
          totalDuration:      this.cleanStr(row.totalDuration),
          status:             this.cleanStr(row.status) || 'Pending'
        });
        opByBatch.set(batchNo, new Map<string, Operation>());
      }

      // ---- 2. Build candidate operation ----
      const opName = (row.operationName ?? '').toString().trim();
      if (!opName) return;

      const candidate: Operation = {
        sortOrder:     OPERATION_ORDER[opName] ?? 99,
        operationName: opName,
        machineName:   this.cleanStr(row.machineName),
        operatorName:  this.cleanStr(row.operatorName),
        loadStart:     this.cleanStr(row.loadStart),
        loadEnd:       this.cleanStr(row.loadEnd),
        duration:      this.cleanStr(row.duration)
      };

      // ---- 3. Dedupe per (batch, operationName) ----
      const opsMap   = opByBatch.get(batchNo)!;
      const existing = opsMap.get(opName);

      if (!existing) {
        opsMap.set(opName, candidate);
      } else {
        const candHasData  = !!(candidate.machineName || candidate.loadStart || candidate.loadEnd);
        const existHasData = !!(existing.machineName   || existing.loadStart   || existing.loadEnd);

        if (candHasData && !existHasData) {
          opsMap.set(opName, candidate);
        } else if (candHasData && existHasData) {
          if (this.compareTimeStr(candidate.loadStart, existing.loadStart) > 0) {
            opsMap.set(opName, candidate);
          }
        }
      }
    });

    // ---- 4. Materialise operations array, sorted by canonical order ----
    this.allBatches = Array.from(grouped.values()).map(b => {
      const opsMap = opByBatch.get(b.batchNo)!;
      const ops    = Array.from(opsMap.values());
      ops.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
      return { ...b, operations: ops };
    });

    // ---- 5. Re-assign SL sequentially (1, 2, 3, ...) ----
    this.allBatches.forEach((b, idx) => b.sl = idx + 1);

    // ---- 6. Build distinct status list ----
    const distinctStatuses = [...new Set(
      this.allBatches.map(b => b.status).filter(s => s && s.trim().length)
    )];
    this.statusList = distinctStatuses.map(s => ({ label: s, value: s }));
    console.log('Distinct allBatches:', this.allBatches);
    this.selectedStatus  = '';
    this.globalSearch    = '';
    this.filteredBatches = [...this.allBatches];
  }

  // ---- Helpers ----
  private cleanStr(v: any): string {
    if (v === null || v === undefined) return '';
    const s = String(v).trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'none') return '';
    return s;
  }

  private toNumber(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isNaN(n) ? null : n;
  }

  private compareTimeStr(a: string, b: string): number {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    return a.localeCompare(b);
  }

  containsText(value: any, searchTerm: string): boolean {
    return value != null && String(value).toLowerCase().indexOf(searchTerm) !== -1;
  }

  // ================= FILTERS =================
  onStatusFilter() { this.applyCombinedFilter(); }
  onGlobalSearch() { this.applyCombinedFilter(); }

  private applyCombinedFilter() {
    let result = [...this.allBatches];

    if (this.selectedStatus) {
      result = result.filter(b => b.status === this.selectedStatus);
    }

    const term = this.globalSearch?.trim()?.toLowerCase() ?? '';
    if (term.length) {
      result = result.filter(b => {
        const batchHit =
          this.containsText(b.batchNo, term) ||
          this.containsText(b.buyer, term) ||
          this.containsText(b.job, term) ||
          this.containsText(b.style, term) ||
          this.containsText(b.order, term) ||
          this.containsText(b.type, term) ||
          this.containsText(b.fabrication, term) ||
          this.containsText(b.color, term) ||
          this.containsText(b.dressPart, term) ||
          this.containsText(b.gsm, term) ||
          this.containsText(b.status, term) ||
          this.containsText(b.totalDuration, term) ||
          this.containsText(b.fabricQtyBody, term) ||
          this.containsText(b.fabricQtyOther, term) ||
          this.containsText(b.garmentsQty, term);

        const opHit = b.operations?.some(op =>
          this.containsText(op.operationName, term) ||
          this.containsText(op.machineName, term) ||
          this.containsText(op.operatorName, term) ||
          this.containsText(op.loadStart, term) ||
          this.containsText(op.loadEnd, term) ||
          this.containsText(op.duration, term)
        );

        return batchHit || opHit;
      });
    }

    this.filteredBatches = result;
  }

  onClear() {
    this.filter.fromDate = null;
    this.filter.toDate   = null;
    this.selectedStatus  = '';
    this.globalSearch    = '';
    this.allBatches      = [];
    this.filteredBatches = [];
    this.statusList      = [];
  }

  // ================= EXCEL EXPORT =================
  // Mirrors the grid layout EXACTLY:
  //   - Master-info cells (SL, BatchNo, ... OperationStartDate, TotalDuration, Status)
  //     appear ONLY on the first operation row of each batch
  //   - Per-op cells (OperationName, Machine, Operator, Load, Duration) appear on every row
  //   - Empty cells become "" so Excel renders blank, not "null"
  onExcel() {
    if (!this.filteredBatches.length) {
      this.toastr.warning('No data to export');
      return;
    }

    const flatData: any[] = [];

    this.filteredBatches.forEach(batch => {
      if (!batch.operations.length) {
        flatData.push(this.buildExcelRow(batch, null, true));
        return;
      }

      batch.operations.forEach((op, i) => {
        flatData.push(this.buildExcelRow(batch, op, i === 0));
      });
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flatData);

    ws['!cols'] = [
      { wch: 5 },  // SL
      { wch: 18 }, // Batch No
      { wch: 18 }, // Buyer
      { wch: 20 }, // Job
      { wch: 22 }, // Style
      { wch: 12 }, // Order
      { wch: 8 },  // Type
      { wch: 15 }, // Fabrication
      { wch: 28 }, // Color
      { wch: 12 }, // Dress Part
      { wch: 6 },  // GSM
      { wch: 12 }, // Shade Body
      { wch: 12 }, // Shade Fabric
      { wch: 14 }, // Fabric Qty Body
      { wch: 14 }, // Fabric Qty Other
      { wch: 16 }, // Garments & Panel Qty
      { wch: 16 }, // Operation Start Date
      { wch: 16 }, // Operation Name
      { wch: 20 }, // Machine Name
      { wch: 22 }, // Operator Name
      { wch: 10 }, // Load Start
      { wch: 10 }, // Load End
      { wch: 10 }, // Duration
      { wch: 12 }, // Total Duration
      { wch: 18 }  // Status
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Floor Status');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `FloorStatus_${today}.xlsx`);
    this.toastr.success('Excel exported successfully');
  }

  // Build a single Excel row.
  // - firstRowOfBatch=true  -> include all master-info cells
  // - firstRowOfBatch=false -> blank out master-info cells, only fill per-op cells
  private buildExcelRow(batch: BatchRow, op: Operation | null, firstRowOfBatch: boolean): any {
    return {
      'SL':                    firstRowOfBatch ? batch.sl                 : '',
      'Batch No':              firstRowOfBatch ? batch.batchNo            : '',
      'Buyer':                 firstRowOfBatch ? batch.buyer              : '',
      'Job':                   firstRowOfBatch ? batch.job                : '',
      'Style':                 firstRowOfBatch ? batch.style              : '',
      'Order':                 firstRowOfBatch ? batch.order              : '',
      'Type':                  firstRowOfBatch ? batch.type               : '',
      'Fabrication':           firstRowOfBatch ? batch.fabrication        : '',
      'Color':                 firstRowOfBatch ? batch.color              : '',
      'Dress Part':            firstRowOfBatch ? batch.dressPart          : '',
      'GSM':                   firstRowOfBatch ? batch.gsm                : '',
      'Shade Body':            firstRowOfBatch ? batch.shadeBody          : '',
      'Shade Fabric':          firstRowOfBatch ? batch.shadeFabric        : '',
      'Fabric Qty (Body)':     firstRowOfBatch ? (batch.fabricQtyBody  != null ? batch.fabricQtyBody  : '') : '',
      'Fabric Qty (Other)':    firstRowOfBatch ? (batch.fabricQtyOther != null ? batch.fabricQtyOther : '') : '',
      'Garments & Panel Qty':  firstRowOfBatch ? (batch.garmentsQty    != null ? batch.garmentsQty    : '') : '',
      'Operation Start Date':  firstRowOfBatch ? this.formatDate(batch.operationStartDate) : '',
      'Operation Name':        op ? op.operationName : '',
      'Machine Name':          op ? op.machineName   : '',
      'Operator Name':         op ? op.operatorName  : '',
      'Load Start':            op ? op.loadStart     : '',
      'Load End':              op ? op.loadEnd       : '',
      'Duration':              op ? op.duration      : '',
      'Total Duration':        firstRowOfBatch ? batch.totalDuration : '',
      'Status':                firstRowOfBatch ? batch.status         : ''
    };
  }

  private formatDate(d: any): string {
    if (!d) return '';
    return this.datePipe.transform(d, 'yyyy-MM-dd') || '';
  }
}