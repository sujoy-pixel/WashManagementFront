import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { WashSetupService } from '../../../services/washsetup.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DropdownItem } from '../../../model/common-files.model';

interface BatchHeaderModel {
  unitName: string;
  buyerName: string;
  batchNo: string;
  styleName: string;
  orderNo: string;
  jobNo: string;
  type: string;
  color: string;
  dressPart: string;
  uom: string;
  date: string;
  weight?: number;
}

interface OperationHistory {
  id?: number;
  operation: string;
  processNames: string;
  machineNames: string;
  weight?: number;
  startDate: string | Date;
  startTime: string;
  endDate: string | Date | null;
  endTime: string | null;
}

@Component({
  selector: 'app-wash-operation-start-end',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule,
    CardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './wash-operation-start-end.component.html',
  styleUrl: './wash-operation-start-end.component.scss'
})
export class WashOperationStartEndComponent {

  @ViewChild('batchInput') batchInput!: ElementRef;

  processList: any[] = [];
  machineList: any[] = [];
  buyerList: DropdownItem[] = [];
  UnitList: DropdownItem[] = [];

  operationList: OperationHistory[] = [];

  batchNo: string = '';

  startDate: Date | null = null;
  endDate: Date | null = null;
  startTime: string = '';
  endTime: string = '';

  batchHeader: BatchHeaderModel = {
    unitName: '',
    buyerName: '',
    batchNo: '',
    styleName: '',
    orderNo: '',
    jobNo: '',
    type: '',
    color: '',
    dressPart: '',
    uom: '',
    date: '',
    weight: 0
  };

