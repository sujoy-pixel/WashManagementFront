import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';

interface SizeQtyModel {
  sizeId?: number | null;
  size: string;
  preparePcs: number;
  prepareKg: number;
  preparedPcs: number;
  preparedKg: number;
}

@Component({
  selector: 'app-acid-wash-batch-prepare',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './acid-wash-batch-prepare.component.html',
  styleUrls: ['./acid-wash-batch-prepare.component.scss']
})
export class AcidWashBatchPrepareComponent implements OnInit {
  @ViewChild('batchInput') batchInput!: ElementRef;

  Model: any = {
    processList: [],
    machineList: []
  };

  processList: any[] = [];
  machineList: any[] = [];

  // Top Section Data
  washBatchNo: string = '';
  batchQtyPcs: number = 0;
  batchQtyKg: number = 0;

  batchHeader = {
    prepareDate: new Date(),
    revisionNo: '',
    revisionDate: null as Date | null,
    prepareBy: 'SYSTEM',
    buyer: '',
    jobNo: '',
    styleNo: '',
    orderNo: '',
    itemType: '',
    composition: '',
    gsm: '',
    color: ''
  };

  // Middle Section Data
  acidBatchNo: string = '';

  // Bottom Section Data (Grid)
  sizeQty: SizeQtyModel[] = [];
  totalPreparePcs: number = 0;
  totalPrepareKg: number = 0;
  totalPreparedPcs: number = 0;
  totalPreparedKg: number = 0;

  isTotalEditable: boolean = false;
  initialTotalPcs: number = 0;

  showSizeDetails: boolean = true;
  applyToAll: boolean = false;

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProcessDDL();
    // this.loadMachineDDL();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
    }, 100);
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

  onSelectionChangeProcess(event: MatSelectChange) {
    const selectedIds: number[] = event.value || [];

    this.Model.processList = selectedIds;

    if (selectedIds.length === 0) {
      this.machineList = [];
      this.Model.machineList = [];
      return;
    }

    const processIds = selectedIds.join(',');

    this.service.GetMachineByProcess(processIds).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data || res?.result || [];

        this.machineList = data.map((x: any) => ({
          label: x.displayName ?? x.DisplayName ?? x.machineName ?? x.MachineName,
          value: x.id ?? x.ID ?? x.machineDetailId ?? x.MachineDetailId
        }));

        this.Model.machineList = [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        this.machineList = [];
        this.Model.machineList = [];
      }
    });
  }

  toggleSizeView() {
    this.showSizeDetails = !this.showSizeDetails;
  }

  applyFirstValueToAll() {
    if (!this.sizeQty.length) return;

    const firstValue = this.sizeQty[0].preparePcs;

    this.sizeQty.forEach(x => {
      x.preparePcs = firstValue;
    });

    this.calculateTotals();
  }

  onlyNumber(event: any) {
    const input = event.target.value;
    const cleanValue = input.replace(/[^0-9]/g, '');
    event.target.value = cleanValue;
    this.totalPreparePcs = cleanValue ? Number(cleanValue) : 0;
  }

  Number(event: any) {
    const input = event.target.value;
    const cleanValue = input.replace(/[^0-9]/g, '');
    event.target.value = cleanValue;
    this.totalPrepareKg = cleanValue ? Number(cleanValue) : 0;
  }

  onTotalPcsChange() {
    if (!this.totalPreparePcs) {
      this.totalPreparePcs = this.initialTotalPcs;
      return;
    }

    if (this.totalPreparePcs > this.initialTotalPcs) {
      this.toastr.warning(
        `Max allowed: ${this.initialTotalPcs}`,
        'Invalid Total Pcs'
      );
      this.totalPreparePcs = this.initialTotalPcs;
    }
  }

  loadBatchData() {
    if (!this.washBatchNo) {
      this.toastr.warning('Enter Wash Batch No');
      return;
    }

    // Mock API call to load data based on washBatchNo
    this.service.getBatchWishAsidPrepareData(this.washBatchNo).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res.data;
        if (!data || data.length === 0) {
          this.toastr.warning('No data found for this Batch');
          return;
        }

        const first = data[0];

        this.batchHeader.buyer = first.buyerName || '';
        this.batchHeader.jobNo = first.jobNo || '';
        this.batchHeader.styleNo = first.styleName || '';
        this.batchHeader.orderNo = first.orderNo || '';
        this.batchHeader.itemType = first.type || '';
        this.batchHeader.composition = first.composition || '';
        this.batchHeader.gsm = first.gsm || '';
        this.batchHeader.color = first.color || '';

        // Example sizes
        this.sizeQty = [

        ];

        this.acidBatchNo = `WashBatch(${this.washBatchNo}-A1)`;
        this.calculateTotals();
        this.initialTotalPcs = this.totalPreparePcs;
      },
      error: () => {
        this.toastr.error('Error loading batch');
      }
    });
  }

  calculateTotals() {
    this.totalPreparePcs = this.sizeQty.reduce((s, x) => s + (Number(x.preparePcs) || 0), 0);
    this.totalPrepareKg = this.sizeQty.reduce((s, x) => s + (Number(x.prepareKg) || 0), 0);
    this.totalPreparedPcs = this.sizeQty.reduce((s, x) => s + (Number(x.preparedPcs) || 0), 0);
    this.totalPreparedKg = this.sizeQty.reduce((s, x) => s + (Number(x.preparedKg) || 0), 0);
  }

  onSubmit() {
    if (!this.washBatchNo) {
      this.toastr.warning('Wash Batch No is required');
      return;
    }

    if (!this.Model.processList?.length) {
      this.toastr.warning('Please select process');
      return;
    }

    if (!this.Model.machineList?.length) {
      this.toastr.warning('Please select machine');
      return;
    }

    const payload = {
      washBatchNo: this.washBatchNo,
      acidBatchNo: this.acidBatchNo,
      processIds: this.Model.processList.join(','),
      machineIds: this.Model.machineList.join(','),
      sizeDetails: this.sizeQty
    };

    console.log('Saving Data...', payload);
    this.toastr.success('Saved successfully (Mock)');
  }

  onClear() {
    this.washBatchNo = '';
    this.acidBatchNo = '';
    this.batchQtyPcs = 0;
    this.batchQtyKg = 0;
    this.sizeQty = [];
    this.Model.processList = [];
    this.Model.machineList = [];

    this.batchHeader = {
      prepareDate: new Date(),
      revisionNo: '',
      revisionDate: null,
      prepareBy: 'SYSTEM',
      buyer: '',
      jobNo: '',
      styleNo: '',
      orderNo: '',
      itemType: '',
      composition: '',
      gsm: '',
      color: ''
    };

    this.showSizeDetails = true;
    this.applyToAll = false;
    this.isTotalEditable = false;
    this.totalPreparePcs = 0;
    this.totalPrepareKg = 0;
    this.totalPreparedPcs = 0;
    this.totalPreparedKg = 0;
    this.initialTotalPcs = 0;
  }
}

