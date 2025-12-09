import { Component, ChangeDetectorRef } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { WashSetupService } from '../../../services/washsetup.service';
import { CommonServiceService } from '../../../services/common-service';
import { NgZone } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fault-head-name-entry',
  templateUrl: './fault-head-name-entry.component.html',
  styleUrls: ['./fault-head-name-entry.component.scss'],
})
export class FaultHeadNameEntryComponent {
  model: any = null;
  // toastr: any;
  numbers: number[] = [];
  saveButtonTitle = 'Save';
  currentFocus: string | null = null;

  priorityList: number[] = [];
  dataList: any[] = [];
  isEdit = false;
  isSubmitting = false;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  Model: any = {
    activeStatus: true,
    codeNo: null,
    priority: null,
    faultHeadId: null,
    faultHeadName: null,
  };

  async ngOnInit() {
    this.Model.activeStatus = true;
    this.priorityList = Array.from({ length: 50 }, (_, i) => i + 1);
    this.loadData();
  }
  onChangeActiveStatus(event: any) {
    this.Model.activeStatus = event.target.checked;
  }

  onSubmit() {
    console.log('submit show model', this.Model);

    // VALIDATIONS (Clean format)

    if (!(this.Model.faultHeadName ?? '').toString().trim()) {
      this.toastr.warning('Please Enter Proper Fault Head Name', 'Warning');
      return;
    }

    if (!(this.Model.codeNo ?? '').toString().trim()) {
      this.toastr.warning('Please Enter Proper Code No.', 'Warning');
      return;
    }

    if (!this.Model.priority || this.Model.priority === 0) {
      this.toastr.warning('Please Enter Priority', 'Warning');
      return;
    }

    this.isSubmitting = true;

    // INSERT OR UPDATE logic (clean style)
    this.isEdit = !(
      this.Model.faultHeadId === 0 || this.Model.faultHeadId === null
    );

    const payload = {
      Operation: this.isEdit ? 'UPDATE' : 'INSERT',
      FaultHeadId: this.Model.faultHeadId ?? 0,
      CodeNo: this.Model.codeNo,
      FaultHeadName: (this.Model.faultHeadName ?? '').toString().trim(),
      Priority: this.Model.priority,
      IsActive: this.Model.activeStatus ? 1 : 0,
    };

    console.log('payload', payload);

    this.service.saveFaultHeadEntryData(payload).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        const resultCode = res[0]?.resultCode ?? res?.resultCode;

        if (resultCode === -1 || resultCode === '-1') {
          this.toastr.warning('Duplicate Data Found', 'Fault Head Entry');
          this.isSubmitting = false;
          return;
        }

        this.toastr.success(
          this.isEdit ? 'Updated Successfully' : 'Submitted Successfully',
          'Fault Head Entry'
        );

        this.onClear();
        this.loadData();

        this.isSubmitting = false;
        this.cdr.detectChanges();
      },

      error: () => {
        this.toastr.error('Submission Error', 'Fault Head Entry');
        this.isSubmitting = false;
      },
    });
  }

  loadData() {
    this.service.GetFaultHeadList().subscribe({
      next: (res: any) => {
        console.log('dataList:', res);
        this.dataList = res ?? [];
      },
      error: () => {
        this.toastr.error('Failed to load Fault Head data');
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
      faultHeadId: 0, // reset for new entry
      faultHeadName: null,
      codeNo: null,
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
      faultHeadId: item.faultHeadId,
      faultHeadName: item.faultHeadName,
      codeNo: item.codeNo,
      priority: item.priority,
      activeStatus: item.isActive == 1,
    };
    console.log('Edit Model Test', this.Model);
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
          FaultHeadId: item.faultHeadId,
        };

        this.service.deleteFaultHeadEntryData(payload).subscribe({
          next: (res: any) => {
            if (res?.resultCode === '1') {
              this.toastr.success('Deleted successfully');
              this.loadData();
            } else {
              this.toastr.error('Delete failed');
            }
          },
          error: () => {
            this.toastr.error('Delete failed');
          },
        });
      }
    });
  }
}
