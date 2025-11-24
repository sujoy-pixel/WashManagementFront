import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '../../../services/common-service';
import { WashSetupService } from '../../../services/washsetup.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { iADATE } from '../../../washInterface';
import { getDate } from 'date-fns';

@Component({
  selector: 'app-actual-date-entry',
  templateUrl: './actual-date-entry.component.html',
  styleUrls: ['./actual-date-entry.component.scss'],
})
export class ActualDateEntryComponent {
  customForm: FormGroup | any;
  title: string | any;
  spinnerName = 'createGroup';
  noResult: boolean = false;
  model: any = null;
  // toastr: any;
  numbers: number[] = [];
  saveButtonTitle = 'Save';
  global_b2blcdetailid: any;
  ItemDetailList: any = [];
  masterFileNoList: any = [];
  masterLcFileList: any = [];
  global_File_No: any;
  UnitList: any = [];
  @Output() getBranchData = new EventEmitter<any>();

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.bsConfig = {
      dateInputFormat: 'YYYY-MM-DD', // Your desired date format
    };
  }

  selectedBuyerOption: any;
  selectedStyleOption: any;
  selectedJobOption: any;
  selectedLcBankOption: any;
  selectedLcBranchOption: any;
  selectedTenorOption: any;
  subjectMarkDataList: any;
  subjectMarkDataKeys: any;
  selectAllRows: any;
  selectedSubjectLabel: any;
  markValue: any;
  selectedConcernPersonOption: any;
  masterLcList: any;
  SupplierSelectedList: any;
  PiSelectedList: any;
  MpoSelectedList: any;
  CurrencySelectedList: any;
  ItemList: any = [];
  PTypeSelectedList: any;
  MasterLcSelectedList: any;
  B2BLcSelectedList: any;
  alldataWithAdId: any;
  selectTableShow: any;
  global_supplierId: any;
  global_b2blcId: any;
  ActualDateDataList: any;
  currentFocus: string | null = null;

  isSubmitting = false;

  first = 0;
  rows = 10;

  Model: any = {
    adId: null,
    masterLcId: null,
    masterLcDate: null,
    b2bLcId: null,
    b2bLcDate: null,
    shipmentDate: null,
    expireDate: null,
    supplierId: null,
    piNo: null,
    piDate: null,
    mpoNo: null,
    mpoDate: null,
    etdDate: null,
    actualDispatchDate: null,
    etaDate: null,
    actualArrivalDate: null,
    ttDate: null,
    forwardingDate: null,
    customerClearanceDate: null,
    b2bDetailId: null,
  };

  cols = [
    { field: 'adId', header: 'Ad Id', display: '' },
    { field: 'companyId', header: 'companyId', display: '' },
    { field: 'fileNo', header: 'fileNo', display: '' },
    { field: 'lcNo', header: 'lcNo', display: '' },
    { field: 'lcDate', header: 'lcDate', display: '' },
    { field: 'supplierName', header: 'supplierName', display: '' },
    { field: 'invoiceNo', header: 'invoiceNo', display: '' },

    { field: 'shipmentClearanceDate', header: 'shipmentClearanceDate', display: '' },
    { field: 'commonLandingDate', header: 'commonLandingDate', display: '' },
    { field: 'shipmentClearanceDays', header: 'shipmentClearanceDays', display: '' },
    { field: 'etdDate', header: 'etdDate', display: '' },
    { field: 'etaDate', header: 'etaDate', display: '' },
    { field: 'actualDispatchDate', header: 'actualDispatchDate', display: '' },
  
  ];

  @ViewChild('companySelect', { static: false })
  companySelect!: NgSelectComponent;

  ngAfterViewInit(): void {
    // Focus the ng-select field when the page is loaded
    if (this.companySelect) {
      this.companySelect.focus();
    }
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  @ViewChild('fileNoSelect') fileNoSelect!: NgSelectComponent;
  CompanyChangeEvent(event,masterLcSelect:NgSelectComponent): void {
    masterLcSelect.focus();
    this.refreshAll();
    console.log('event Unit', event);
    this.Model.fileNo = null;
    this.Model.supplierName = "";
    this.LoadMasterFileNoList(event);

    setTimeout(() => {
      this.fileNoSelect.focus(); // Focus the supplier select
    }, 0);
  }

  refreshAll() {
    this.Model.lcNo = null;
    this.B2BLcSelectedList = [];
    this.Model.lcDate = "";
    this.Model.invoiceNo = "";
    this.Model.shipmentClearanceDate = "";
    this.Model.commonLandingDate = "";
    this.Model.shipmentClearanceDays = "";
    this.Model.etdDate = "";
    this.Model.etaDate = "";
    this.Model.actualDispatchDate = "";
    this.Model.acArrivalDateInput = "";
    this.ItemList=[];

  }
  
  LoadCompanyList() {
    this.UnitList = [];
    this.service.GetAccepCompanyName().subscribe(
      (data: any[]) => {
        this.UnitList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.UnitList.push({
            label: data[i].displayName,
            value: data[i].id,
          });
        }
      },
      (error) => {}
    );
  }

  onClickRowModify(iData: iADATE) {
    //console.log('Model', iData);
    this.saveButtonTitle = 'Update';
    // console.log('dataAdid', iData.adId);
    ////////////////////
    this.service.GetActualDatedataByAdId(iData.adId).subscribe(
      (data: any[]) => {
        this.alldataWithAdId = data[0];
        // console.log('data', data);
        this.Model.adId = this.alldataWithAdId.adId;
        this.Model.masterLcId = this.alldataWithAdId.masterLcId;
        this.Model.masterLcDate = this.alldataWithAdId.masterLcDate;
        this.Model.b2bLcId = this.alldataWithAdId.b2BLcId;
        this.Model.b2bLcDate = this.alldataWithAdId.b2BLcDate;
        this.Model.shipmentDate = this.alldataWithAdId.shipmentDate;
        this.Model.expireDate = this.alldataWithAdId.expireDate;
        this.Model.supplierId = this.alldataWithAdId.supplierId;
        this.Model.piNo = this.alldataWithAdId.piNo;
        this.Model.piDate = this.alldataWithAdId.piDate;
        this.Model.mpoNo = this.alldataWithAdId.mpoNo;
        this.Model.mpoDate = this.alldataWithAdId.mpoDate;
        this.Model.etdDate = this.alldataWithAdId.etdDate;
        this.Model.actualDispatchDate = this.alldataWithAdId.actualDispatchDate;
        this.Model.etaDate = this.alldataWithAdId.etaDate;
        this.Model.actualArrivalDate = this.alldataWithAdId.actualArrivalDate;
        this.Model.ttDate = this.alldataWithAdId.ttDate;
        this.Model.forwardingDate = this.alldataWithAdId.forwardingDate;
        this.Model.customerClearanceDate =
          this.alldataWithAdId.customerClearanceDate;
      },
      (error) => {}
    );

    ///////////////////

    // this.Model.adId = iData.adId;
    // this.Model.masterLcId = iData.value;

    // this.Model.supplierId = iData.supplierId;
    // this.Model.piNo = iData.piNo;
    // const date = new Date(iData.piDate);
    // // Extract the month, day, and year from the Date object
    // const month = ('0' + (date.getMonth() + 1)).slice(-2);
    // const day = ('0' + date.getDate()).slice(-2);
    // const year = date.getFullYear();
    // this.Model.piDate = month + '/' + day + '/' + year;

    // this.Model.mpoNo = iData.mpoNo;

    // const date2 = new Date(iData.mpoDate);
    // // Extract the month, day, and year from the Date object
    // const month2 = ('0' + (date2.getMonth() + 1)).slice(-2);
    // const day2 = ('0' + date2.getDate()).slice(-2);
    // const year2 = date2.getFullYear();
    // this.Model.mpoDate = month2 + '/' + day2 + '/' + year2;

    // const date3 = new Date(iData.etdDate);
    // // Extract the month, day, and year from the Date object
    // const month3 = ('0' + (date3.getMonth() + 1)).slice(-2);
    // const day3 = ('0' + date3.getDate()).slice(-2);
    // const year3 = date3.getFullYear();
    // this.Model.etdDate = month3 + '/' + day3 + '/' + year3;

    // const date4 = new Date(iData.actualDispatchDate);
    // // Extract the month, day, and year from the Date object
    // const month4 = ('0' + (date4.getMonth() + 1)).slice(-2);
    // const day4 = ('0' + date4.getDate()).slice(-2);
    // const year4 = date4.getFullYear();
    // this.Model.actualDispatchDate = month4 + '/' + day4 + '/' + year4;

    // const date5 = new Date(iData.etaDate);
    // // Extract the month, day, and year from the Date object
    // const month5 = ('0' + (date5.getMonth() + 1)).slice(-2);
    // const day5 = ('0' + date5.getDate()).slice(-2);
    // const year5 = date5.getFullYear();
    // this.Model.etaDate = month5 + '/' + day5 + '/' + year5;

    // const date6 = new Date(iData.actualArrivalDate);
    // // Extract the month, day, and year from the Date object
    // const month6 = ('0' + (date6.getMonth() + 1)).slice(-2);
    // const day6 = ('0' + date6.getDate()).slice(-2);
    // const year6 = date6.getFullYear();
    // this.Model.actualArrivalDate = month6 + '/' + day6 + '/' + year6;

    // const date7 = new Date(iData.ttDate);
    // // Extract the month, day, and year from the Date object
    // const month7 = ('0' + (date7.getMonth() + 1)).slice(-2);
    // const day7 = ('0' + date7.getDate()).slice(-2);
    // const year7 = date7.getFullYear();
    // this.Model.ttDate = month7 + '/' + day7 + '/' + year7;

    // const date8 = new Date(iData.forwardingDate);
    // // Extract the month, day, and year from the Date object
    // const month8 = ('0' + (date8.getMonth() + 1)).slice(-2);
    // const day8 = ('0' + date8.getDate()).slice(-2);
    // const year8 = date8.getFullYear();
    // this.Model.forwardingDate = month8 + '/' + day8 + '/' + year8;

    // const date9 = new Date(iData.customerClearanceDate);
    // // Extract the month, day, and year from the Date object
    // const month9 = ('0' + (date9.getMonth() + 1)).slice(-2);
    // const day9 = ('0' + date9.getDate()).slice(-2);
    // const year9 = date9.getFullYear();
    // this.Model.customerClearanceDate = month9 + '/' + day9 + '/' + year9;

    this.customForm = this.fb.group({
      adId: [this.Model.adId, Validators.required],
      operation: ['Update'],
      masterLcId: [this.Model.masterLcId, Validators.required],
      masterLcDate: [this.Model.masterLcDate, Validators.required],
      b2bLcId: [this.Model.b2bLcId, Validators.required],
      b2bLcDate: [this.Model.b2bLcDate, Validators.required],
      shipmentDate: [this.Model.shipmentDate, Validators.required],
      expireDate: [this.Model.expireDate, Validators.required],
      supplierId: [this.Model.supplierId, Validators.required],
      piNo: [this.Model.piNo],
      piDate: [this.Model.piDate],
      mpoNo: [this.Model.mpoNo],
      mpoDate: [this.Model.mpoDate],
      etdDate: [this.Model.etdDate],
      actualDispatchDate: [this.Model.actualDispatchDate],
      etaDate: [this.Model.etaDate],
      actualArrivalDate: [this.Model.actualArrivalDate, Validators.required],
      ttDate: [this.Model.ttDate, Validators.required],
      forwardingDate: [this.Model.forwardingDate, Validators.required],
      customerClearanceDate: [this.Model.CustomerClearanceDate],
    });
  }
  onClickRowDelete(iData: iADATE) {
    this.commonService.DeleteActualDateList(parseInt(iData.adId));
  }

  LCBankChangeEvent(event) {
    this.commonService.LoadBranchDownList(event);
  }
  LCBranchChangeEvent(event) {}

  onSearch() {}
  selectAll(event) {}
  onInputChange(event) {}

  desigName: any;
  newListConcernPerson: any = [];

  LoadSupplierDownList() {
    this.SupplierSelectedList = [];
    this.service.GetSupplierName().subscribe(
      (data: any[]) => {
        this.SupplierSelectedList.push({
          label: '--- Select ---',
          value: null,
        });
        for (var i = 0; i < data.length; i++) {
          this.SupplierSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
          });
        }

        // console.log('supplierList', this.SupplierSelectedList);
      },
      (error) => {}
    );
  }
  LoadPiList(id, lcId) {
    this.Model.piNo = null;
    this.Model.piDate = null;
    this.Model.mpoNo = null;
    this.Model.mpoDate = null;
    this.Model.etdDate = null;
    this.Model.actualDispatchDate = null;
    this.Model.etaDate = null;
    this.Model.actualArrivalDate = null;
    this.Model.ttDate = null;
    this.Model.forwardingDate = null;
    this.Model.customerClearanceDate = null;

    this.PiSelectedList = [];
    this.service.GetActualDatePi(id, lcId).subscribe(
      (data: any[]) => {
        this.PiSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.PiSelectedList.push({
            label: data[i].displayName,
            value: data[i].displayName,
          });
        }
      },
      (error) => {}
    );
  }

  SupplierChangeEvent(event) {
    const SupplierId = event;
    this.global_supplierId = event;
    this.LoadPiList(event, this.global_b2blcId);
    this.LoadB2bLcListB2B(
      this.global_b2blcId,
      SupplierId,
      this.global_b2blcdetailid
    );
  }
  PiNoChangeEvent(event) {
    this.LoadMpoList(event);
  }
  changeETDDate(event) {
    //alert(event);
    // if (event != undefined) {
    //   const result = new Date(event);
    //   result.setDate(result.getDate() + 10);
    //   this.Model.etaDate = result;
    // }
  }
  // LoadMpoList(PiNo) {
  //   //this.Model.mpoNo=null;
  //   // this.Model.mpoNo = null;
  //   // this.Model.etdDate = null;
  //   // this.Model.piDate = null;
  //   // this.Model.mpoDate = null;
  //   // this.Model.ttDate = null;
  //   // this.Model.etaDate = null;
  //   this.MpoSelectedList = [];
  //   this.service.GetMpoName(PiNo).subscribe(
  //     (data: any[]) => {
  //       this.MpoSelectedList.push({ label: '--- Select ---', value: null });
  //       for (var i = 0; i < data.length; i++) {
  //         this.MpoSelectedList.push({
  //           label: data[i].mpoNo,
  //           value: data[i].mpoNo,
  //           // mpoNo: data[i].mpoNo,
  //           // etdDate:
  //           //   data[i].etdDate === '01/01/1900 00:00:00' ? '' : data[i].etdDate,
  //           // piDate: data[i].piDate,
  //           // mpoDate:
  //           //   data[i].mpoDate === '01/01/1900 00:00:00' ? '' : data[i].mpoDate,
  //           // ttDate: data[i].lcDate,
  //         });
  //       }
  //       debugger;

  //       if (this.MpoSelectedList.length == 2) {
  //         this.Model.mpoNo = data[0].mpoNo;
  //         this.Model.etdDate =
  //           data[0].etdDate === '01/01/1900 00:00:00' ? '' : data[0].etdDate;
  //         this.Model.piDate = data[0].piDate;
  //         this.Model.mpoDate =
  //           data[0].mpoDate === '01/01/1900 00:00:00' ? '' : data[0].mpoDate;
  //         this.Model.ttDate = data[0].lcDate;
  //       } else {
  //         this.Model.mpoNo = null;
  //         this.Model.etdDate = null;
  //         this.Model.piDate = null;
  //         this.Model.mpoDate = null;
  //         this.Model.ttDate = null;
  //         this.Model.etaDate = null;
  //       }

  //       //console.log('piwise', data);
  //     },
  //     (error) => {}
  //   );
  // }

  LoadMpoList(PiNo) {
    this.MpoSelectedList = [];
    this.service.GetMpoName(PiNo).subscribe(
      (data: any[]) => {
        //console.log('MpoListData', data);
        this.MpoSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.MpoSelectedList.push({
            label: data[i].mpoNo,
            value: data[i].mpoNo,
            // mpoNo: data[i].mpoNo,
            // etdDate:
            //   data[i].etdDate === '01/01/1900 00:00:00' ? '' : data[i].etdDate,
            // piDate: data[i].piDate,
            // mpoDate:
            //   data[i].mpoDate === '01/01/1900 00:00:00' ? '' : data[i].mpoDate,
            // ttDate: data[i].lcDate,
          });
        }
        debugger;

        // if (this.MpoSelectedList.length == 2) {
        //   //console.log('mpoListLenght', this.MpoSelectedList);
        //   this.Model.mpoNo = data[0].mpoNo;
        //   // this.Model.etdDate =
        //   //   data[0].etdDate === '01/01/1900 00:00:00' ? '' : data[0].etdDate;
        //   // this.Model.piDate = data[0].piDate;
        //   // this.Model.mpoDate =
        //   //   data[0].mpoDate === '01/01/1900 00:00:00' ? '' : data[0].mpoDate;
        //   // this.Model.ttDate = data[0].lcDate;
        // } else {
        //   this.Model.mpoNo = null;
        //   this.Model.etdDate = null;
        //   this.Model.piDate = null;
        //   this.Model.mpoDate = null;
        //   this.Model.ttDate = null;
        //   this.Model.etaDate = null;
        // }

        //console.log('piwise', data);
      },
      (error) => {}
    );
  }

  MasterLcChangeEvent(event, nextInput: NgSelectComponent): void {
    
    console.log("masterFileNoList",this.masterFileNoList);
    const selectedValue = this.masterFileNoList.find(u => u.value === event);
    if (selectedValue)
    {
      this.Model.supplierName = selectedValue.option1;
      this.LoadLCDropDownList(selectedValue.label);
      this.global_File_No = selectedValue.label;
    }
    
    this.refreshAll();
   
    nextInput.focus();
  }
  InvoiceNoChangeEvent(event, nextInput: HTMLInputElement): void {
    nextInput.focus();
  }

  

  LcChangeEvent(event, nextInput: HTMLInputElement): void {
    this.LoadItemListByLcNo(this.global_File_No, event);
    
    const selectedItem = this.B2BLcSelectedList.filter(
      (f) => f.value === event
    );

    let selectedData = selectedItem[0];
    console.log('selectedItem', selectedData);

    if (selectedData) {
      //alert(selectedData.supplierId);
      this.Model.lcDate = selectedData.lcDate;
      //this.Model.supplierName = selectedData.supplierName;
      this.Model.invoiceNo = selectedData.invoiceNo;
      this.Model.shipmentClearanceDate = selectedData.shipmentClearanceDate;
      this.Model.commonLandingDate = selectedData.commonLandingDate;
      this.Model.shipmentClearanceDays = selectedData.shipmentClearanceDays;
      this.Model.etdDate = selectedData.etdDate;
      this.Model.etaDate = selectedData.etaDate;
      this.Model.actualDispatchDate=selectedData.actualDispatchDate;
    }

    nextInput.focus();
  }
