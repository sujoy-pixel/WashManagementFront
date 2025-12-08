import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { CommonServiceService } from '../../../services/common-service';

@Component({
  selector: 'app-inspection-area-entry',
  templateUrl: './inspection-area-entry.component.html',
  styleUrls: ['./inspection-area-entry.component.scss']
})
export class InspectionAreaEntryComponent {

  saveButtonTitle = 'Save';
  priorityList: number[] = [];
  currentFocus: string | null = null;

  inspectionAreaList: any[] = [];

  Model: any = {
    InspectionAreaId: null,
    InspectionArea: null,
    Priority: null,
    IsActive: true
  };

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.priorityList = Array.from({ length: 50 }, (_, i) => i + 1);
    this.loadData();
  }

  // ================= LOAD DATA =================
  loadData() {
    this.service.getInspectionAreaList().subscribe({
      next: (res: any) => this.inspectionAreaList = res ?? [],
      error: () => this.toastr.error('Failed to load Inspection Areas', 'Error')
    });
  }

  // ================= SAVE / UPDATE =================
  onSubmit() {
    if (!this.Model.InspectionArea || this.Model.InspectionArea.trim() === '') {
      this.toastr.warning('Please enter Area Name');
      return;
    }

    if (!this.Model.Priority) {
      this.toastr.warning('Please select Priority');
      return;
    }

    const payload = {
      Operation: this.Model.InspectionAreaId ? 'UPDATE' : 'INSERT',
      InspectionAreaId: this.Model.InspectionAreaId ?? 0,
      InspectionArea: this.Model.InspectionArea.trim(),
      Priority: this.Model.Priority,
      IsActive: this.Model.IsActive ? 1 : 0,
      CreatedBy: 'Admin'
    };

    this.service.saveInspectionAreaEntry(payload).subscribe({
      next: (res: any) => {
        const resultCode = res?.ResultCode;

        if (resultCode === "-1") {
          this.toastr.error('Duplicate Area Name!', 'Error');
          return;
        }

        if (!this.Model.InspectionAreaId)
          this.toastr.success('Saved Successfully');
        else
          this.toastr.success('Updated Successfully');

        this.onClear();
        this.loadData();
      },
      error: () => this.toastr.error('Submission failed', 'Error')
    });
  }

  // ================= EDIT =================
  editInspectionArea(row: any) {
    this.Model = {
      InspectionAreaId: row.InspectionAreaId,
      InspectionArea: row.InspectionArea,
      Priority: row.Priority,
      IsActive: row.IsActive === 1
    };

    this.saveButtonTitle = 'Update';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ================= DELETE (FIXED) =================
  deleteInspectionArea(row: any) {

    if (!confirm('Are you sure you want to delete this area?')) return;

    const payload = {
      Operation: 'DELETE',
      InspectionAreaId: row.InspectionAreaId,
      InspectionArea: row.InspectionArea,
      Priority: row.Priority,
      IsActive: row.IsActive,
      CreatedBy: 'Admin'
    };

    this.service.saveInspectionAreaEntry(payload).subscribe({
      next: () => {
        this.toastr.success('Deleted Successfully');
        this.loadData();
      },
      error: () => this.toastr.error('Delete failed', 'Error')
    });
  }

  // ================= CLEAR FORM =================
  onClear() {
    this.Model = {
      InspectionAreaId: null,
      InspectionArea: null,
      Priority: null,
      IsActive: true
    };

    this.saveButtonTitle = 'Save';
  }

  // ================= FOCUS HANDLER =================
  setFocus(field: string): void {
    setTimeout(() => {
      this.currentFocus = field;
      this.cdr.detectChanges();
    });
  }

  clearFocus(): void {
    this.currentFocus = null;
  }
}
