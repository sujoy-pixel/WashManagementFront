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
  selector: 'app-fault-wise-value-tag-entry',
  templateUrl: './fault-wise-value-tag-entry.component.html',
  styleUrls: ['./fault-wise-value-tag-entry.component.scss'],
})
export class FaultWiseValueTagEntryComponent {
  InspectionTypeList: any[] = [];
  InspectionHeadList: any[] = [];
  FaultHeadList: any[] = [];

  // Temporary detail list before save
  detailList: { machineName: string; isActive: boolean }[] = [];
  currentMachineName = '';
  editIndex: number | null = null;

  // Master grid
  faultWiseValueMasterGrid: any[] = [];
  displayMasterGrid: any[] = []; // for HTML display with concatenated machine names

  Model: any = {
    InspectionType: null,
    InspectionHead: null,
    FaultHead: null,
    MasterId: 0,
  };

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInspectionType();
    this.loadInspectionHead();
    this.loadFaultHead();
  }

  // ================= Load dropdowns =================
  loadInspectionType() {
    this.InspectionTypeList = [];
    this.service.GetInspectionTypeDdl().subscribe((res) => {
      this.InspectionTypeList.push({ label: '-- Select --', value: null });
      res.forEach((x) => {
        this.InspectionTypeList.push({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
        });
      });
    });
  }

  loadInspectionHead() {
    this.InspectionHeadList = [];
    this.service.GetInspectionHeadDdl().subscribe((res) => {
      this.InspectionHeadList.push({ label: '-- Select --', value: null });
      res.forEach((x) => {
        this.InspectionHeadList.push({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
        });
      });
    });
  }

  loadFaultHead() {
    this.FaultHeadList = [];
    this.service.GetFaultHeadDdl().subscribe((res) => {
      this.FaultHeadList.push({ label: '-- Select --', value: null });
      res.forEach((x) => {
        this.FaultHeadList.push({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
        });
      });
    });
  }

  // ================= Add Machine =================
  // Add or Edit Machine
  // Add Machine
  // Add Machine
  onAddMachine() {
    const name = this.currentMachineName.trim();

    if (!this.Model.UnitId || !this.Model.OperationId) {
      this.toastr.warning('Select Unit and Operation');
      return;
    }

    if (!name) {
      this.toastr.warning('Enter machine name');
      return;
    }

    // Edit mode
    if (this.editIndex !== null) {
      this.detailList[this.editIndex].machineName = name;
      this.editIndex = null;
      this.currentMachineName = '';
      return;
    }

    // Local duplicate check
    if (
      this.detailList.some(
        (x) => x.machineName.toLowerCase() === name.toLowerCase()
      )
    ) {
      this.toastr.warning('Machine already added');
      return;
    }

    // DB duplicate check
    this.service
      .checkMachineExists({
        unitId: this.Model.UnitId,
        operationId: this.Model.OperationId,
        machineName: name,
      })
      .subscribe((res: any) => {
        const exists = res?.ExistsFlag === 1 || res === 1;
        if (exists) {
          this.toastr.warning('Machine already exists in database');
          return;
        }

        // Add machine with default isActive true
        this.detailList.push({ machineName: name, isActive: true });
        this.currentMachineName = '';
        this.cdr.detectChanges();
      });
  }

  // Edit machine
  editDetail(index: number) {
    this.editIndex = index;
    this.currentMachineName = this.detailList[index].machineName;
  }

  // Remove machine
  removeDetail(index: number) {
    this.detailList.splice(index, 1);
  }

  // ================= Save Master =================

  onSaveMaster() {
    if (!this.Model.UnitId || !this.Model.OperationId) {
      this.toastr.warning('Select Unit and Operation');
      return;
    }

    if (!this.detailList.length) {
      this.toastr.warning('Add at least one machine');
      return;
    }

    const payload = {
      Operation: this.Model.MasterId ? 'UPDATE' : 'INSERT',
      UnitId: this.Model.UnitId,
      OperationId: this.Model.OperationId,
      CreatedBy: 'Admin',
      MasterId: this.Model.MasterId ?? 0,
      _listData: this.detailList.map((x) => ({
        MachineDetailId: 0,
        MachineName: x.machineName,
        IsActive: x.isActive, // ✅ Preserve active/inactive
      })),
    };
    // console.log("payload",payload)
    this.service.saveMachineMasterDetail(payload).subscribe(
      () => {
        this.toastr.success('Saved successfully');
        this.onClearAll();
        this.loadMachineMasterList();
      },
      () => this.toastr.error('Save failed')
    );
  }

  // ================= Load Master Grid =================
  loadMachineMasterList() {
    this.service.getMachineMasterList().subscribe(
      (res: any) => {
        const masterRecords = Array.isArray(res) ? res : res.data ?? [];
        // this.machineMasterGrid = masterRecords;

        // Prepare display grid with concatenated machine names
        const map = new Map<number, any>();

        masterRecords.forEach((r) => {
          const masterId = r.MachineNameMasterId ?? r.machineNameMasterId;
          const unitId = r.UnitId ?? r.unitId;
          const unitName = r.UnitName ?? r.unitName ?? 'N/A';
          const operationId = r.OperationId ?? r.operationId;
          const operationName = r.OperationName ?? r.operationName ?? 'N/A';
          const machineName = r.MachineName ?? r.machineName ?? '';

          if (!map.has(masterId)) {
            map.set(masterId, {
              MasterId: masterId,
              UnitId: unitId,
              UnitName: unitName,
              OperationId: operationId,
              OperationName: operationName,
              MachineNames: machineName,
              Machines: [r],
            });
          } else {
            const obj = map.get(masterId);
            obj.MachineNames += ', ' + machineName;
            obj.Machines.push(r);
          }
        });

        this.displayMasterGrid = Array.from(map.values());
      },
      () => {
        this.toastr.error('Failed to load master list');
      }
    );
  }

  // ================= Edit/Delete from Master Grid =================

  // editMasterDetail(record: any) {
  //   const master = this.machineMasterGrid.find(x => x.MachineNameMasterId === record.MachineNameMasterId) || record;
  //   this.Model.UnitId = master.UnitId;
  //   this.Model.OperationId = master.OperationId;
  //   this.Model.MasterId = master.MachineNameMasterId;

  //   this.detailList = this.machineMasterGrid
  //     .filter(x => x.MachineNameMasterId === master.MachineNameMasterId)
  //     .map(x => ({ machineName: x.MachineName, isActive: x.IsActive }));

  //   this.cdr.detectChanges();
  // }
  editMasterDetail(record: any) {
    console.log('editMasterDetail', record);
    // Set master-level info
    this.Model.UnitId = record.UnitId;
    this.Model.OperationId = record.OperationId;
    this.Model.MasterId = record.MasterId;

    let dtaTable = record.Machines;
    this.detailList = [];
    let arr: any[] = [];
    for (let i = 0; i < dtaTable.length; i++) {
      let a = {
        machineName: dtaTable[i].machineName,
        isActive: dtaTable[i].isActive,
      };
      arr.push(a);
    }
    this.detailList = arr;

    // Populate detail list including active/inactive machines
    // this.detailList = this.machineMasterGrid
    //   .filter(x => x.MachineNameMasterId === record.MachineNameMasterId)
    //   .map(x => ({
    //     machineName: x.MachineName,
    //     isActive: x.IsActive // preserve true/false
    //   }));

    // Reset edit index and input
    this.editIndex = null;
    this.currentMachineName = '';

    // Force Angular to detect changes
    this.cdr.detectChanges();
  }

  deleteMasterDetail(record: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete machine(s) "${record.MachineNames}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          Operation: 'DELETE',
          UnitId: record.UnitId,
          OperationId: record.OperationId,
          MasterId: record.MasterId,
          CreatedBy: 'Admin',
          _listData: [],
        };

        this.service.saveMachineMasterDetail(payload).subscribe(() => {
          this.toastr.success('Deleted successfully');
          this.loadMachineMasterList();
        });
      }
    });
  }

  // ================= Clear Form =================
  onClearAll() {
    this.Model = { UnitId: null, OperationId: null, MasterId: 0 };
    this.detailList = [];
    this.currentMachineName = '';
    this.editIndex = null;
    this.cdr.detectChanges();
  }
}
