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
  selector: 'app-operation-name-entry',
  templateUrl: './operation-name-entry.component.html',
  styleUrls: ['./operation-name-entry.component.scss'],
})
export class OperationNameEntryComponent {
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
  priorityList: number[] = [];

  getCompanyBankList: any;
  getCompanyBankListDataKey: any;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  Model: any = {
    activeStatus: true,
    operationName: null,
    priority: null,
    operationId: null,
  };

  async ngOnInit() {
    this.Model.activeStatus = true;
    this.priorityList = Array.from({ length: 50 }, (_, i) => i + 1);
  }
  onChangeActiveStatus(event: any) {
    this.Model.activeStatus = event.target.checked;
  }

  onSubmit() {
    console.log('submit show model', this.Model);

    if (
      this.Model.operationName === null ||
      this.Model.operationName === undefined ||
      this.Model.operationName === '' ||
      this.Model.operationName === 0
    ) {
      this.toastr.warning('Please Enter Proper Operation Name', 'Warning');
      return;
    }

    if (
      this.Model.priority === null ||
      this.Model.priority === undefined ||
      this.Model.priority === '' ||
      this.Model.priority === 0
    ) {
      this.toastr.warning('Please Enter Proper operation Name', 'Warning');
      return;
    }

    console.log('check Model', this.Model);
    let savePayload = {
      Operation:
        (this.Model.operationId === -1 || this.Model.operationId === null
          ? 0
          : this.Model.operationId) === 0
          ? 'INSERT'
          : 'UPDATE',
      OperationId:
        this.Model.operationId === -1 || this.Model.operationId === null
          ? 0
          : this.Model.operationId,
      OperationName: this.Model.operationName,
      Priority: this.Model.priority,
      IsActive: this.Model.activeStatus === true ? 1 : 0,
    };
    console.log('payload', savePayload);
    this.service.saveOperationNameEntryData(savePayload).subscribe(
      (res) => {
        console.log(res);
        console.log('create Res Data', res);
        let resultCheck: any = (res as { resultCode: number }).resultCode;
        if (resultCheck === '-1') {
          this.toastr.error('Duplicate Data Found', 'Operation Name Entry');
        } else {
          if (this.Model.operationId == 0 || this.Model.operationId == null) {
            this.toastr.success(
              'Submitted Successfully',
              'Operation Name Entry'
            );
          } else {
            this.toastr.success('Updated Successfully', 'Operation Name Entry');
          }
        }
        this.onClear();
        this.saveButtonTitle = 'Save';
      },
      (err) => {
        this.toastr.success('Submission Error', 'Operation Name Entry');
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
    this.Model.operationName = null;
    this.Model.activeStatus = true;
    this.Model.priority = null;
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
          this.toastr.success('Deleted Successfully', 'operation Name Entry');
        },
        (err) => {
          this.toastr.success('Deleted Failed', 'operation Name Entry');
        }
      );
    } else {
      this.toastr.error('Deleted Failed', 'operation Name Entry');
    }
  }
}
