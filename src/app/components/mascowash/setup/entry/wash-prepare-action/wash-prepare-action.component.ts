import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';
import { Router } from '@angular/router';
import { is } from 'date-fns/locale';

@Component({
  selector: 'app-wash-prepare-action',
  templateUrl: './wash-prepare-action.component.html',
  styleUrls: ['./wash-prepare-action.component.scss']
})
export class WashPrepareActionComponent implements OnInit {

  Model: any = {
    processList: [],
    machineList: []
  };

  processList: any[] = [];
  machineList: any[] = [];

  allSelectedProcess = false;
  allSelectedMachine = false;

  currentFocus: string | null = null;

  batch = {
    buyer: '',
    jobNo: '',
    styleNo: '',
    orderNo: '',
    process: '',
    batchNo: '',
    documentNo: '',
    effectiveDate: '',
    revisionDate: '',
    revisionNo: '',
    date: '',
    fabrication: '',
    composition: '',
    gsm: '',
    color: ''
  };

  // ======= ID STORAGE FOR SAVE =========
  batchIds: any = {};

  saveButtonTitle = 'Save';
  machineRows = new Array(6);

  sizeQty: { sizeId?: number | null; size: string; pcs: number; kg: number }[] = [];

  totalPcs = 0;
  totalKg = 0;

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProcessDDL();
    this.loadMachineDDL();
    this.loadDataFromParent();
  }

  loadProcessDDL() {
    this.service.GetProcessNameDDL().subscribe(res => {
      this.processList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id ?? x.ID
      }));
    });
  }

  loadMachineDDL() {
    this.service.GetMachineNoDDL().subscribe(res => {
      this.machineList = res.map((x: any) => ({
        label: x.displayName ?? x.DisplayName,
        value: x.id ?? x.ID
      }));
    });
  }

  /* ================= PROCESS ================= */
  onSelectionChangeProcess(event: any) {
    this.Model.processList = this.Model.processList?.filter((x: any) => x !== null);
  }

  toggleAllSelectionProcess() {
    this.allSelectedProcess = !this.allSelectedProcess;
    this.Model.processList = this.allSelectedProcess ? [...this.processList] : [];
  }

  isAllSelectedProcess(): boolean {
    return this.Model.processList?.length === this.processList.length;
  }

  /* ================= MACHINE ================= */
  onSelectionChangeMachine(event: any) {
    this.Model.machineList = this.Model.machineList?.filter((x: any) => x !== null);
  }

  toggleAllSelectionMachine() {
    this.allSelectedMachine = !this.allSelectedMachine;
    this.Model.machineList = this.allSelectedMachine ? [...this.machineList] : [];
  }

  isAllSelectedMachine(): boolean {
    return this.Model.machineList?.length === this.machineList.length;
  }

  /* ================= UI FOCUS ================= */
  setFocus(field: string) {
    this.currentFocus = field;
  }

  clearFocus() {
    this.currentFocus = null;
  }

  private loadDataFromParent(): void {

    const navState = localStorage.getItem('WASH_PREPARE_NAV_STATE');

    if (!navState) {
      console.error('❌ No navigation state found');
      return;
    }

    const data = JSON.parse(navState);

    /* ================= STORE IDS (FOR SAVE) ================= */
    this.batchIds = {
      buyerId: data.buyerId ?? null,
      jobId: data.jobId ?? null,
      styleId: data.styleId ?? null,
      orderId: data.orderId ?? null,
      fabricationId: data.fabricationId ?? null,
      colorId: data.colorId ?? null,
      dressPartId: data.dressPartId ?? null,
      uomId: data.uomId ?? null,
      fromUnitId: data.fromUnitId ?? null,
      iszid: data.iszid ?? null
    };

    /* ================= HEADER DISPLAY ================= */
    this.batch.buyer = data.buyer ?? '';
    this.batch.jobNo = data.jobNo ?? '';
    this.batch.styleNo = data.styleNo ?? '';
    this.batch.orderNo = data.orderNo ?? '';
    this.batch.batchNo = data.batchNo ?? '';
    this.batch.documentNo = data.documentNo ?? '';
    this.batch.effectiveDate = data.effectiveDate ?? '';
    this.batch.revisionDate = data.revisionDate ?? '';
    this.batch.revisionNo = data.revisionNo ?? '';
    this.batch.date = data.date ?? '';
    this.batch.fabrication = data.fabrication ?? '';
    this.batch.composition = data.composition ?? '';
    this.batch.color = data.color ?? '';
    this.batch.gsm = data.gsm ?? '';
    /* ================= SIZE DETAILS (MERGE + ID) ================= */
    if (Array.isArray(data.sizeDetails)) {

      const sizeMap = new Map<string, any>();

      data.sizeDetails.forEach((x: any) => {
        const key = x.sizeId ?? x.size;

        if (sizeMap.has(key)) {
          sizeMap.get(key).pcs += +x.qty || +x.pcs || 0;
        } else {
          sizeMap.set(key, {
            sizeId: x.sizeId ?? null,
            size: x.size,
            pcs: +x.qty || +x.pcs || 0,
            kg: +x.kg || 0
          });
        }
      });
console.log('✅ Merged Size Map:', sizeMap);
      this.sizeQty = Array.from(sizeMap.values());
      this.calculateTotals();
      
    }
  }

  calculateTotals(): void {
    this.totalPcs = this.sizeQty.reduce((s, x) => s + (+x.pcs || 0), 0);
    this.totalKg = this.sizeQty.reduce((s, x) => s + (+x.kg || 0), 0);
  }

  clearAll(): void {
    // this.detailList = [];
  }

  onSubmit(): void {

    /* ================= VALIDATION ================= */
    if (!this.Model.processList?.length) {
      this.toastr.warning('Please select process');
      return;
    }

    if (!this.Model.machineList?.length) {
      this.toastr.warning('Please select machine');
      return;
    }

    /* ================= BUILD PAYLOAD ================= */
    const payload = {
      master: {
        operation: "INSERT",
        createdBy: "SYSTEM",
        masterId: 0,
        unitId: this.batchIds.fromUnitId,
        trackingNo: this.batch.batchNo,

        // Your master display fields
        batchNo: this.batch.batchNo,
        documentNo: this.batch.documentNo,
        effectiveDate: this.batch.effectiveDate,
        revisionDate: this.batch.revisionDate,
        revisionNo: this.batch.revisionNo,
        date: this.batch.date,
        composition: this.batch.composition,
        // Master IDs
        buyerId: this.batchIds.buyerId,
        jobId: this.batchIds.jobId,
        styleId: this.batchIds.styleId,
        orderId: this.batchIds.orderId,
        fabricationId: this.batchIds.fabricationId,
        colorId: this.batchIds.colorId,
        dressPartId: this.batchIds.dressPartId,
        uomId: this.batchIds.uomId,
        iszId: this.batchIds.iszid,

        // MULTI SELECT CSV
        processIds: this.Model.processList.map((x: any) => x.value).join(','),
        machineIds: this.Model.machineList.map((x: any) => x.value).join(','),

        totalPcs: this.totalPcs,
        totalKg: this.totalKg
      },

      sizeDetails: this.sizeQty.map(x => ({
        sizeId: x.sizeId ?? null,
        size: x.size,
        qty: Number(x.pcs) || 0,
        kg: Number(x.kg) || 0
      }))

    };

    console.log('✅ SAVE PAYLOAD:', payload);

    /* ================= API CALL ================= */
    this.service.SaveWashPrepare(payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Saved successfully');
        this.router.navigate(['/wash/prepare-list']);
      },
      error: (err: any) => {
        console.error('❌ Save Error:', err);
        this.toastr.error('Save failed');
      }
    });
  }
}