import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
  machineId?: number | string;
}

interface OperationHistory {
  id?: number;
  operation: string;
  processNames: string;
  machineNames: string;
  startDate: string | Date;
  startTime: string;
  endDate: string | Date | null;
  endTime: string | null;
  unitId?: number;
  buyerId?: number;
  jobId?: number;
  styleId?: number;
  orderId?: number;
  machineId?: number | string;
  processId?: number | string;
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
  operationList: OperationHistory[] = [];
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
    MachineId: null as number | null,

    processList: [] as number[],
    machineList: [] as number[]
  };

  buyerList: DropdownItem[] = [];
  UnitList: DropdownItem[] = [];

  // Track pending selections to apply after dropdowns load
  private pendingSelections = {
    machineIds: [] as number[],
    processIds: [] as number[]
  };

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadBuyerList();
    this.loadUnitList();
    this.loadProcessDDL();
    this.loadMachineDDL();
    this.setInitialDateTime();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
      this.batchInput?.nativeElement.select();
    }, 100);
  }

  // ================= DATE TIME LOGIC - FIXED =================
  
  private setInitialDateTime() {
    const now = new Date();
    this.startDate = now;
    this.startTime = this.formatTimeForInput(now);
    this.endDate = null;
    this.endTime = '';
  }

  /**
   * ✅ FIXED: Get latest operation by ID (not just date) to ensure correct order
   */
  private getLatestOperation(): OperationHistory | null {
    if (!this.operationList || this.operationList.length === 0) return null;

    // Sort by ID descending to get the most recent operation (highest ID = latest)
    // If same ID (shouldn't happen), fallback to date
    const sorted = [...this.operationList].sort((a, b) => {
      // Primary sort: ID descending (newest first)
      const idA = a.id || 0;
      const idB = b.id || 0;
      if (idB !== idA) return idB - idA;
      
      // Secondary sort: Start date descending
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });

    console.log('Sorted operations (latest first):', sorted.map(o => ({ 
      id: o.id, 
      operation: o.operation, 
      startDate: o.startDate,
      endDate: o.endDate 
    })));
    
    return sorted[0];
  }

  /**
   * ✅ FIXED SMART LOGIC: Correctly handles running vs completed operations
   */
  private determineDateTimeFromHistory() {
    const now = new Date();
    const timeString = this.formatTimeForInput(now);

    // Check if we have operation history data
    if (!this.operationList || this.operationList.length === 0) {
      console.log('No history - Fresh start: Start=NOW, End=NULL');
      this.startDate = now;
      this.startTime = timeString;
      this.endDate = null;
      this.endTime = '';
      return;
    }

    // Get the truly LATEST operation (by ID, not just date)
    const latestOperation = this.getLatestOperation();
    
    if (!latestOperation) {
      console.log('No valid latest operation');
      this.startDate = now;
      this.startTime = timeString;
      this.endDate = null;
      this.endTime = '';
      return;
    }

    console.log('Analyzing latest operation:', {
      id: latestOperation.id,
      operation: latestOperation.operation,
      startDate: latestOperation.startDate,
      startTime: latestOperation.startTime,
      endDate: latestOperation.endDate,
      endTime: latestOperation.endTime
    });

    // Check if operation has BOTH start AND end (completed)
    const hasStartDate = this.isValidDate(latestOperation.startDate);
    const hasStartTime = !!latestOperation.startTime && latestOperation.startTime.trim() !== '';
    const hasEndDate = this.isValidDate(latestOperation.endDate);
    const hasEndTime = !!latestOperation.endTime && latestOperation.endTime.trim() !== '';
    
    const hasCompleteStart = hasStartDate && hasStartTime;
    const hasCompleteEnd = hasEndDate && hasEndTime;

    console.log('Status flags:', { 
      hasCompleteStart, 
      hasCompleteEnd, 
      hasStartDate, 
      hasStartTime, 
      hasEndDate, 
      hasEndTime 
    });

    // Scenario 1: Running operation (Has Start, NO End) -> Ready to END it
    if (hasCompleteStart && !hasCompleteEnd) {
      console.log('✅ Operation RUNNING (ID:' + latestOperation.id + ') -> Ready to END: Start=NULL, End=NOW');
      this.startDate = null;      // Clear start
      this.startTime = '';        // Clear start time
      this.endDate = now;         // Set end to now
      this.endTime = timeString;  // Set end time to now
    } 
    // Scenario 2: Completed operation (Has Both) -> Ready for NEW operation
    else if (hasCompleteStart && hasCompleteEnd) {
      console.log('✅ Operation COMPLETED (ID:' + latestOperation.id + ') -> Ready for NEW: Start=NOW, End=NULL');
      this.startDate = now;
      this.startTime = timeString;
      this.endDate = null;
      this.endTime = '';
    }
    // Scenario 3: Invalid state (No Start, Has End) -> Reset
    else if (!hasCompleteStart && hasCompleteEnd) {
      console.log('⚠️ Invalid state -> Reset to Start=NOW');
      this.startDate = now;
      this.startTime = timeString;
      this.endDate = null;
      this.endTime = '';
    }
    // Scenario 4: Empty/Invalid (No Start, No End) -> Fresh start
    else {
      console.log('⚠️ Empty operation -> Fresh start: Start=NOW');
      this.startDate = now;
      this.startTime = timeString;
      this.endDate = null;
      this.endTime = '';
    }
  }

  private isValidDate(date: any): boolean {
    if (!date || date === null || date === undefined) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  private formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // ================= LOAD DDL =================
  loadProcessDDL(callback?: () => void) {
    this.service.GetProcessNameDDL().subscribe({
      next: (res: any) => {
        this.processList = res.map((x: any) => ({
          label: x.displayName || x.DisplayName || x.processName || x.ProcessName,
          value: Number(x.id || x.ID || x.processId || x.ProcessId)
        })).filter((x: any) => x.value > 0);
        
        if (this.pendingSelections.processIds.length > 0) {
          this.applyProcessSelection(this.pendingSelections.processIds);
          this.pendingSelections.processIds = [];
        }
        
        if (callback) callback();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading Process DDL:', err);
        if (callback) callback();
      }
    });
  }

  // loadMachineDDL(callback?: () => void) {
  //   this.service.GetMachineNoDDL().subscribe({
  //     next: (res: any) => {
  //       this.machineList = res.map((x: any) => ({
  //         label: x.displayName || x.DisplayName || x.machineName || x.MachineName,
  //         value: Number(x.id || x.ID || x.machineId || x.MachineId)
  //       })).filter((x: any) => x.value > 0);
        
  //       if (this.pendingSelections.machineIds.length > 0) {
  //         this.applyMachineSelection(this.pendingSelections.machineIds);
  //         this.pendingSelections.machineIds = [];
  //       }
        
  //       if (callback) callback();
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Error loading Machine DDL:', err);
  //       if (callback) callback();
  //     }
  //   });
  // }

  loadUnitList() {
    this.service.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));

      const found = this.UnitList.find(x => x.value === 60);
      if (found) this.Model.UnitId = 60;
    });
  }
  loadMachineDDL() {
    this.service.GetMachineNoDDL().subscribe(res => {
      this.machineList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName || x.MachineName,
        value: Number(x.ID || x.id || x.MachineId)
      }));

      if (this.buyerList.length === 1) {
        this.Model.BuyerId = Number(this.buyerList[0].value);
      }
    });
  }

  loadBuyerList() {
    this.service.GetBuyerNameDDL().subscribe(res => {
      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName || x.BuyerName,
        value: Number(x.ID || x.id || x.BuyerNo)
      }));

      if (this.buyerList.length === 1) {
        this.Model.BuyerId = Number(this.buyerList[0].value);
      }
    });
  }

  // ================= SELECTION HANDLERS =================
  onSelectionChangeMachine() {
    this.Model.machineList = this.Model.machineList.filter(x => x !== 0 && x !== null);
    this.allSelectedMachine = this.isAllSelectedMachine();
    this.cdr.detectChanges();
  }

  toggleAllSelectionMachine() {
    this.allSelectedMachine = !this.allSelectedMachine;
    if (this.allSelectedMachine) {
      this.Model.machineList = this.machineList.map(x => x.value);
    } else {
      this.Model.machineList = [];
    }
    this.cdr.detectChanges();
  }

  isAllSelectedMachine(): boolean {
    return this.machineList.length > 0 && this.Model.machineList.length === this.machineList.length;
  }

  onSelectionChangeProcess() {
    this.Model.processList = this.Model.processList.filter(x => x !== 0 && x !== null);
    this.allSelectedProcess = this.isAllSelectedProcess();
    this.cdr.detectChanges();
  }

  toggleAllSelectionProcess() {
    this.allSelectedProcess = !this.allSelectedProcess;
    if (this.allSelectedProcess) {
      this.Model.processList = this.processList.map(x => x.value);
    } else {
      this.Model.processList = [];
    }
    this.cdr.detectChanges();
  }

  isAllSelectedProcess(): boolean {
    return this.processList.length > 0 && this.Model.processList.length === this.processList.length;
  }

  // ================= LOAD BATCH (MAIN LOGIC) =================
  loadBatchData() {
    const batch = this.batchNo?.trim();
    if (!batch) {
      this.toastr.warning('Please enter Batch No');
      return;
    }

    // Reset selections
    this.pendingSelections = { machineIds: [], processIds: [] };
    this.Model.machineList = [];
    this.Model.processList = [];
    this.allSelectedMachine = false;
    this.allSelectedProcess = false;

    // Load batch data
    this.service.getBatchWishStartEndData(batch).subscribe({
      next: (res: any) => {
        if (!res || (Array.isArray(res) && res.length === 0)) {
          this.toastr.warning('No data found for this batch');
          this.operationList = [];
          this.determineDateTimeFromHistory();
          return;
        }

        const responseData = Array.isArray(res) ? res : res.data || [];
        
        if (responseData.length === 0) {
          this.toastr.warning('No header data found');
          this.operationList = [];
          this.determineDateTimeFromHistory();
          return;
        }

        const first = responseData[0];

        // Bind Header
        this.Model.UnitId = first.unitId ?? first.UnitId ?? null;
        this.Model.BuyerId = first.buyerId ?? first.BuyerId ?? null;
        this.Model.JobId = first.jobId ?? first.JobId ?? null;
        this.Model.StyleId = first.styleId ?? first.StyleId ?? null;
        this.Model.OrderId = first.orderId ?? first.OrderId ?? null;

        this.batchHeader = {
          unitId: first.unitId ?? first.UnitId,
          buyerId: first.buyerId ?? first.BuyerId,
          styleId: first.styleId ?? first.StyleId,
          orderId: first.orderId ?? first.OrderId,
          jobId: first.jobId ?? first.JobId,
          unitName: first.unitName || first.UnitName || '',
          buyerName: first.buyerName || first.BuyerName || '',
          batchNo: first.batchNo || first.BatchNo || batch,
          styleName: first.styleName || first.StyleName || '',
          orderNo: first.orderNo || first.OrderNo || '',
          jobNo: first.jobNo || first.JobNo || '',
          type: first.type || first.Type || '',
          color: first.color || first.Color || '',
          dressPart: first.dressPart || first.DressPart || '',
          uom: first.uom || first.UOM || '',
          date: first.date || first.Date || ''
        };

        // Extract IDs
        const machineIds = this.extractUniqueIds(responseData, ['machineId', 'MachineId']);
        const processIds = this.extractUniqueIds(responseData, ['processId', 'ProcessId']);

        this.pendingSelections = { machineIds, processIds };

        if (this.machineList.length > 0) {
          this.applyMachineSelection(machineIds);
        }
        if (this.processList.length > 0) {
          this.applyProcessSelection(processIds);
        }

        if (this.machineList.length === 0 || this.processList.length === 0) {
          this.loadProcessDDL();
          this.loadMachineDDL();
        }

        // Load Operation History
        this.loadOperationHistory(batch);
      },

      error: (err) => {
        console.error('Error loading batch:', err);
        this.toastr.error('Failed to load batch data');
        this.operationList = [];
        this.determineDateTimeFromHistory();
      }
    });
  }

  private extractUniqueIds(data: any[], fields: string[]): number[] {
    const ids = new Set<number>();
    
    data.forEach((item: any) => {
      fields.forEach(field => {
        const val = item[field];
        if (val !== null && val !== undefined && val !== '') {
          const parts = String(val).split(',').map((s: string) => s.trim());
          parts.forEach((part: string) => {
            const num = Number(part);
            if (!isNaN(num) && num > 0) {
              ids.add(num);
            }
          });
        }
      });
    });
    
    return Array.from(ids);
  }

  private applyMachineSelection(ids: number[]) {
    if (this.machineList.length === 0) {
      this.pendingSelections.machineIds = ids;
      return;
    }

    const validIds = ids.filter(id => 
      this.machineList.some(m => Number(m.value) === Number(id))
    );
    
    this.Model.machineList = validIds;
    this.allSelectedMachine = this.isAllSelectedMachine();
    this.cdr.detectChanges();
  }

  private applyProcessSelection(ids: number[]) {
    if (this.processList.length === 0) {
      this.pendingSelections.processIds = ids;
      return;
    }

    const validIds = ids.filter(id => 
      this.processList.some(p => Number(p.value) === Number(id))
    );
    
    this.Model.processList = validIds;
    this.allSelectedProcess = this.isAllSelectedProcess();
    this.cdr.detectChanges();
  }

  private loadOperationHistory(batch: string) {
    this.service.getStartEndOperationData(batch).subscribe({
      next: (historyRes: any) => {
        const historyData = Array.isArray(historyRes) ? historyRes : (historyRes?.data || []);
        
        if (historyData && historyData.length > 0) {
          this.operationList = historyData.map((item: any) => ({
            id: item.id || item.ID,
            operation: item.operation || item.Operation || 'Wash',
            processNames: item.processNames || item.ProcessNames || '',
            machineNames: item.machineNames || item.MachineNames || '',
            startDate: item.startDate || item.StartDate,
            startTime: item.startTime || item.StartTime,
            endDate: item.endDate || item.EndDate || null,
            endTime: item.endTime || item.EndTime || null,
            unitId: item.unitId || item.UnitId,
            buyerId: item.buyerId || item.BuyerId,
            jobId: item.jobId || item.JobId,
            styleId: item.styleId || item.StyleId,
            orderId: item.orderId || item.OrderId,
            machineId: item.machineId || item.MachineId,
            processId: item.processId || item.ProcessId
          }));
        } else {
          this.operationList = [];
        }
        
        // After loading history, determine what dates/times to show
        this.determineDateTimeFromHistory();
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.operationList = [];
        this.determineDateTimeFromHistory();
      }
    });
  }

  // ================= HELPER =================
  convertTo12Hour(time: string): string | null {
    if (!time) return null;
    const [hourStr, minuteStr] = time.split(':');
    if (!hourStr || !minuteStr) return null;
    let hour = parseInt(hourStr, 10);
    const minutes = minuteStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  // ================= SUBMIT =================
  onSubmit() {
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

    if (!this.startDate && !this.endDate) {
      this.toastr.warning('Please enter either Start or End Date/Time');
      return;
    }

    const payload = {
      rows: [{
        unitId: this.Model.UnitId ?? 0,
        buyerId: this.Model.BuyerId ?? 0,
        batchNo: this.batchNo.trim(),
        processId: this.Model.processList.join(','),
        machineId: this.Model.MachineId,
        startDate: this.startDate ? new Date(this.startDate).toISOString() : null,
        endDate: this.endDate ? new Date(this.endDate).toISOString() : null,
        startTime: this.convertTo12Hour(this.startTime),
        endTime: this.convertTo12Hour(this.endTime),
        createdBy: 'SYSTEM'
      }]
    };

    this.service.saveWashStartEnd(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toastr.success('Saved successfully');
          if (res.data && Array.isArray(res.data)) {
            this.operationList = res.data.map((item: any) => ({
              id: item.id || item.ID,
              operation: item.operation || item.Operation || 'Wash',
              processNames: item.processNames || item.ProcessNames || '',
              machineNames: item.machineNames || item.MachineNames || '',
              startDate: item.startDate || item.StartDate,
              startTime: item.startTime || item.StartTime,
              endDate: item.endDate || item.EndDate || null,
              endTime: item.endTime || item.EndTime || null,
              unitId: item.unitId || item.UnitId,
              buyerId: item.buyerId || item.BuyerId,
              jobId: item.jobId || item.JobId,
              styleId: item.styleId || item.StyleId,
              orderId: item.orderId || item.OrderId,
              machineId: item.machineId || item.MachineId,
              processId: item.processId || item.ProcessId
            }));
            this.determineDateTimeFromHistory();
          } else {
            this.loadOperationHistory(this.batchNo);
          }
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
      MachineId: null,
      trackingNo: '',
      batchNo: '',
      processList: [],
      machineList: []
    };

    this.batchNo = '';
    this.allSelectedMachine = false;
    this.allSelectedProcess = false;
    this.operationList = [];
    this.pendingSelections = { machineIds: [], processIds: [] };
    
    this.batchHeader = {
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
    
    this.setInitialDateTime();
    this.toastr.info('Form cleared');

    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
      this.batchInput?.nativeElement.select();
    }, 100);
  }
}
