
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { de } from 'date-fns/locale';
@Component({
  selector: 'app-fault-wise-value-tag-entry',
  templateUrl: './fault-wise-value-tag-entry.component.html',
  styleUrls: ['./fault-wise-value-tag-entry.component.scss'],
})
export class FaultWiseValueTagEntryComponent {

  // ================= DROPDOWNS =================
  InspectionTypeList: any[] = [];
  InspectionHeadList: any[] = [];
  FaultHeadList: any[] = [];

  // ================= TABLE =================
  FaultWiseList: any[] = [];
  selectAll = false;

  // ================= MODEL =================
  Model: any = {
    InspectionType: null,
    InspectionHead: null,
    FaultHead: null
  };

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService
  ) {}

  // =================================================
  ngOnInit(): void {
    this.loadInspectionType();
    this.loadInspectionHead();
    this.loadFaultHead();
  }

  // =================================================
  // LOAD DROPDOWNS
  // =================================================

  loadInspectionType() {
    this.service.GetInspectionTypeDdl().subscribe(res => {
      this.InspectionTypeList = res.map((x: any) => ({
        label: x.displayName,
        value: x.id
      }));
    });
  }

  loadInspectionHead() {
    this.service.GetInspectionHeadDdl().subscribe(res => {
      this.InspectionHeadList = res.map((x: any) => ({
        label: x.displayName,
        value: x.id
      }));
    });
  }

  loadFaultHead() {
    this.service.GetFaultHeadDdl().subscribe(res => {
      this.FaultHeadList = res.map((x: any) => ({
        label: x.displayName,
        value: x.id
      }));
    });
  }

  // =================================================
  // LOAD DATA BASED ON ALL 3 FILTERS
  // =================================================

 // ===============================================
// LOAD DATA WHEN 3 DROPDOWN CHANGED
// ===============================================
onFilterChanged() {

  const { InspectionType, InspectionHead, FaultHead } = this.Model;

  if (!InspectionType || !InspectionHead || !FaultHead) {
    this.FaultWiseList = [];
    return;
  }

  const payload = {
    inspectionTypeId: InspectionType,
    inspectionHeadId: InspectionHead,
    faultHeadId: FaultHead
  };

  this.service.getFaultWiseList(payload).subscribe((res: any[]) => {

    this.FaultWiseList = res.map(x => ({
      id: x.id,
      faultNameId: x.faultNameId,
      faultName: x.faultName,
      value: x.faultValue ?? 0,
      isSelected: x.isActive ?? false
    }));

    this.updateSelectAll();
  });
}
toggleAllRows() {
  this.FaultWiseList.forEach(x => x.isSelected = this.selectAll);
}

updateSelectAll() {
  this.selectAll =
    this.FaultWiseList.length > 0 &&
    this.FaultWiseList.every(x => x.isSelected === true);
}
onSubmit() {
debugger;
  if (!this.FaultWiseList.length) {
    this.toastr.warning('No data to save');
    return;
  }

  const payload = {
    inspectionTypeId: this.Model.InspectionType,
    inspectionHeadId: this.Model.InspectionHead,
    faultHeadId: this.Model.FaultHead,

    createdBy: 'Admin',

    details: this.FaultWiseList.map(x => ({
      faultNameId: x.faultNameId,
      faultValue: x.value ?? 0,
      isActive: x.isSelected
    }))
  };

  this.service.saveFaultWiseValue(payload).subscribe(() => {
    this.toastr.success('Saved successfully');
    this.onFilterChanged();
  });
}

onClear() {

  this.Model = {
    InspectionType: null,
    InspectionHead: null,
    FaultHead: null
  };

  this.FaultWiseList = [];
  this.selectAll = false;
}
}