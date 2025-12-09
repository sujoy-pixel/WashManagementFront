import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WashSetupService } from '../../../services/washsetup.service';

@Component({
  selector: 'app-fault-name-layout',
  templateUrl: './fault-name-layout.component.html',
  styleUrls: ['./fault-name-layout.component.scss']
})
export class FaultNameLayoutComponent {

  priorityList: number[] = [];
  faultHeadList: any[] = [];
  dataList: any[] = [];

  saveButtonTitle = "Save";
  isEdit = false;
  currentFocus: string | null = null;

  Model: any = {
    FaultNameId: 0,
    FaultHeadId: null,
    FaultName: "",
    CodeNo: 0,     // INT VALUE
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
    this.loadFaultHeads();
    this.loadData();
  }

  // LOAD Fault Head LIST
  loadFaultHeads() {
    this.service.getFaultHeadList().subscribe({
      next: (res: any) => {
        this.faultHeadList = res.map((x: any) => ({
          ID: x.id ?? x.ID,
          DisplayName: x.displayName ?? x.DisplayName
        }));
      },
      error: () => this.toastr.error("Failed to load Fault Head list")
    });
  }

  // SUBMIT FORM
  onSubmit() {
    if (!this.Model.FaultHeadId) {
      this.toastr.warning("Select Fault Head");
      return;
    }
    if (!this.Model.FaultName?.trim()) {
      this.toastr.warning("Enter Fault Name");
      return;
    }
    if (!this.Model.Priority) {
      this.toastr.warning("Select Priority");
      return;
    }

    const payload = {
      Operation: this.isEdit ? "UPDATE" : "INSERT",
      FaultNameId: this.Model.FaultNameId,
      FaultHeadId: this.Model.FaultHeadId,
      FaultName: this.Model.FaultName.trim(),

      // IMPORTANT FIX: INTEGER VALUE
      CodeNo: Number(this.Model.CodeNo) || 0,

      Priority: this.Model.Priority,
      IsActive: this.Model.IsActive ? 1 : 0
    };

    this.service.saveFaultName(payload).subscribe({
      next: (res: any) => {
        const resultCode = res[0]?.resultCode ?? res.resultCode;

        if (resultCode == -1) {
          this.toastr.warning("Duplicate Fault Name found!");
          return;
        }

        this.toastr.success(this.isEdit ? "Updated Successfully" : "Saved Successfully");

        this.onClear();
        this.loadData();
      },
      error: () => this.toastr.error("Error saving data")
    });
  }

  // LOAD GRID LIST
  loadData() {
    this.service.getFaultNameList().subscribe({
      next: (res: any) => {
        this.dataList = res.map((x: any) => ({
          FaultNameId: x.faultNameId,
          faultHeadId: x.faultHeadId,
          faultHeadName: x.faultHeadName,
          faultName: x.faultName,

          // FIXED: CodeNo is INT & JSON key = codeNo
          codeNo: Number(x.codeNo) || 0,

          priority: x.priority,
          isActive: x.isActive
        }));
      },
      error: () => this.toastr.error("Failed to load list")
    });
  }

  // EDIT FUNCTION
  edit(item: any) {
    this.isEdit = true;
    this.saveButtonTitle = "Update";

    this.Model = {
      FaultNameId: item.FaultNameId,
      FaultHeadId: item.faultHeadId,
      FaultName: item.faultName,

      // INT VALUE
      CodeNo: Number(item.codeNo),

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
          Operation: "DELETE",
          FaultNameId: item.FaultNameId
        };

        this.service.deleteFaultName(payload).subscribe({
          next: () => {
            this.toastr.success("Deleted Successfully");
            this.loadData();
          },
          error: () => this.toastr.error("Delete failed")
        });
      }
    });
  }

  // CLEAR FORM
  onClear() {
    this.Model = {
      FaultNameId: 0,
      FaultHeadId: null,
      FaultName: "",
      CodeNo: 0,   // reset as INT
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
