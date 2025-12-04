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

@Component({
  selector: 'app-process-name-entry',
  templateUrl: './process-name-entry.component.html',
  styleUrls: ['./process-name-entry.component.scss'],
})
export class ProcessNameEntryComponent {
  CompanyBankInfoForm: FormGroup | any;
  title: string | any;
  spinnerName = 'createGroup';
  noResult: boolean = false;
  model: any = null;
  // toastr: any;
  numbers: number[] = [];
  saveButtonTitle = 'Save';
  currentFocus: string | null = null;

  UnitList: any = [];
  BankList: any = [];
  BranchList: any = [];

  getCompanyBankList: any;
  getCompanyBankListDataKey: any;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // this.bsConfig = {
    //   dateInputFormat: 'YYYY-MM-DD', // Your desired date format
    // };
  }

  Model: any = {
    unitId: null,
    activeStatus: true,
    processName: null,
  };

  async ngOnInit() {
    this.LoadUnit();
    this.Model.activeStatus = true;
  }

  onChangeActiveStatus(event: any) {
    this.Model.activeStatus = event.target.checked;
  }

  //////////////////////////Load Dropdown Start//////////////////////
  LoadUnit() {
    this.UnitList = [];
    this.service.GetUnitName().subscribe(
      (data: any[]) => {
        console.log('UnitId;', data);
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
  onUnitChange(event) {
    console.log('==', event);
  }

  LoadBranchNameAndAddressUsingBankNo(BankNo) {
    this.BranchList = [];
    this.service.GetCompanyBankBranchAndAddressByBankNo(BankNo).subscribe(
      (data: any[]) => {
        this.BranchList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.BranchList.push({
            label: data[i].displayName,
            value: data[i].id,
            branchAddress: data[i].option1,
          });
        }
      },
      (error) => {}
    );
  }

  LoadSaveRoutingandSwiftCode(CompanyId, BankNo, BranchId) {
    this.service
      .GetCompanyBankRoutingSwiftCodeByParams(CompanyId, BankNo, BranchId)
      .subscribe(
        (data: any[]) => {
          console.log('data--Swift and Routing', data);
          this.Model.SwiftCode =
            data[0].swiftCode === null ||
            data[0].swiftCode === '' ||
            data[0].swiftCode === undefined
              ? ''
              : data[0].swiftCode;
          this.Model.RoutingNo =
            data[0].routingNo === null ||
            data[0].routingNo === '' ||
            data[0].routingNo === undefined
              ? ''
              : data[0].routingNo;
        },
        (error) => {}
      );
  }

  //////////////////////////Load Dropdown End//////////////////////

  ///////////////////////Change Event Start/////////////////
  CompanyChangeEvent(event) {
    console.log('changeCompanyEvent', event);
    ////Clear before new Data Insert////
    this.Model.CompanyBankId = 0;
    this.Model.CompanyAddress = null;
    this.Model.BankNo = null;
    this.Model.BankName = null;
    this.Model.BranchId = null;
    this.Model.BranchName = null;
    this.Model.BranchAddress = null;
    this.Model.SwiftCode = null;
    this.Model.RoutingNo = null;
    this.saveButtonTitle = 'Save';
    ////Clear before new Data Insert////

    this.Model.CompanyId = event.value;
    this.Model.CompanyName = event.label;
    this.Model.CompanyAddress = event.companyAdd;
  }

  BankChangeEvent(event) {
    console.log('BankEvent', event);

    ///Clear Data before new Data Load///
    this.Model.CompanyBankId = 0;
    this.Model.BranchId = null;
    this.Model.BranchName = null;
    this.Model.BranchAddress = null;
    this.Model.SwiftCode = null;
    this.Model.RoutingNo = null;
    this.saveButtonTitle = 'Save';
    ///Clear Data before new Data Load///
    this.Model.BankNo = event.value;
    this.Model.BankName = event.label;
    this.LoadBranchNameAndAddressUsingBankNo(event.value);
  }

  BranchChangeEvent(event) {
    console.log('BranchEvent==', event);
    this.Model.BranchName = event.label;
    this.Model.BranchId = event.value;
    this.Model.BranchAddress = event.branchAddress;
    this.LoadSaveRoutingandSwiftCode(
      this.Model.CompanyId,
      this.Model.BankNo,
      this.Model.BranchId
    );
  }
  ///////////////////////Change Event End/////////////////
  onSubmit() {
    console.log('submit show model', this.Model);

    if (
      this.Model.unitId === null ||
      this.Model.unitId === undefined ||
      this.Model.unitId === '' ||
      this.Model.unitId === 0
    ) {
      this.toastr.warning('Please Select  Unit Name', 'Warning');
      return;
    }

    if (
      this.Model.processName === null ||
      this.Model.processName === undefined ||
      this.Model.processName === '' ||
      this.Model.processName === 0
    ) {
      this.toastr.warning('Please Enter Proper Process Name', 'Warning');
      return;
    }

    console.log('check Model', this.Model);
    let savePayload = {
      operation: this.Model.CompanyBankId === 0 ? 'INSERT' : 'UPDATE',
      companyBankId: this.Model.CompanyBankId,
      companyId: this.Model.CompanyId,
      companyName: this.Model.CompanyName,
      companyAddress:
        this.Model.CompanyAddress === null ||
        this.Model.CompanyAddress === undefined ||
        this.Model.CompanyAddress === ''
          ? ''
          : this.Model.CompanyAddress,
      bankNo: this.Model.BankNo,
      bankName: this.Model.BankName,
      branchId: this.Model.BranchId,
      branchName: this.Model.BranchName,
      branchAddress:
        this.Model.BranchAddress === null ||
        this.Model.BranchAddress === undefined ||
        this.Model.BranchAddress === ''
          ? ''
          : this.Model.BranchAddress,
      swiftCode:
        this.Model.SwiftCode === null ||
        this.Model.SwiftCode === undefined ||
        this.Model.SwiftCode === ''
          ? ''
          : this.Model.SwiftCode,
      routingNo:
        this.Model.RoutingNo === null ||
        this.Model.RoutingNo === undefined ||
        this.Model.RoutingNo === ''
          ? ''
          : this.Model.RoutingNo,
      isActive: this.Model.activeStatus === true ? 1 : 0,
    };
    console.log('payload', savePayload);
    this.service.saveCompanyBankInfoData(savePayload).subscribe(
      (res) => {
        console.log(res);
        console.log('create Res Data', res);
        let resultCheck: any = (res as { resultCode: number }).resultCode;
        if (resultCheck === '-1') {
          this.toastr.error('Duplicate Data Found', 'Company Bank Info');
        } else {
          if (this.Model.CompanyBankId !== 0) {
            this.toastr.success('Updated Successfully', 'Company Bank Info');
          } else {
            this.toastr.success('Submitted Successfully', 'Company Bank Info');
          }
        }
        this.onClear();
        this.saveButtonTitle = 'Save';
      },
      (err) => {
        this.toastr.success('Submission Error', 'Company Bank Info');
      }
    );
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

  onClear() {
    this.Model.unitId = 0;
    this.Model.processName = null;
    this.Model.activeStatus = true;
    this.saveButtonTitle = 'Save';
  }

  editCompanyBankList(data) {
    console.log('termsPayment', data);
    this.Model.CompanyBankId = data.companyBankId;
    this.Model.CompanyId = data.companyId;
    this.Model.CompanyName = data.companyName;
    this.Model.CompanyAddress =
      data.companyAddress === null ||
      data.companyAddress === undefined ||
      data.companyAddress === ''
        ? ''
        : data.companyAddress;
    this.Model.BankNo = data.bankNo;
    this.Model.BankName = data.bankName;
    this.Model.BranchId = data.branchId;
    this.Model.BranchName = data.branchName;
    this.Model.BranchAddress =
      data.branchAddress === null ||
      data.branchAddress === undefined ||
      data.branchAddress === ''
        ? ''
        : data.branchAddress;
    this.Model.SwiftCode =
      data.swiftCode === null ||
      data.swiftCode === undefined ||
      data.swiftCode === ''
        ? ''
        : data.swiftCode;
    this.Model.RoutingNo =
      data.routingNo === null ||
      data.routingNo === undefined ||
      data.routingNo === ''
        ? ''
        : data.routingNo;
    this.Model.activeStatus = data.isActive === 1 ? true : false;
    this.saveButtonTitle = 'Update';
  }

  deleteCompanyBankData(data) {
    let result = confirm('Are you sure you want to delete this data?');
    let deletePayload = {
      operation: 'DELETE',
      companyBankId: data.companyBankId,
      companyId: data.companyId,
      companyName: data.companyName,
      companyAddress:
        data.companyAddress === null ||
        data.companyAddress === undefined ||
        data.companyAddress === ''
          ? ''
          : data.companyAddress,
      bankNo: data.bankNo,
      bankName: data.bankName,
      branchId: data.branchId,
      branchName: data.branchName,
      branchAddress:
        data.branchAddress === null ||
        data.branchAddress === undefined ||
        data.branchAddress === ''
          ? ''
          : data.branchAddress,
      swiftCode:
        data.swiftCode === null ||
        data.swiftCode === undefined ||
        data.swiftCode === ''
          ? ''
          : data.swiftCode,
      routingNo:
        data.routingNo === null ||
        data.routingNo === undefined ||
        data.routingNo === ''
          ? ''
          : data.routingNo,
      isActive: data.isActive === true ? 1 : 0,
    };
    if (result) {
      this.service.saveCompanyBankInfoData(deletePayload).subscribe(
        (res) => {
          console.log(res);
          this.onClear();
          this.toastr.success('Deleted Successfully', 'Company Bank Info');
        },
        (err) => {
          this.toastr.success('Deleted Failed', 'Company Bank Info');
        }
      );
    } else {
      this.toastr.error('Deleted Failed', 'Company Bank Info');
    }
  }
}
