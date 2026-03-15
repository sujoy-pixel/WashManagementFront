import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WashSetupService } from '../../../services/washsetup.service';

@Component({
  selector: 'app-inspection-area-entry',
  templateUrl: './inspection-area-entry.component.html',
  styleUrls: ['./inspection-area-entry.component.scss']
})
export class InspectionAreaEntryComponent {

  priorityList: number[] = [];
 // dataList: any[] = [];

  saveButtonTitle = "Save";
  isEdit = false;
  currentFocus: string | null = null;

  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;
  dataList: any[] = [];
  inspectionDataList: any[] = [];

  Model: any = {
    InspectionAreaId: 0,
    InspectionArea: "",
    Priority: null,
    IsActive: true
  };

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.priorityList = Array.from({ length: 50 }, (_, i) => i + 1);
    this.loadData();
  }

  // SUBMIT FORM
  onSubmit() {
    if (!this.Model.InspectionArea?.trim()) {
      this.toastr.warning("Enter Area Name");
      return;
    }
    if (!this.Model.Priority) {
      this.toastr.warning("Select Priority");
      return;
    }

    const payload = {
      operation: this.isEdit ? "UPDATE" : "INSERT",
      inspectionAreaId: this.Model.InspectionAreaId,
      inspectionArea: this.Model.InspectionArea,
      priority: this.Model.Priority,
      isActive: this.Model.IsActive ? 1 : 0
    };

    this.service.saveInspectionAreaEntry(payload).subscribe({
      next: (res: any) => {
        const resultCode = res[0]?.resultCode ?? res.resultCode;

        if (resultCode == -1) {
          this.toastr.warning("Duplicate Area Name!");
          return;
        }

        this.toastr.success(this.isEdit ? "Updated Successfully" : "Saved Successfully");

        this.onClear();
        this.loadData();
      },
      error: () => this.toastr.error("Error saving data")
    });
  }

  // LOAD LIST  
  loadData() {
    this.service.getInspectionAreaLists().subscribe({
      next: (res: any) => {
        this.inspectionDataList = res.map((x: any) => ({
          inspectionAreaId: x.inspectionAreaId,
          inspectionArea: x.inspectionArea,
          priority: x.priority,
          isActive: x.isActive
        }));

        // this.inspectionDataList = res ?? [];
        this.totalRecords = this.inspectionDataList.length;

        this.dataList = this.inspectionDataList.slice(0, this.rows);
      },
      error: () => this.toastr.error("Failed to load list")
    });
  }

  onPageChange(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.dataList = this.inspectionDataList.slice(this.first, this.first + this.rows);
  }

  // EDIT RECORD
  edit(item: any) {
    this.isEdit = true;
    this.saveButtonTitle = "Update";

    this.Model = {
      InspectionAreaId: item.inspectionAreaId,
      InspectionArea: item.inspectionArea,
      Priority: item.priority,
      IsActive: item.isActive
    };

    this.cdr.detectChanges();
  }

  // DELETE RECORD
  delete(item: any) {
    Swal.fire({
      title: "Delete?",
      text: "Are you sure to delete?",
      icon: "warning",
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {

        const payload = {
          operation: "DELETE",
          inspectionAreaId: item.inspectionAreaId
        };

        this.service.deleteInspectionArea(payload).subscribe({
          next: () => {
            this.toastr.success("Deleted Successfully");
            this.loadData();
          },
          error: () => this.toastr.error("Delete failed")
        });

      }
    });
  }

  // RESET FORM
  onClear() {
    this.Model = {
      InspectionAreaId: 0,
      InspectionArea: "",
      Priority: null,
      IsActive: true
    };

    this.saveButtonTitle = "Save";
    this.isEdit = false;
  }

  // FOCUS BORDER
  setFocus(f: string) { this.currentFocus = f; }
  clearFocus() { this.currentFocus = null; }

}