  Model = {
    UnitId: null as number | null,
    BuyerId: null as number | null,
    JobId: null as number | null,
    StyleId: null as number | null,
    OrderId: null as number | null,

    ProcessId: null as number | null,
    MachineId: null as number | null,

    Weight: null as number | null,

    trackingNo: '',
    batchNo: '',
    // ✅ ADD THESE
    TotalKg: 0,
    UsedWeight: 0,
    RemainingWeight: 0

  };

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  // ngOnInit(): void {
  //   this.loadBuyerList();
  //   this.loadUnitList();
  //   this.loadProcessDDL();
  //   this.setCurrentDateTime();
  // }
  ngOnInit(): void {
    this.loadBuyerList();
    this.loadUnitList();
    this.loadProcessDDL();
    // this.loadMachineDDL();
    this.setCurrentDateTime();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
    }, 100);
  }

  // ================= TIME =================
  private setCurrentDateTime() {
    const now = new Date();
    this.startDate = now;
    this.startTime = this.formatTime(now);
    this.endDate = null;
    this.endTime = '';
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  // ================= DDL =================
  loadProcessDDL() {
    this.service.GetProcessNameDDL().subscribe(res => {
      this.processList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

  loadMachineDDL() {
    this.service.GetMachineNoDDL().subscribe(res => {
      this.machineList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

  loadUnitList() {
    // this.service.GetUnitName().subscribe(res => {
    //   this.UnitList = res.map((x: any) => ({
    //     label: x.DisplayName || x.displayName,
    //     value: Number(x.ID || x.id)
    //   }));
    // });


 this.service.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
      const found = this.UnitList.find(x => x.value === 60);
      if (found) {
        this.Model.UnitId = 60;
        // this.Model.UnitId = 60;
        // this.review.UnitId = 60;
      }
    });


  }



  loadBuyerList() {
    this.service.GetBuyerNameDDL().subscribe(res => {
      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

  // ================= PROCESS =================
  onSelectionChangeProcess(processId: number) {

    console.log('Process ID:', processId);

    // ✅ reset machine
    this.machineList = [];
    this.Model.MachineId = null;

    if (!processId) return;

    // ✅ convert to string (your API style)
    const processIds = processId.toString();

    this.service.GetMachineByProcess(processIds).subscribe({
      next: (res: any) => {

        const data = Array.isArray(res) ? res : res?.data || res?.result || [];

        this.machineList = data.map((x: any) => ({
          label: x.displayName ?? x.DisplayName ?? x.machineName ?? x.MachineName,
          value: x.id ?? x.ID ?? x.machineDetailId ?? x.MachineDetailId
        }));

        // optional: auto select first machine
        // this.Model.MachineId = this.machineList[0]?.value || null;

        this.cdr.detectChanges();
      },

      error: () => {
        this.machineList = [];
        this.Model.MachineId = null;
      }
    });
  }
  onlyNumber(event: any) {
    const val = event.target.value;
    event.target.value = val.replace(/[^0-9.]/g, '');
    this.Model.Weight = event.target.value;
  }

  // ================= LOAD BATCH =================

  loadBatchData() {
    if (!this.batchNo) {
      this.toastr.warning('Enter Batch No');
      return;
    }

    this.service.getBatchWishStartEndData(this.batchNo).subscribe({

      next: (res: any) => {
        const data = Array.isArray(res) ? res : res.data;

        if (!data || data.length === 0) {
          this.toastr.warning('No data found');
          return;
        }
        console.log('Batch Data:', data);
        const first = data[0];
        debugger
        // Header Bind
        this.batchHeader = {
          unitName: first.unitName || '',
          buyerName: first.buyerName || '',
          batchNo: first.batchNo || '',
          styleName: first.styleName || '',
          orderNo: first.orderNo || '',
          jobNo: first.jobNo || '',
          type: first.type || '',
          color: first.color || '',
          dressPart: first.dressPart || '',
          uom: first.uom || '',
          date: first.date || '',
          weight: first.weight || null   // optional (header display)
        };

        this.Model.UnitId = first.unitId || null;
        this.Model.BuyerId = first.buyerId || null;

        this.loadOperationHistory(this.batchNo);
      },
      error: () => {
        this.toastr.error('Error loading batch');
      }
    });
  }


  loadOperationHistory(batch: string) {
    this.service.getStartEndOperationData(batch).subscribe((res: any) => {

      const data: OperationHistory[] =
        Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data : [];

      // ✅ Always show latest row FIRST in grid (DESC by id)
      this.operationList = [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

      // ✅ Pick the LATEST row by id (not array position)
      const latest = this.operationList[0];
      const now = new Date();

      if (!latest) {
        // No history at all → fresh start
        this.startDate = now;
        this.startTime = this.formatTime(now);
        this.endDate = null;
        this.endTime = '';
        return;
      }

      // ✅ Robust null/empty/default-date check
      const hasEnd = this.isValidDate(latest.endDate) && !!latest.endTime?.trim();

      if (!hasEnd) {
        // ⏳ Latest row is OPEN (no end) → show END date/time as current
        this.startDate = null;
        this.startTime = '';
        this.endDate = now;
        this.endTime = this.formatTime(now);
      } else {
        // ✅ Latest row is CLOSED → ready for NEW operation → show START
        this.startDate = now;
        this.startTime = this.formatTime(now);
        this.endDate = null;
        this.endTime = '';
      }
    });
  }

  // ✅ ADD this helper — handles null, '', '0001-01-01', invalid dates
  private isValidDate(val: string | Date | null | undefined): boolean {
    if (!val) return false;
    const str = val.toString().trim();
    if (str === '' || str.startsWith('0001-01-01')) return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
  }
  // ================= SAVE =================
  onSubmit() {

    if (!this.batchNo) {
      this.toastr.warning('Batch required');
      return;
    }

    if (!this.Model.ProcessId) {
      this.toastr.warning('Select Process');
      return;
    }

    if (!this.Model.MachineId) {
      this.toastr.warning('Select Machine');
      return;
    }
    // if (!this.Model.Weight) {
    //   this.toastr.warning('Input Weight');
    //   return;
    // }
    const payload = {
      rows: [{
        unitId: this.Model.UnitId,
        buyerId: this.Model.BuyerId,
        batchNo: this.batchNo,
        processId: this.Model.ProcessId,
        machineId: this.Model.MachineId,
        weight: this.batchHeader.weight,
        startDate: this.startDate,
        endDate: this.endDate,
        startTime: this.startTime,
        endTime: this.endTime,
        createdBy: 'SYSTEM'
      }]
    };

    this.service.saveWashStartEnd(payload).subscribe(() => {
      this.toastr.success('Saved successfully');
      this.loadOperationHistory(this.batchNo);
    });
  }

  // ================= CLEAR =================
  onClear() {
    this.batchNo = '';
    this.operationList = [];
    this.Model.ProcessId = null;
    this.Model.MachineId = null;


    this.setCurrentDateTime();
  }
}