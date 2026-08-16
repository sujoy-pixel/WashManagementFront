import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { FloorStatusService } from './floor-status.service';

interface Operation {
  name: string;
  machineName: string;
  operatorName: string;
  loadUnloadStart: string;
  loadUnloadEnd: string;
  duration: string;
}

interface Batch {
  sl: number;
  batchNo: string;
  buyer: string;
  jobStyle: string;
  order: string;
  type: string;
  fabrication: string;
  color: string;
  dressPart: string;
  gsm: string;
  shadeBody: string;
  shadeFabric: string;
  fabricQtyBody: number;
  fabricQtyOther: number;
  garmentsQty: number;
  operationStartDate: string;
  operations: Operation[];
  totalDuration: string;
  status: string;
}

@Component({
  selector: 'app-floor-status-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  providers: [DatePipe],
  templateUrl: './floor-status-dashboard.component.html',
  styleUrl: './floor-status-dashboard.component.scss'
})
export class FloorStatusDashboardComponent implements OnInit {
  // Filters
  orderType: string = 'Bulk';
  selectedUnit: any = null;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  selectedStatus: any = null;
  globalSearch: string = '';

  UnitList: any[] = [];
  statuses: any[] = [
    { label: 'Dyeing Running', value: 'Dyeing Running' },
    { label: 'Dyeing End', value: 'Dyeing End' },
    { label: 'Acid Wash Running', value: 'Acid Wash Running' },
    { label: 'Acid Wash End', value: 'Acid Wash End' },
    { label: 'Neutralization Running', value: 'Neutralization Running' },
    { label: 'Neutralization End', value: 'Neutralization End' },
    { label: 'Wash Running', value: 'Wash Running' },
    { label: 'Wash End', value: 'Wash End' },
    { label: 'Hydro Running', value: 'Hydro Running' },
    { label: 'Hydro End', value: 'Hydro End' },
    { label: 'Dryer Running', value: 'Dryer Running' },
    { label: 'Dryer End', value: 'Dryer End' }
  ];

  batches: Batch[] = [];

  constructor(
    private floorService: FloorStatusService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.floorService.getUnitList().subscribe({
      next: (res: any) => {
        this.UnitList = res || [];
      },
      error: (err) => console.error("Error loading units", err)
    });
  }

  onSearch() {
    const fromStr = this.fromDate ? this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') : '';
    const toStr = this.toDate ? this.datePipe.transform(this.toDate, 'yyyy-MM-dd') : '';

    this.floorService.getFloorStatusData(
      this.orderType,
      this.selectedUnit,
      fromStr || '',
      toStr || '',
      this.selectedStatus,
      this.globalSearch
    ).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) {
          this.processRawData(res);
        } else {
          this.batches = [];
        }
      },
      error: (err) => {
        console.error("Error fetching data", err);
        this.batches = [];
      }
    });
  }

  // Groups flat SQL view data into nested objects
  processRawData(rawData: any[]) {
    const grouped = new Map<string, Batch>();

    rawData.forEach(row => {
      if (!grouped.has(row.batchNo)) {
        grouped.set(row.batchNo, {
          sl: grouped.size + 1,
          batchNo: row.batchNo,
          buyer: row.buyer,
          jobStyle: row.jobStyle,
          order: row.order,
          type: row.type,
          fabrication: row.fabrication,
          color: row.color,
          dressPart: row.dressPart,
          gsm: row.gsm,
          shadeBody: row.shadeBody,
          shadeFabric: row.shadeFabric,
          fabricQtyBody: row.fabricQtyBody,
          fabricQtyOther: row.fabricQtyOther,
          garmentsQty: row.garmentsQty,
          operationStartDate: row.operationStartDate,
          operations: [],
          totalDuration: row.totalDuration,
          status: row.status
        });
      }

      const batch = grouped.get(row.batchNo);
      batch?.operations.push({
        name: row.operationName,
        machineName: row.machineName,
        operatorName: row.operatorName,
        loadUnloadStart: row.loadUnloadStart,
        loadUnloadEnd: row.loadUnloadEnd,
        duration: row.duration
      });
    });

    this.batches = Array.from(grouped.values());
  }

  onClear() {
    this.selectedUnit = null;
    this.fromDate = undefined;
    this.toDate = undefined;
    this.selectedStatus = null;
    this.globalSearch = '';
    this.batches = [];
  }
}
