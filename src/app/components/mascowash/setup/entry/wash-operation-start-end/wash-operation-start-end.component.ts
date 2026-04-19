import { Component, ViewChild, ElementRef } from '@angular/core';
import { WashSetupService } from '../../../services/washsetup.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DropdownItem } from '../../../model/common-files.model';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface BatchHeaderModel {
  unitId?: number;
  buyerId?: number;
  styleId?: number;
  orderId?: number;
  jobId?: number;

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
  operationList: any[] = [];
  allSelectedProcess = false;
  allSelectedMachine = false;
  
  // Date fields
  startDate: Date | null = null;
  endDate: Date | null = null;
  startTime: string = '';
  endTime: string = '';
  
  batchNo: string = '';
  
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
    date: ''
  };

  Model = {
    UnitId: null as number | null,
    BuyerId: null as number | null,
    JobId: null as number | null,
    StyleId: null as number | null,
    OrderId: null as number | null,
    trackingNo: '' as string,
    batchNo: '' as string,

    processList: [] as number[],
    machineList: [] as number[]
  };

  buyerList: DropdownItem[] = [];
  UnitList: DropdownItem[] = [];

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadBuyerList();
    this.loadUnitList();
    this.loadProcessDDL();
    this.loadMachineDDL();
    
    // ✅ Page Load: Start = NOW, End = NULL
    this.setPageLoadDateTime();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
      this.batchInput?.nativeElement.select();
    }, 100);
  }

  // ================= DATE TIME LOGIC =================
  
  /**
   * ✅ Page Load Condition:
   * Start = NOW (current date and current Time)
   * End = NULL
   */
  private setPageLoadDateTime() {
    const now = new Date();
    this.startDate = now;
    this.startTime = this.formatTimeForInput(now);
    this.endDate = null;
    this.endTime = '';
  }

  /**
   * ✅ Apply Conditions based on existing operations:
   * 1. If Start exists, End not → Start = NULL, End = NOW
   * 2. If both exist → Start = NOW, End = NULL
   */
  private applySmartDateTimeLogic() {
    const now = new Date();
    const timeString = this.formatTimeForInput(now);
    
    // Get the last operation from history
    const lastOperation = this.operationList?.length > 0 
      ? this.operationList[this.operationList.length - 1] 
      : null;
    
    if (!lastOperation) {
      // No existing data - treat as Page Load
      this.startDate = now;
      this.startTime = timeString;
      this.endDate = null;
      this.endTime = '';
    } 
    else if (lastOperation.startDate && !lastOperation.endDate) {
      // ✅ Condition: If Start exists, End not
      // Start = NULL, End = NOW
      this.startDate = null;
      this.startTime = '';
      this.endDate = now;
      this.endTime = timeString;
    } 
    else if (lastOperation.startDate && lastOperation.endDate) {
      // ✅ Condition: If both exist
      // Start = NOW, End = NULL (Ready for new operation)
      this.startDate = now;
      this.startTime = timeString;
      this.endDate = null;
      this.endTime = '';
    }
  }

  private formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`; // Returns "HH:mm" for input type="time"
  }

  // ================= LOAD DDL =================
  loadProcessDDL() {
    this.service.GetProcessNameDDL().subscribe(res => {
      this.processList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id ?? x.ID
      }));
    });
  }

  loadMachineDDL() {
    this.service.GetMachineNoDDL().subscribe(res => {
      this.machineList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id ?? x.ID
      }));
    });
  }

  loadUnitList() {
    this.service.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));

      const found = this.UnitList.find(x => x.value === 60);
      if (found) this.Model.UnitId = 60;
    });
  }

  loadBuyerList() {
    this.service.GetBuyerNameDDL().subscribe(res => {
      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.BuyerName,
        value: x.ID ?? x.id ?? x.BuyerNo
      }));

      if (this.buyerList.length === 1) {
        this.Model.BuyerId = Number(this.buyerList[0].value);
      }
    });
  }

  // ================= MACHINE =================
  onSelectionChangeMachine() {
    this.Model.machineList = this.Model.machineList.filter(x => x !== 0 && x !== null);
  }

  toggleAllSelectionMachine() {
    this.allSelectedMachine = !this.allSelectedMachine;

    this.Model.machineList = this.allSelectedMachine
      ? this.machineList.map(x => x.value)
      : [];
  }

  isAllSelectedMachine(): boolean {
    return this.Model.machineList.length === this.machineList.length;
  }

  // ================= PROCESS =================
  onSelectionChangeProcess() {
    this.Model.processList = this.Model.processList.filter(x => x !== 0 && x !== null);
  }

  toggleAllSelectionProcess() {
    this.allSelectedProcess = !this.allSelectedProcess;

    this.Model.processList = this.allSelectedProcess
      ? this.processList.map(x => x.value)
      : [];
  }

  isAllSelectedProcess(): boolean {
    return this.Model.processList.length === this.processList.length;
  }

  // ================= LOAD BATCH (MAIN LOGIC) =================
  loadBatchData() {
    const batch = this.batchNo?.trim();
    if (!batch) return;

    this.service.getBatchWishStartEndData(batch).subscribe({
      next: (res: any[]) => {

        if (!res || res.length === 0) {
          this.toastr.warning('No data found');
          return;
        }

        const first = res[0];

        // ✅ HEADER SET
        this.Model.UnitId = first.unitId;
        this.Model.BuyerId = first.buyerId;
        this.Model.JobId = first.jobId;
        this.Model.StyleId = first.styleId;
        this.Model.OrderId = first.orderId;

        this.batchHeader = {
          unitName: first.unitName,
          buyerName: first.buyerName,
          batchNo: first.batchNo,
          styleName: first.styleName,
          orderNo: first.orderNo,
          jobNo: first.jobNo,
          type: first.type,
          color: first.color,
          dressPart: first.dressPart,
          uom: first.uom,
          date: ''
        };

        // ✅ UNIQUE MACHINE + PROCESS
        const machineIds = [...new Set(res.map(x => x.machineId))];
        const processIds = [...new Set(res.map(x => x.processId))];

        // ✅ IMPORTANT: wait dropdown load
        setTimeout(() => {
          this.Model.machineList = machineIds;
          this.Model.processList = processIds;

          this.allSelectedMachine = this.isAllSelectedMachine();
          this.allSelectedProcess = this.isAllSelectedProcess();
        });

        // ✅ SET OPERATION LIST
        this.operationList = res;
        
        // ✅ APPLY SMART DATE/TIME LOGIC BASED ON CONDITIONS
        this.applySmartDateTimeLogic();

        console.log('Selected Machines:', this.Model.machineList);
        console.log('Selected Processes:', this.Model.processList);
      },

      error: () => {
        this.toastr.error('Failed to load batch data');
      }
    });
  }

  // ================= HELPER: Convert 24hr to 12hr AM/PM =================
  convertTo12Hour(time: string): string | null {
    if (!time) return null;
    
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minutes = minuteStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    hour = hour % 12;
    hour = hour ? hour : 12; // 0 should become 12
    
    const hourFormatted = hour.toString().padStart(2, '0');
    
    return `${hourFormatted}:${minutes} ${ampm}`; // e.g. "05:55 AM"
  }

  // ================= SUBMIT =================
  onSubmit() {

    // ================= VALIDATION =================
    if (!this.batchNo?.trim()) {
      this.toastr.warning('Batch No is required');
      return;
    }

    if (!this.Model?.machineList?.length) {
      this.toastr.warning('Select at least one machine');
      return;
    }

    if (!this.Model?.processList?.length) {
      this.toastr.warning('Select at least one process');
      return;
    }

    // ================= BUILD PAYLOAD =================
    const payload = {
      rows: [
        {
          unitId: this.Model.UnitId ?? 0,
          buyerId: this.Model.BuyerId ?? 0,
          batchNo: this.batchNo.trim(),

          processId: this.Model.processList.join(','),
          machineId: this.Model.machineList.join(','),

          startDate: this.startDate ? new Date(this.startDate).toISOString() : null,
          endDate: this.endDate ? new Date(this.endDate).toISOString() : null,

          startTime: this.convertTo12Hour(this.startTime),
          endTime: this.convertTo12Hour(this.endTime),

          createdBy: 'SYSTEM'
        }
      ]
    };

    console.log('FINAL PAYLOAD:', payload);

    // ================= API CALL =================
    this.service.saveWashStartEnd(payload).subscribe({
      next: (res: any) => {

        if (res?.isSuccess) {

          // ✅ SUCCESS MESSAGE
          this.toastr.success(res.message || 'Saved successfully');

          // ✅ UPDATE TABLE (IMPORTANT)
          this.operationList = res.data || [];

          // ✅ RE-APPLY DATE TIME LOGIC AFTER SAVE FOR NEXT OPERATION
          this.applySmartDateTimeLogic();

        } else {
          this.toastr.warning(res?.message || 'Save failed');
        }
      },

      error: (err) => {
        console.error(err);
        this.toastr.error('Server error occurred');
      }
    });
  }

  // ================= CLEAR =================
  onClear() {
    this.Model = {
      UnitId: null,
      BuyerId: null,
      JobId: null,
      StyleId: null,
      OrderId: null,
      trackingNo: '',
      batchNo: '',
      processList: [],
      machineList: []
    };

    this.batchNo = '';
    this.allSelectedMachine = false;
    this.allSelectedProcess = false;
    
    // Clear operation list
    this.operationList = [];
    
    // Reset to Page Load condition: Start = NOW, End = NULL
    this.setPageLoadDateTime();

    this.toastr.info('Form cleared');

    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
    }, 100);
  }
}
