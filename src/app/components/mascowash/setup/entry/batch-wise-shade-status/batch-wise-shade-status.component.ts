import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { WashSetupService } from '../../../services/washsetup.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DropdownItem } from '../../../model/common-files.model';

interface BatchHeaderModel {
  unitName: string;
  buyerName: string;
  batchNo: string;
  styleName: string;
  orderNo: string;
  jobNo: string;
  color: string;
  weight?: number;
}

@Component({
  selector: 'app-batch-wise-shade-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule,
    CardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './batch-wise-shade-status.component.html',
  styleUrl: './batch-wise-shade-status.component.scss'
})
export class BatchWiseShadeStatusComponent {

  @ViewChild('batchInput') batchInput!: ElementRef;

  buyerList: DropdownItem[] = [];
  UnitList: DropdownItem[] = [];

  batchNo: string = '';

  // ================= OPERATION =================
  operationList: any[] = [];
  operationListData: any[] = [];

  // ================= HEADER =================
  batchHeader: BatchHeaderModel = {
    unitName: '',
    buyerName: '',
    batchNo: '',
    styleName: '',
    orderNo: '',
    jobNo: '',
    color: '',
    weight: 0
  };

  // ================= MODEL =================
  Model = {
    UnitId: null as number | null,
    BuyerId: null as number | null,
    activeStatus: true,

    OperationTime: null as number | null,

    PreviousWeight: 0,
    PreviousShade: 0
  };

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBuyerList();
    this.loadUnitList();
    this.Model.activeStatus = true;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
    }, 100);
  }

  // ================= DDL =================
  // loadUnitList() {
  //   this.service.GetUnitName().subscribe(res => {
  //     this.UnitList = res.map((x: any) => ({
  //       label: x.DisplayName || x.displayName,
  //       value: Number(x.ID || x.id)
  //     }));
  //   });
  // }
loadUnitList(): void {
    this.service.GetUnitName().subscribe(res => {
      this.UnitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));

  
      const found = this.UnitList.find(x => x.value === 60);
      if (found) {
        this.Model.UnitId = 60;
      }
    });
  }

  
  loadBuyerList() {
    this.service.GetBuyerNameDDL().subscribe(res => {
      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

  // ================= LOAD BATCH =================
  loadBatchData() {

    if (!this.batchNo) {
      this.toastr.warning('Enter Batch No');
      return;
    }

    this.service.getBatchWishShadeData(this.batchNo).subscribe({

          next: (res: any) => {

        const data = Array.isArray(res) ? res : res.data;

        if (!data || data.length === 0) {
          this.toastr.warning('No data found');
          return;
        }

        const first = data[0];

        // ================= HEADER =================
        this.batchHeader = {
          unitName: first.unitName || '',
          buyerName: first.buyerName || '',
          batchNo: first.batchNo || '',
          styleName: first.styleName || '',
          orderNo: first.orderNo || '',
          jobNo: first.jobNo || '',
          color: first.color || '',
          weight: first.weight || 0
        };

        // ================= MODEL =================
        this.Model.UnitId = first.unitId || null;
        this.Model.BuyerId = first.buyerId || null;

        // ================= OPERATION LIST =================
        this.operationListData = data;

        this.operationList = data.map((x: any) => ({
          label: 'Operation ' + x.operationTime,
          value: x.operationTime
        }));

        // auto select latest
        if (this.operationList.length > 0) {
          const last = this.operationList[this.operationList.length - 1];
          this.Model.OperationTime = last.value;
          this.onOperationChange(last.value);
        }
      },
      error: () => {
        this.toastr.error('Error loading batch');
      }
    });
  }

  // ================= OPERATION CHANGE =================
onOperationChange(selectedValue: any) {

  const value = selectedValue?.toString();

  console.log('Selected Operation:', value);

  const record = this.operationListData.find(
    (x: any) => x.operationTime?.toString() === value
  );

  if (!record) {
    console.warn('No record found for:', value);
    return;
  }

  this.batchHeader.weight = record.weight;
  this.Model.activeStatus = record.shade;
}
  // ================= STATUS =================
  onChangeActiveStatus(event: any) {
    this.Model.activeStatus = event.target.checked;
  }

  // ================= SAVE =================
  onSubmit() {

    // if (!this.batchNo) {
    //   this.toastr.warning('Batch required');
    //   return;
    // }  

    // if (!this.Model.UnitId) {
    //   this.toastr.warning('Unit required');
    //   return;
    // }

    // if (!this.Model.BuyerId) {
    //   this.toastr.warning('Buyer required');
    //   return;
    // }

    const payload = {
      unitId: this.Model.UnitId,
      batchNo: this.batchNo,
      buyerId: this.Model.BuyerId,
      weight: this.batchHeader.weight || 0,
      shade: this.Model.activeStatus ? 1 : 0,
      createdBy: 'SYSTEM'
    };

    this.service.saveBatchWiseShadeStatus(payload).subscribe({
      next: () => {
        this.toastr.success('Saved successfully');
        this.loadBatchData();
      },
      error: () => {
        this.toastr.error('Save failed');
      }
    });
  }

  // ================= CLEAR =================
  onClear() {
    this.batchNo = '';

    this.batchHeader = {
      unitName: '',
      buyerName: '',
      batchNo: '',
      styleName: '',
      orderNo: '',
      jobNo: '',
      color: '',
      weight: 0
    };

    this.Model = {
      UnitId: null,
      BuyerId: null,
      activeStatus: true,
      OperationTime: null,
      PreviousWeight: 0,
      PreviousShade: 0
    };

    this.operationList = [];
    this.operationListData = [];

    setTimeout(() => {
      this.batchInput?.nativeElement.focus();
    }, 100);
  }
}