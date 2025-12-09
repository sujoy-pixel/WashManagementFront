import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WashSetupService } from '../../../services/washsetup.service';
import { CommonServiceService } from '../../../services/common-service';

@Component({
  selector: 'app-inspection-area-entry',
  templateUrl: './inspection-area-entry.component.html',
  styleUrls: ['./inspection-area-entry.component.scss']
})
export class InspectionAreaEntryComponent implements OnInit {

  // ================= MODEL =================
  Model: any = {
    InspectionAreaId: 0,
    InspectionArea: '',
    Priority: null,
    IsActive: true
  };

  dataList: any[] = [];
  priorityList: number[] = [];
  isEdit = false;
  saveButtonTitle: string = 'Save';
  isSubmitting = false;

  // ================= FOCUS HANDLER =================
  currentFocus: string | null = null;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Generate priority list 1-50
    this.priorityList = Array.from({ length: 50 }, (_, i) => i + 1);
    this.loadData();
  }

  // ================= LOAD DATA =================
  loadData() {
    this.service.getInspectionAreaLists().subscribe({
      next: (res: any) => {
        this.dataList = res ?? [];
      },
      error: () => {
        this.toastr.error('Failed to load Inspection Area data', 'Error');
      }
    });
  }

  // ================= SUBMIT (INSERT / UPDATE) =================
  onSubmit() {
    if (!this.Model.InspectionArea?.trim()) {
      this.toastr.warning('Area Name is required', 'Warning');
      return;
    }

    if (!this.Model.Priority) {
      this.toastr.warning('Priority is required', 'Warning');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      Operation: this.isEdit ? 'UPDATE' : 'INSERT',
      InspectionAreaId: this.Model.InspectionAreaId,
      InspectionArea: this.Model.InspectionArea.trim(),
      Priority: this.Model.Priority,
      IsActive: this.Model.IsActive ? 1 : 0,
      CreatedBy: 'Admin'
    };

    this.service.saveInspectionAreaEntry(payload).subscribe({
      next: (res: any) => {
        const resultCode = res[0]?.ResultCode;

        if (resultCode === -1) {
          this.toastr.warning('Area Name already exists', 'Duplicate');
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

  // ================= EDIT =================
  edit(item: any) {
    this.isEdit = true;
    this.saveButtonTitle = 'UPDATE';

    this.Model = {
      InspectionAreaId: item.inspectionAreaId,
      InspectionArea: item.inspectionArea,
      Priority: item.priority,
      IsActive: item.isActive === 1
    };

    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================= DELETE =================
  delete(item: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this area?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          Operation: 'DELETE',
          InspectionAreaId: item.inspectionAreaId,
          CreatedBy: 'Admin'
        };

        this.service.saveInspectionAreaEntry(payload).subscribe({
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

  // ================= RESET FORM =================
  resetForm() {
    this.isEdit = false;
    this.saveButtonTitle = 'Save';

    this.Model = {
      InspectionAreaId: 0,
      InspectionArea: '',
      Priority: null,
      IsActive: true
    };

    this.cdr.detectChanges();
  }

  onClear() {
    this.resetForm();
  }

  // ================= FOCUS METHODS =================
  setFocus(field: string): void {
    this.currentFocus = field;
    this.cdr.detectChanges();
  }

  clearFocus(): void {
    this.currentFocus = null;
    this.cdr.detectChanges();
  }
}
