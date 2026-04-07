import { Component } from '@angular/core';
import { WashSetupService } from '../../../services/washsetup.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DropdownItem } from '../../../model/common-files.model';
import { CommonModule } from '@angular/common';
import { SizeQuantityComponent } from 'src/app/components/advanced-ui/modals/size-quantity/size-quantity.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
interface BatchHeaderModel {
  unitId?: number;
  buyerId?: number;
  styleId?: number;
  orderId?: number;
  jobId?: number;
  dressPartId?: number;
  uomId?: number;

  unitName: string;
  buyerName: string;
  batchNo: string;
  styleName: string;
  orderNo: string;
  jobNo: string;

  type: string;
  color: string;
  dressPart: string;
  uom: string;
  date: string;
}
@Component({
  selector: 'app-wash-operation-start-end',
  standalone: true,
  imports: [CommonModule, SizeQuantityComponent, FormsModule, NgSelectModule, BsDatepickerModule, CardModule],
  templateUrl: './wash-operation-start-end.component.html',
  styleUrl: './wash-operation-start-end.component.scss'
})
export class WashOperationStartEndComponent {


  batchNo: string = '';

  batchHeader: BatchHeaderModel = {
    unitName: '',
    buyerName: '',
    batchNo: '',
    styleName: '',
    orderNo: '',
    jobNo: '',
    type: '',
    color: '',
    dressPart: '',
    uom: '',
    date: ''
  };


  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  Model = {
    UnitId: null as number | null,
    BuyerId: null as number | null,
    JobId: null as number | null,
    StyleId: null as number | null,
    OrderId: null as number | null,
    trackingNo: '' as string,
    batchNo: '' as string
  };

  buyerList: DropdownItem[] = [];
  styleList: DropdownItem[] = [];
  UnitList: DropdownItem[] = [];

  ngOnInit(): void {
    this.loadBuyerList();
    this.loadUnitList();
  }
  loadUnitList() {
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
        label: x.DisplayName ?? x.displayName ?? x.BuyerName,
        value: x.ID ?? x.id ?? x.BuyerNo
      }));

      if (this.buyerList.length === 1) {
        this.Model.BuyerId = Number(this.buyerList[0].value);
        this.onBuyerChange(); 
      }
    });
  }

  onBuyerChange(): void {


  }
  onSubmit() {
    this.toastr.success('Form submitted successfully!');
  }
  onClear() {
    this.Model = {
      UnitId: null,
      BuyerId: null,
      JobId: null,
      StyleId: null,
      OrderId: null,
      trackingNo: '',
      batchNo: ''
    };
    this.toastr.info('Form cleared.');
  }
  // fetchTrackingData() {
  //   const trackingNo = this.Model.trackingNo;
  //   if (!trackingNo) {
  //     this.toastr.warning('Tracking No required');
  //     return;
  //   }
  
  // }
  // 🔥 LOAD DATA
  loadBatchData() {
  const batch = this.batchNo?.trim();

  if (!batch) return;

  
  this.service.getBatchWishStartEndData(batch)
    .subscribe({
      next: (res: any[]) => {

   debugger;
      },
 
    });
}
}
