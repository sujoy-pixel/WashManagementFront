import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CardModule } from 'primeng/card';
import { WashSetupService } from '../../../services/washsetup.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-date-wise-hourly-qc-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule,
    CardModule
  ],
  templateUrl: './date-wise-hourly-qc-report.component.html',
  styleUrl: './date-wise-hourly-qc-report.component.scss'
})
export class DateWiseHourlyQcReportComponent implements OnInit {

  UnitList: any[] = [];
  buyerList: any[] = [];
  styleList: any[] = [];
  orderList: any[] = [];
  jobList: any[] = [];
  reportList: any[] = [];
  batchList: any[] = [];
  shiftList: any[] = [];

  Model = {
    UnitId: null as number | null,
    BuyerId: null as number | null,
    StyleId: null as number | null,
    OrderId: null as number | null,
    JobId: null as number | null,
    ReportId: null as number | null,
    BatchNo: null as string | null,
    ShiftId: null as number | null,
    QcName: 'SYSTEM', // Load QC User Name
    Date: new Date()
  };

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadUnitList();
    this.loadBuyerList();
    this.loadStyleList();
    this.loadOrderList();
    this.loadJobList();
    this.LoadReportList();
    // this.batchList();
    this.LoadShiftList();
    
    // Mock Data for Missing Endpoints
    // this.reportList = [
    //   { label: 'Daily QC Report', value: 1 }, 
    //   { label: 'Hourly QC Report', value: 2 }
    // ];
    // this.shiftList = [
    //   { label: 'Morning Shift', value: 1 }, 
    //   { label: 'Evening Shift', value: 2 }
    // ];
    // this.batchList = [
    //   { label: 'B-001', value: 'B-001' }, 
    //   { label: 'B-002', value: 'B-002' }
    // ];
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
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }
  
  loadStyleList() {
    this.service.GetStyleNoDDL().subscribe(res => {
      this.styleList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

  loadOrderList() {
    this.service.GetOrderNoDDL().subscribe(res => {
      this.orderList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

  loadJobList() {
    this.service.GetJobNoDDL().subscribe(res => {
      this.jobList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }
  
    LoadReportList() {
    this.service.GetReportNameDDL().subscribe(res => {
      this.reportList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

 LoadShiftList() {
    this.service.GetShiftNameDDL().subscribe(res => {
      this.shiftList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: Number(x.ID || x.id)
      }));
    });
  }

LoadBatchList() {
    this.service.GetBatchNoDDL().subscribe(res => {
      this.batchList = res.map((x: any) => ({
        label: x.DisplayName || x.displayName,
        value: x.ID || x.id
      }));
    });
  }
  onBuyerChange() {
    // Add logic here to filter Style/Order/Job based on Buyer if required
  }

  onStyleChange() {
    // When user selects Style Based on Unit, Buyer, auto select Order and Job
    if (this.Model.StyleId) {
       // Mock logic: user can implement exact API filter to populate Order and Job
    }
  }

  onOrderChange() {
    // When user selects Order, auto select Buyer, Style, and Job
    if (this.Model.OrderId) {
       // Mock logic: user can implement exact API filter to populate Buyer, Style, and Job
    }
  }

  onSearch() {
    if (!this.Model.UnitId) { this.toastr.warning('Unit is required'); return; }
    if (!this.Model.BuyerId) { this.toastr.warning('Buyer is required'); return; }
    if (!this.Model.StyleId) { this.toastr.warning('Style is required'); return; }
    if (!this.Model.ReportId) { this.toastr.warning('Report is required'); return; }
    if (!this.Model.Date) { this.toastr.warning('Date is required'); return; }

    this.toastr.success('Search action triggered');
  }
}
