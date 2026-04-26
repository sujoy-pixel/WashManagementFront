import {
  Component,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { CommonServiceService } from '../../../services/common-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-process-name-entry',
  templateUrl: './process-name-entry.component.html',
  styleUrls: ['./process-name-entry.component.scss'],
})
export class ProcessNameEntryComponent {

  saveButtonTitle = 'Save';
  currentFocus: string | null = null;

  UnitList: any[] = [];
  OperationList: any[] = [];
  priorityList: number[] = [];

  dataList: any[] = [];
  allDataList: any[] = [];

  isEdit = false;
  isSubmitting = false;

  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;

  Model: any = {
    processId: 0,
    unitId: null,
    operationId: null,
    processName: '',
    priority: null,
    activeStatus: true
  };

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.LoadUnit();
    this.loadOperations();
    this.loadData();
    this.priorityList = Array.from({ length: 50 }, (_, i) => i + 1);
  }

  // ================= LOAD =================

  LoadUnit() {
    this.UnitList = [];
    this.service.GetUnitName().subscribe((data: any[]) => {
      this.UnitList.push({ label: '--- Select ---', value: null });
      data.forEach(x => {
        this.UnitList.push({
          label: x.displayName,
          value: x.id
        });
      });
    });
  }

  loadOperations() {
    this.OperationList = [];
    this.service.GetOperationNameDDLs().subscribe(res => {
      this.OperationList.push({ label: '-- Select --', value: null });
      res.forEach(x => {
        this.OperationList.push({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id
        });
      });
    });
  }

  loadData() {
  this.service.GetProcessNameEntryList().subscribe({
    next: (res: any) => {

      this.allDataList = res ?? [];

      // optional safety mapping (prevents UI break)
      this.allDataList = this.allDataList.map(x => ({
        processId: x.processId,
        unitId: x.unitId,
        operationId: x.operationId,
        unitName: x.unitName,
        operationName: x.operationName,
        processName: x.processName,
        priority: x.priority,
        isActive: x.isActive
      }));

      this.totalRecords = this.allDataList.length;
      this.dataList = this.allDataList.slice(0, this.rows);
    },
    error: () => {
      this.toastr.error('Failed to load data');
    }
  });
}

  onPageChange(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.dataList = this.allDataList.slice(this.first, this.first + this.rows);
  }

  // ================= SUBMIT =================

  onSubmit() {

    if (!this.Model.unitId || !this.Model.unitId.value) {
      this.toastr.warning('Please Select Unit Name');
      return;
    }

    if (!this.Model.operationId) {
      this.toastr.warning('Please Select Operation');
      return;
    }

    if (!this.Model.processName?.trim()) {
      this.toastr.warning('Please Enter Process Name');
      return;
    }

    if (!this.Model.priority) {
      this.toastr.warning('Please Select Priority');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      operation: this.isEdit ? 'UPDATE' : 'INSERT',
      ProcessId: this.Model.processId,
      UnitId: this.Model.unitId.value,
      OperationId: this.Model.operationId,
      ProcessName: this.Model.processName.trim(),
      Priority: this.Model.priority,
      IsActive: this.Model.activeStatus ? 1 : 0
    };

    this.service.saveProcessNameEntryData(payload).subscribe({
      next: (res: any) => {

        const resultCode = res[0]?.resultCode ?? res?.resultCode;

        if (resultCode == -1) {
          this.toastr.warning('Duplicate Data Found');
          this.isSubmitting = false;
          return;
        }

        this.toastr.success(this.isEdit ? 'Updated Successfully' : 'Saved Successfully');

        this.onClear();
        this.loadData();
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Error occurred');
        this.isSubmitting = false;
      }
    });
  }

  // ================= EDIT =================

  edit(item: any) {
    this.isEdit = true;
    this.saveButtonTitle = 'UPDATE';

    this.Model = {
      processId: item.processId,
      unitId: this.UnitList.find(x => x.value === item.unitId),
      operationId: item.operationId,
      processName: item.processName,
      priority: item.priority,
      activeStatus: item.isActive == 1
    };

    this.cdr.detectChanges();
  }

  // ================= DELETE =================

  delete(item: any) {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {

        const payload = {
          operation: 'DELETE',
          ProcessId: item.processId
        };

        this.service.deleteProcessNameEntry(payload).subscribe({
          next: (res: any) => {
            if (res?.resultCode == '1') {
              this.toastr.success('Deleted successfully');
              this.loadData();
            } else {
              this.toastr.error('Delete failed');
            }
          }
        });
      }
    });
  }

  // ================= CLEAR =================

  onClear() {
    this.Model = {
      processId: 0,
      unitId: null,
      operationId: null,
      processName: '',
      priority: null,
      activeStatus: true
    };

    this.saveButtonTitle = 'Save';
    this.isEdit = false;
    this.cdr.detectChanges();
  }

  // ================= EXTRA (FIX ERRORS) =================

  setFocus(field: string) {
    this.currentFocus = field;
  }

  clearFocus() {
    this.currentFocus = null;
  }

  onUnitChange(event: any) {
    console.log(event);
  }

  onChangeActiveStatus(event: any) {
    this.Model.activeStatus = event.target.checked;
  }
}