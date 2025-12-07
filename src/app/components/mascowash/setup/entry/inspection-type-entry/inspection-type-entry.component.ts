import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WashSetupService } from '../../../services/washsetup.service';
import { CommonServiceService } from '../../../services/common-service';

@Component({
  selector: 'app-inspection-type-entry',
  templateUrl: './inspection-type-entry.component.html',
  styleUrls: ['./inspection-type-entry.component.scss']
})
export class InspectionTypeEntryComponent implements OnInit {

  Model: any = {
    TypeofInspectionId: 0,
    TypeName: '',
    IsActive: true
  };

  dataList: any[] = [];
  isEdit = false;
  saveButtonTitle: string = 'Save';
  isSubmitting = false;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Load all Type of Inspection
  loadData() {
    this.service.getAllTypeofInspection().subscribe({
      next: (res: any) => {
        this.dataList = res ?? [];
      },
      error: () => {
        this.toastr.error('Failed to load Type of Inspection data');
      }
    });
  }

  // Submit form for insert or update
  onSubmit() {
    if (!this.Model.TypeName?.trim()) {
      this.toastr.warning('Type Name is required', 'Warning');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      operation: this.isEdit ? 'UPDATE' : 'INSERT',
      typeofInspectionId: this.Model.TypeofInspectionId,
      typeName: this.Model.TypeName.trim(),
      isActive: this.Model.IsActive ? 1 : 0,
      createdBy: 'Admin'
    };

    this.service.TypeofInspectionService(payload).subscribe({
      next: (res: any) => {
        const resultCode = res[0]?.ResultCode;
        if (resultCode === -1) {
          this.toastr.warning('Type name already exists', 'Duplicate');
          this.isSubmitting = false;
          return;
        }

        this.toastr.success(
          this.isEdit ? 'Updated successfully' : 'Saved successfully',
          'Success'
        );

        this.resetForm();
        this.loadData();
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Submission failed', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  // Edit existing item
  edit(item: any) {
    this.isEdit = true;
    this.saveButtonTitle = 'Update';
    this.Model = {
      TypeofInspectionId: item.TypeofInspectionId,
      TypeName: item.typeName,
      IsActive: item.isActive == 1
    };
    this.cdr.detectChanges();
  }

  // Delete selected item
  delete(item: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          operation: 'DELETE',
          typeofInspectionId: item.TypeofInspectionId
        };

        this.service.TypeofInspectionService(payload).subscribe({
          next: (res: any) => {
            if (res[0]?.ResultCode === 1) {
              this.toastr.success('Deleted successfully', 'Success');
              this.loadData();
            } else {
              this.toastr.error('Delete failed', 'Error');
            }
          },
          error: () => {
            this.toastr.error('Delete failed', 'Error');
          }
        });
      }
    });
  }

  // Clear form
  onClear() {
    this.resetForm();
  }

  // Reset form to default
  resetForm() {
    this.isEdit = false;
    this.saveButtonTitle = 'Save';
    this.Model = {
      TypeofInspectionId: 0,
      TypeName: '',
      IsActive: true
    };
    this.cdr.detectChanges();
  }
}