LcdateChangeEvent(event: Event, nextInput: HTMLInputElement): void {
    nextInput.focus();
  }
  ShipmentClearanceDateChangeEvent(event: Event, nextInput: HTMLInputElement): void {
    nextInput.focus();
  }
   CommonLandingDateChangeEvent(event: Event, nextInput: HTMLInputElement): void {
     nextInput.focus();
     const days = this.getDaysBetweenDates(this.Model.shipmentClearanceDate,this.Model.commonLandingDate);
     this.Model.shipmentClearanceDays = days;
  }
  AcDispatchDateChangeEvent(event: Event): void {
 
  }
  ChangeAcArrivalDateInput(event: Event, nextInput: HTMLInputElement): void {
    nextInput.focus();
  }

  getDaysBetweenDates(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate difference in milliseconds
  const diffInMs = end.getTime() - start.getTime();

  // Convert milliseconds to days
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
}

  LoadB2bLcListMaster(MasterLc, b2bLcDetailId) {
    // this.B2BLcListMaster = [];
    this.service.GetB2bLcDataByMasterId(MasterLc).subscribe(
      (data: any[]) => {
        //  this.B2BLcListMaster = [data[0]];
        //console.log('listbyMaster', data);
        this.ItemDetailList = data;

        if (b2bLcDetailId > 0) {
          //this.saveButtonTitle = 'Update';
          debugger;
          this.Model.b2bLcId = this.ItemDetailList[0].b2bLcId;

          this.Model.masterLcId = this.ItemDetailList[0].masterLcId;
        }
      },
      (error) => {
        console.log('err', error);
      }
    );
  }

  LoadB2bLcListB2B(B2BLcNo, SupplierId, b2bLcDetailId) {
    // this.B2BLcListMaster = [];
    this.service.GetB2bLcDataByB2BLcId(B2BLcNo, SupplierId).subscribe(
      (data: any[]) => {
        //  this.B2BLcListMaster = [data[0]];
        // console.log('listbyMaster', data);
        this.ItemDetailList = data;

        if (b2bLcDetailId > 0) {
          //this.saveButtonTitle = 'Update';
          debugger;
          this.Model.b2bLcId = this.ItemDetailList[0].b2bLcId;

          this.Model.masterLcId = this.ItemDetailList[0].masterLcId;
        }
      },
      (error) => {
        console.log('err', error);
      }
    );
  }

  LoadTableByMasterId(masterId) {
    // GetActualDataListByMasterId
    this.service.GetActualDataListByMasterId(masterId).subscribe(
      (data: any[]) => {
        //  this.B2BLcListMaster = [data[0]];
        // console.log('selectTableMaster', data);
        this.selectTableShow = data;
      },
      (error) => {
        console.log('err', error);
      }
    );
  }

  LoadTableByB2BLcId(B2BLcId) {
    // GetActualDataListByMasterId
    this.service.GetActualDataListByB2BLcId(B2BLcId).subscribe(
      (data: any[]) => {
        //  this.B2BLcListMaster = [data[0]];
        //console.log('selectTableB2B', data);
        this.selectTableShow = data;
      },
      (error) => {
        console.log('err', error);
      }
    );
  }

  MpoChangeEvent(event) {
    // console.log('mpo select', this.MpoSelectedList);
    const selectedItem = this.MpoSelectedList.find(
      (item) => item.mpoNo === event
    );

    if (selectedItem) {
      // console.log('Selected Label:', selectedItem.label);
    }

    this.Model.etdDate = selectedItem.etdDate;
    this.Model.piDate = selectedItem.piDate;
    this.Model.mpoDate = selectedItem.mpoDate;
    this.Model.ttDate = selectedItem.ttDate;
    this.Model.etaDate = selectedItem.etaDate;
  }

  ngOnInit(): void {
    this.createForm();
    this.LoadCompanyList()
    
  }

  createForm() {
    if (parseInt(this.Model.adId) > 0) {
      this.customForm = this.fb.group({
        adId: [this.Model.adId, Validators.required],
        operation: ['Update'],
        masterLcId: [this.Model.masterLcId, Validators.required],
        masterLcDate: [this.Model.masterLcDate, Validators.required],
        b2bLcId: [this.Model.b2bLcId, Validators.required],
        b2bLcDate: [this.Model.b2bLcDate, Validators.required],
        shipmentDate: [this.Model.shipmentDate, Validators.required],
        expireDate: [this.Model.expireDate, Validators.required],
        supplierId: [this.Model.supplierId, Validators.required],
        piNo: [this.Model.piNo],
        piDate: [this.Model.piDate],
        mpoNo: [this.Model.mpoNo],
        mpoDate: [this.Model.mpoDate],
        etdDate: [this.Model.etdDate],
        actualDispatchDate: [this.Model.actualDispatchDate],
        etaDate: [this.Model.etaDate],
        actualArrivalDate: [this.Model.actualArrivalDate, Validators.required],
        ttDate: [this.Model.ttDate, Validators.required],
        forwardingDate: [this.Model.forwardingDate, Validators.required],
        customerClearanceDate: [this.Model.customerClearanceDate],
      });
    } else {
      //this.onClear();
    }
  }
  onClear(){ 
    this.saveButtonTitle = 'Save';
    this.refreshAll();
    this.Model.companyId = null;
    this.Model.fileNo = null;
    this.Model.lcNo = null;
    this.Model.supplierName = "";
  }
  LoadMasterFileNoList(CompanyId) {
    this.masterFileNoList = [];
    this.service.GetFileNoActualDate(CompanyId).subscribe(
      (data: any[]) => {
        this.masterFileNoList.push({
          label: '--- Select ---',
          value: null,
          option1:null
        });
        for (var i = 0; i < data.length; i++) {
          this.masterFileNoList.push({
            label: data[i].displayName,
            value: data[i].id,
            option1:data[i].option1
          });
        }
      },
      (error) => {}
    );
  }

  LoadMasterLcDropDownList() {
    this.masterLcList = [];
    this.service.GetMasterLcNoForAcDate().subscribe(
      (data: any[]) => {
        console.log('masterDrop', data);
        this.masterLcList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.masterLcList.push({
            label: data[i].displayName,
            value: data[i].id,
            masterlcDate: data[i].option1,
            b2blcValue: data[i].option2,
            b2blcName: data[i].option3,
            b2blcDate: data[i].option4,
            supplierId: data[i].option5,
            supplierName: data[i].option6,
            piNumber: data[i].option7,
            piDate: data[i].option8,
            mpoNo: data[i].option9,
            mpoDate: data[i].option10,
            b2blcdetailid: data[i].option11,
          });
        }
      },
      (error) => {}
    );
  }

  
  LoadItemListByLcNo(FileNo, LcNo) {
    this.ItemList = [];
    this.service.GetItemDataAcDate(FileNo, LcNo).subscribe(
      (data: any[]) => {
        this.ItemList = data;
      },
      (error) => {}
    );
  }

  LoadLCDropDownList(FileNo) {
    this.B2BLcSelectedList = [];
    this.service.GetLCNoForAcDate(FileNo).subscribe(
      (data: any[]) => {
        console.log('dataB2bSelect', data);
        this.B2BLcSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.B2BLcSelectedList.push({
            label: data[i].displayName,
            value: data[i].displayName,
            lcDate: data[i].option1,
            supplierName: data[i].option2,
            invoiceNo: data[i].option3,
            shipmentClearanceDate: data[i].option4,
            commonLandingDate: data[i].option5,
            shipmentClearanceDays: data[i].option6,
            etdDate: data[i].option7,
            etaDate: data[i].option8,
            actualDispatchDate:data[i].option9
          });
        }

        console.log('dateaa', this.B2BLcSelectedList);
      },
      (error) => {}
    );
  }

  master: any = {};
  onSubmit() {
     if (
      this.Model.companyId === null ||
      this.Model.companyId === '' ||
      this.Model.companyId === undefined
    ) {
      this.toastr.warning('Company Needed', 'Warning');
      return;
    }
    if (
      this.Model.fileNo === null ||
      this.Model.fileNo === '' ||
      this.Model.fileNo === undefined
    ) {
      this.toastr.warning('File No Needed', 'Warning');
      return;
    }

    if (
      this.Model.lcNo === null ||
      this.Model.lcNo === '' ||
      this.Model.lcNo === undefined
    ) {
      this.toastr.warning('Lc No Needed', 'Warning');
      return;
    }
    if (
      this.Model.lcDate === null ||
      this.Model.lcDate === '' ||
      this.Model.lcDate === undefined
    ) {
      this.toastr.warning('Lc Date Needed', 'Warning');
      return;
    }
    if (
      this.Model.supplierName === null ||
      this.Model.supplierName === '' ||
      this.Model.supplierName === undefined
    ) {
      this.toastr.warning('Supplier Needed', 'Warning');
      return;
    }
    if (
      this.Model.invoiceNo === null ||
      this.Model.invoiceNo === '' ||
      this.Model.invoiceNo === undefined
    ) {
      this.toastr.warning('Invoice Needed', 'Warning');
      return;
    }
    

    if (
      this.Model.shipmentClearanceDate === null ||
      this.Model.shipmentClearanceDate === '' ||
      this.Model.shipmentClearanceDate === undefined
    ) {
      this.toastr.warning('Shipment Clearance Date Needed', 'Warning');
      return;
    }
    if (
      this.Model.commonLandingDate === null ||
      this.Model.commonLandingDate === '' ||
      this.Model.commonLandingDate === undefined
    ) {
      this.toastr.warning('Common Landing Date Needed', 'Warning');
      return;
    }

    if (
      this.Model.shipmentClearanceDays === null ||
      this.Model.shipmentClearanceDays === '' ||
      this.Model.shipmentClearanceDays === undefined
    ) {
      this.toastr.warning('Shipment Clearance Days Needed', 'Warning');
      return;
    }

    // if (
    //   this.Model.etdDate === null ||
    //   this.Model.etdDate === '' ||
    //   this.Model.etdDate === undefined
    // ) {
    //   this.toastr.warning('ETD Needed', 'Warning');
    //   return;
    // }
    // if (
    //   this.Model.etaDate === null ||
    //   this.Model.etaDate === '' ||
    //   this.Model.etaDate === undefined
    // ) {
    //   this.toastr.warning('ETA Needed', 'Warning');
    //   return;
    // }
    // if (
    //   this.Model.actualDispatchDate === null ||
    //   this.Model.actualDispatchDate === '' ||
    //   this.Model.actualDispatchDate === undefined
    // ) {
    //   this.toastr.warning('Actual Dispatch Date Needed', 'Warning');
    //   return;
    // }

    if (this.isSubmitting) {
      return; // Prevent multiple submissions
    }
    this.isSubmitting = true;

    const CompanyId = this.Model.companyId;
    const FileNo = this.Model.fileNo;
    const LcNo = this.Model.lcNo;
    const LcDate = new Date(
      new Date(
        this.Model.lcDate === '' || this.Model.lcDate === undefined
          ? null
          : this.Model.lcDate
      ).getTime() -
        new Date(
          this.Model.lcDate === '' || this.Model.lcDate === undefined
            ? null
            : this.Model.lcDate
        ).getTimezoneOffset() *
          60000
    );
    const SupplierName = this.Model.supplierName;
    const InvoiceNo = this.Model.invoiceNo;

    const ShipmentClearanceDate = new Date(
      new Date(
        this.Model.shipmentClearanceDate === '' || this.Model.shipmentClearanceDate === undefined
          ? null
          : this.Model.shipmentClearanceDate
      ).getTime() -
        new Date(
          this.Model.shipmentClearanceDate === '' || this.Model.shipmentClearanceDate === undefined
            ? null
            : this.Model.shipmentClearanceDate
        ).getTimezoneOffset() *
          60000
    );

    const CommonLandingDate = new Date(
      new Date(
        this.Model.commonLandingDate === '' || this.Model.commonLandingDate === undefined
          ? null
          : this.Model.commonLandingDate
      ).getTime() -
        new Date(
          this.Model.commonLandingDate === '' || this.Model.commonLandingDate === undefined
            ? null
            : this.Model.commonLandingDate
        ).getTimezoneOffset() *
          60000
    );
    const ShipmentClearanceDays = this.Model.shipmentClearanceDays;

    const ETD = new Date(
      new Date(
        this.Model.etdDate === '' ||
        this.Model.etdDate === undefined
          ? null
          : this.Model.etdDate
      ).getTime() -
        new Date(
          this.Model.etdDate === '' ||
          this.Model.etdDate === undefined
            ? null
            : this.Model.etdDate
        ).getTimezoneOffset() *
          60000
    );

    const ETA = new Date(
      new Date(
        this.Model.etaDate === '' ||
        this.Model.etaDate === undefined
          ? null
          : this.Model.etaDate
      ).getTime() -
        new Date(
          this.Model.etaDate === '' ||
          this.Model.etaDate === undefined
            ? null
            : this.Model.etaDate
        ).getTimezoneOffset() *
          60000
    );

    const ActualDispatchDate = new Date(
      new Date(
        this.Model.actualDispatchDate === '' ||
        this.Model.actualDispatchDate === undefined
          ? null
          : this.Model.actualDispatchDate
      ).getTime() -
        new Date(
          this.Model.actualDispatchDate === '' ||
          this.Model.actualDispatchDate === undefined
            ? null
            : this.Model.actualDispatchDate
        ).getTimezoneOffset() *
          60000
    );

    this.master = {};

    this.master = {
      operation: 'Save',
      adId: 0,
      companyId:CompanyId,
      fileNo: this.global_File_No,
      lcNo: LcNo,
      lcDate: LcDate,
      supplierName: SupplierName,
      invoiceNo: InvoiceNo,
      shipmentClearanceDate: ShipmentClearanceDate,
      commonLandingDate: CommonLandingDate,
      shipmentClearanceDays:ShipmentClearanceDays,
      etdDate: ETD,
      etaDate: ETA,
      actualDispatchDate: ActualDispatchDate
    };

    console.log('saveActualList', this.master);
    setTimeout(() => {
      console.log('saveList', this.master);
      this.commonService.saveActualDate(this.master).subscribe(
        (res) => {
          // console.log(res);
          // this.onClear();

          if (parseInt(this.Model.adId) > 0) {
            this.toastr.success('Updated Successfully', 'Actual Date');
            this.saveButtonTitle = 'Save';
            this.refreshAll();
            this.Model.companyId = null;
            this.Model.fileNo = null;
            this.Model.supplierName = "";

          } else {
            this.toastr.success('Submitted Successfully', 'Actual Date');
            this.saveButtonTitle = 'Save';
            this.refreshAll();
            this.Model.companyId = null;
            this.Model.fileNo = null;
            this.Model.supplierName = "";
          }

          this.commonService.LoadActualDateList();
        },
        (err) => {
          //this.onClear();

          if (err.error[0] === 'Duplicate Save') {
            this.toastr.warning('Duplicate Data');
          } else {
            this.toastr.warning('Data Submited Failed');
          }
        }
      );
      this.isSubmitting = false; // Reset the state after submission
    }, 3000);
  }

  setFocus(field: string): void {
    setTimeout(() => {
      this.currentFocus = field;

      const element = document.querySelector(
        `input[ng-reflect-name="${field}"]`
      );
      if (element) {
        (element as HTMLInputElement).focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // After focus, force change detection if necessary
      this.cdr.detectChanges();
    }, 0);
  }
  // Method to clear the current focus
  clearFocus(): void {
    this.currentFocus = null;
  }

  @ViewChild('etdDateData') etdDateDataRef!: ElementRef; // Get reference to mpoInput

  onChangeMpoDate(event: Event): void {
    const mpoDateRefElement = this.etdDateDataRef.nativeElement;
    if (mpoDateRefElement) {
      mpoDateRefElement.focus(); // Focus on the next input
    }
  }

  @ViewChild('acDispatchDateInput') acDispatchDateInputRef!: ElementRef;
  @ViewChild('etaDateInput') EtaDateInputRef!: ElementRef;
  @ViewChild('acArrivalDateInput') actualArrivalDateInputRef!: ElementRef;
  onChangeETDDate(event: Event, nextInput: HTMLInputElement): void {
    nextInput.focus();
    const etdDateRefElement = this.EtaDateInputRef.nativeElement;
    if (etdDateRefElement) {
      etdDateRefElement.focus(); // Focus on the next input
    }
  }

  onChangeEtaDateInput(event: Event): void {
    const etaDateInputRefElement = this.acDispatchDateInputRef.nativeElement;
    if (etaDateInputRefElement) {
      etaDateInputRefElement.focus(); // Focus on the next input
    }
  }

  onChangeAcDispatchDate(event: Event): void {
    const acDispathcDateInputRefElement =
      this.actualArrivalDateInputRef.nativeElement;
    if (acDispathcDateInputRefElement) {
      acDispathcDateInputRefElement.focus(); // Focus on the next input
    }
  }

  @ViewChild('lcttfttDate') lcttfttDateInputRef!: ElementRef;

  onChangeAcArrivalDateInput(event: Event): void {
    const acArrivalDateInputRefElement = this.lcttfttDateInputRef.nativeElement;
    if (acArrivalDateInputRefElement) {
      acArrivalDateInputRefElement.focus(); // Focus on the next input
    }
  }

  @ViewChild('forwardingDateInput') forwardingDateInputRef!: ElementRef;

  onChangeLCTTFTTDateInput(event: Event): void {
    const lCTTFTTDateInputRefElement =
      this.forwardingDateInputRef.nativeElement;
    if (lCTTFTTDateInputRefElement) {
      lCTTFTTDateInputRefElement.focus(); // Focus on the next input
    }
  }

  @ViewChild('customClearDateInput') customClearDateInputRef!: ElementRef;
  onChangeForwardingDateInput(event: Event): void {
    const forwardingDateInputRefElement =
      this.customClearDateInputRef.nativeElement;
    if (forwardingDateInputRefElement) {
      forwardingDateInputRefElement.focus(); // Focus on the next input
    }
  }
}
