import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { WashSetupService } from '../../../services/washsetup.service';
import { CommonServiceService } from '../../../services/common-service';
import { NgZone } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-process-name-entry',
  templateUrl: './process-name-entry.component.html',
  styleUrls: ['./process-name-entry.component.scss'],
})
export class ProcessNameEntryComponent {
  CompanyBankInfoForm: FormGroup | any;
  title: string | any;
  spinnerName = 'createGroup';
  noResult: boolean = false;
  model: any = null;
  // toastr: any;
  numbers: number[] = [];
  saveButtonTitle = 'Save';
  currentFocus: string | null = null;

  UnitList: any = [];
  BankList: any = [];
  BranchList: any = [];
  priorityList: number[] = [];
  dataList: any[] = [];
  isEdit = false;
  isSubmitting = false;

  getCompanyBankList: any;
  getCompanyBankListDataKey: any;
  getProcessNameEntryList: any;
  getProcessNameEntryListDataKey: any;
  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // this.bsConfig = {
    //   dateInputFormat: 'YYYY-MM-DD', // Your desired date format
    // };
  }

  Model: any = {
    unitId: null,
    activeStatus: true,
    processName: null,
    priority: null,
    processId: null,
  };

  async ngOnInit() {
    this.LoadUnit();
    this.loadData();
    this.Model.activeStatus = true;
    this.priorityList = Array.from({ length: 50 }, (_, i) => i + 1);
  }

  onChangeActiveStatus(event: any) {
    this.Model.activeStatus = event.target.checked;
  }

  //////////////////////////Load Dropdown Start//////////////////////
  LoadUnit() {
    this.UnitList = [];
    this.service.GetUnitName().subscribe(
      (data: any[]) => {
        console.log('UnitId;', data);
        this.UnitList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.UnitList.push({
            label: data[i].displayName,
            value: data[i].id,
          });
        }
      },
      (error) => {}
    );
  }
  onUnitChange(event) {
    console.log('==', event);
  }

  /////////////////////Change Event End/////////////////
  onSubmit() {
    console.log('submit show model', this.Model);

    // VALIDATIONS (Clean format)
    if (!this.Model.unitId || !this.Model.unitId.value) {
      this.toastr.warning('Please Select Unit Name', 'Warning');
      return;
    }

    if (!this.Model.processName?.trim()) {
      this.toastr.warning('Please Enter Proper Process Name', 'Warning');
      return;
    }

    if (!this.Model.priority || this.Model.priority === 0) {
      this.toastr.warning('Please Enter Priority', 'Warning');
      return;
    }

    this.isSubmitting = true;

    // INSERT OR UPDATE logic (clean style)
    this.isEdit = !(
      this.Model.processId === 0 || this.Model.processId === null
    );

    const payload = {
      operation: this.isEdit ? 'UPDATE' : 'INSERT',
      ProcessId: this.Model.processId ?? 0,
      UnitId: this.Model.unitId.value,
      ProcessName: this.Model.processName.trim(),
      Priority: this.Model.priority,
      IsActive: this.Model.activeStatus ? 1 : 0,
    };

    console.log('payload', payload);

    this.service.saveProcessNameEntryData(payload).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        const resultCode = res[0]?.resultCode ?? res?.resultCode;

        if (resultCode === -1 || resultCode === '-1') {
          this.toastr.warning('Duplicate Data Found', 'Process Name Entry');
          this.isSubmitting = false;
          return;
        }

        this.toastr.success(
          this.isEdit ? 'Updated Successfully' : 'Submitted Successfully',
          'Process Name Entry'
        );

        this.onClear();
        this.loadData();

        this.isSubmitting = false;
        this.cdr.detectChanges();
      },

      error: () => {
        this.toastr.error('Submission Error', 'Process Name Entry');
        this.isSubmitting = false;
      },
    });
  }

  loadData() {
    this.service.GetProcessNameEntryList().subscribe({
      next: (res: any) => {
        console.log('dataList:', res);
        this.dataList = res ?? [];
      },
      error: () => {
        this.toastr.error('Failed to load Type of Inspection data');
      },
    });
  }

  setFocus(field: string): void {
    setTimeout(() => {
      this.currentFocus = field;

      const element = document.querySelector(
        `input[ng-reflect-name="${field}"]`
      );
      if (element) {
        (element as HTMLInputElement).focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // After focus, force change detection if necessary
      this.cdr.detectChanges();
    }, 0);
  }
  // Method to clear the current focus
  clearFocus(): void {
    this.currentFocus = null;
  }

  onClear() {
    this.Model = {
      processId: 0, // reset for new entry
      unitId: null,
      processName: '',
      priority: null,
      activeStatus: true,
    };

    this.saveButtonTitle = 'Save';
    this.isEdit = false; // in case edit mode was active
    this.cdr.detectChanges();
  }

  edit(item: any) {
    this.isEdit = true;
    this.saveButtonTitle = 'UPDATE';
    this.Model = {
      TypeofInspectionId: item.typeofInspectionId,
      TypeName: item.typeName,
      IsActive: item.isActive == 1,
    };
    this.cdr.detectChanges();
  }

  delete(item: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          operation: 'DELETE',
          TypeofInspectionId: item.typeofInspectionId,

          // typeofInspectionId: item.TypeofInspectionId
        };

        this.service.TypeofInspectionService(payload).subscribe({
          next: (res: any) => {
            //console.log('resDelete', res);
            if (res?.resultCode === '1') {
              this.toastr.success('Deleted successfully', 'Success');
              this.loadData();
            } else {
              this.toastr.error('Delete failed', 'Error');
            }
          },
          error: () => {
            this.toastr.error('Delete failed', 'Error');
          },
        });
      }
    });
  }
}
