import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { SelectItem } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { TokenService } from 'src/app/shared/services/token.service';
import { environment } from 'src/environments/environment';
import { RoleService } from './role.service';
import { WashSetupService } from './washsetup.service';

import { CategoryService } from '../services/category.service';
import { CommonFiles } from '../model/common-files.model';

@Injectable({
  providedIn: 'root',
})
export class CommonServiceService {
  //baseUrl = environment.apiUrl + "mascocommercial/";
  baseUrl = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  BuyerSelectedList: any = [];
  StyleSelectedList: any = [];
  JobSelectedList: any = [];
  ConcernPersonSelectedList: any = [];
  BankSelectedList: any = [];
  BranchSelectedList: any = [];
  MPOSelectedList: any = [];
  PiOrBillSelectedList: any = [];
  masterLcList: any = [];
  masterLcAmendList: any = [];
  ItemDetailList: any = [];
  TenorList: any = [];
  UomList: any = [];
  B2BLcListMaster: any = [];
  B2BLcListDetail: any = [];
  PaymentList: any = [];
  ItemList: any = [];

  constructor(
    private toastr: ToastrService,
    public SetupService: WashSetupService,

    public categoryServices: CategoryService,
    private http: HttpClient,
    private token: TokenService,
    public roleService: RoleService
  ) {}

  buyerList: any = [];
  LoadBuyerDropDownList(UnitId) {
    this.BuyerSelectedList = [];
    this.SetupService.GetBuyerName(UnitId).subscribe(
      (data: any[]) => {
        console.log('buyerList', data);
        this.buyerList = data[0];
        this.BuyerSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < this.buyerList.length; i++) {
          this.BuyerSelectedList.push({
            label: this.buyerList[i].displayName,
            value: this.buyerList[i].id,
          });
        }
      },
      (error) => {}
    );
  }

  LoadStyleDropDownList(buyerId) {
    this.StyleSelectedList = [];
    this.SetupService.GetStyleNameByBuyerId(buyerId).subscribe(
      (data: any[]) => {
        if (data.length > 0) {
          this.StyleSelectedList.push({ label: '--- Select ---', value: null });
          for (var i = 0; i < data.length; i++) {
            this.StyleSelectedList.push({
              label: data[i].displayName,
              value: data[i].id,
            });
          }
        }
      },
      (error) => {}
    );
  }

  LoadJobDropDownList(buyerId) {
    this.JobSelectedList = [];
    this.SetupService.GetJobNameByBuyerId(buyerId).subscribe(
      (data: any[]) => {
        this.JobSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.JobSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
          });
        }
      },
      (error) => {}
    );
  }
  LoadJobByStyleDropDownList(buyerId, styleId) {
    this.JobSelectedList = [];
    this.SetupService.GetJobNameByBuyerIdStyle(buyerId, styleId).subscribe(
      (data: any[]) => {
        this.JobSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.JobSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
          });
        }
      },
      (error) => {}
    );
  }

  LoadConcernPersonDropDownList() {
    debugger;
    this.ConcernPersonSelectedList = [];
    this.SetupService.GetConcernPersonName().subscribe(
      (data: any[]) => {
        this.ConcernPersonSelectedList.push({
          label: '--- Select ---',
          value: null,
        });
        for (var i = 0; i < data.length; i++) {
          this.ConcernPersonSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
            desig: data[i].option1,
          });
        }
      },
      (error) => {}
    );
  }

  LoadBankDropDownList() {
    this.BankSelectedList = [];
    this.SetupService.GetBankName().subscribe(
      (data: any[]) => {
        this.BankSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.BankSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
          });
        }
      },
      (error) => {}
    );
  }

  LoadBranchDownList(bankId) {
    this.BranchSelectedList = [];
    this.SetupService.GetBranchName(bankId).subscribe(
      (data: any[]) => {
        this.BranchSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.BranchSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
            address: data[i].option1,
          });
        }
      },
      (error) => {}
    );
  }

  createMasterLC(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SaveMasterLc', obj, {
      headers: this.token.headerToken(),
    });
  }
  createMasterLCAmend(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SaveMasterLcAmend', obj, {
      headers: this.token.headerToken(),
    });
  }
  createProformaInvoiceForeign(obj: any) {
    //console.log("obj", obj);

    return this.http.post(
      this.baseUrl_ + 'Setup/SaveProformaInvoiceForeign',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  createProformaInvoiceLocal(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveProformaInvoiceLocal',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  createB2bLC(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveB2BLCNew', obj, {
      headers: this.token.headerToken(),
    });
  }

  LoadMPOListSCM() {
    this.MPOSelectedList = [];
    this.SetupService.GetMPOName().subscribe(
      (data: any[]) => {
        this.MPOSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.MPOSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
            pino: data[i].option1,
            pidate: data[i].option2,
          });
        }
      },
      (error) => {}
    );
  }

  LoadMPOListByPiNoSCM(PiNo) {
    this.MPOSelectedList = [];
    this.SetupService.GetMPONameByPiNo(PiNo).subscribe(
      (data: any[]) => {
        this.MPOSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.MPOSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
            pino: data[i].option1,
            pidate: data[i].option2,
          });
        }
      },
      (error) => {}
    );
  }

  LoadMPOListByMasterLc(LCNo) {
    this.MPOSelectedList = [];
    this.SetupService.GetMPONameByMasterLcNo(LCNo).subscribe(
      (data: any[]) => {
        this.MPOSelectedList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.MPOSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
            pino: data[i].option1,
            pidate: data[i].option2,
          });
        }
      },
      (error) => {}
    );
  }

  LoadMPOListBySupplier(supplierid) {
    this.MPOSelectedList = [];
    this.SetupService.GetMPONameBySupplier(supplierid).subscribe(
      (data: any[]) => {
        this.MPOSelectedList.push({ label: '--- Select ---', value: -1 });
        for (var i = 0; i < data.length; i++) {
          this.MPOSelectedList.push({
            label: data[i].displayName,
            value: data[i].id,
            pino: data[i].option1,
            pidate: data[i].option2,
          });
        }
      },
      (error) => {}
    );
  }

  LoadMPOForwardingListBySupplierandUnitId(supplierId, TypeName) {
    this.MPOSelectedList = [];
    this.SetupService.GetMPOForwardingNoBySupplier(
      supplierId,
      TypeName
    ).subscribe(
      (data: any[]) => {
        this.MPOSelectedList.push({ label: '--- Select ---', value: -1 });
        for (var i = 0; i < data.length; i++) {
          this.MPOSelectedList.push({
            label: data[i].displayName,
            value: data[i].displayName,
            pino: data[i].option1,
            pidate: data[i].option2,
            piValue: data[i].option3,
            fwId: parseInt(data[i].option4),
          });
        }
      },
      (error) => {
        console.log('Error of MPO List By Supplier and Unit', error);
      }
    );
  }

  LoadPiNoListBySupplier(supplierid) {
    this.PiOrBillSelectedList = [];
    this.SetupService.GetPiNoNameBySupplier(supplierid).subscribe(
      (data: any[]) => {
        this.PiOrBillSelectedList.push({ label: '--- Select ---', value: -1 });
        for (var i = 0; i < data.length; i++) {
          this.PiOrBillSelectedList.push({
            label: data[i].displayName,
            value: data[i].displayName,
            pidate: data[i].option1,
            mpo: data[i].option2,
          });
        }
      },
      (error) => {}
    );
  }

  LoadMPOListByPiNoSCMWithoutSelect(PiNo) {
    this.MPOSelectedList = [];
    this.SetupService.GetMPONameByPiNo(PiNo).subscribe(
      (data: any[]) => {
        //this.MPOSelectedList.push({ label: "--- Select ---", value: null });
        for (var i = 0; i < data.length; i++) {
          this.MPOSelectedList.push({
            label: data[i].displayName,
            value: data[i].displayName,
            //pino:data[i].option1,
            //pidate:data[i].option2
          });
        }
      },
      (error) => {}
    );
  }

  LoadPiOrBillListSCM() {
    this.PiOrBillSelectedList = [];
    this.SetupService.GetPiOrBill().subscribe(
      (data: any[]) => {
        this.PiOrBillSelectedList.push({
          label: '--- Select ---',
          value: null,
        });
        for (var i = 0; i < data.length; i++) {
          this.PiOrBillSelectedList.push({
            label: data[i].displayName,
            option1: data[i].option1,
            option2: data[i].option2,
            option3: data[i].option3,
          });
        }
      },
      (error) => {}
    );
  }
  LoadMasterLcList(unitid) {
    this.masterLcList = [];
    this.SetupService.GetMasterLcdata(unitid).subscribe(
      (data: any[]) => {
        this.masterLcList = data;
        console.log('MasterLC', data);
      },
      (error) => {}
    );
  }
  LoadMasterLcAmendList(masterlcid) {
    this.masterLcAmendList = [];
    this.SetupService.GetMasterLcAmenddata(masterlcid).subscribe(
      (data: any[]) => {
        this.masterLcAmendList = data;
        console.log('MasterAmendLC', data);
      },
      (error) => {}
    );
  }

  DeleteList(id, unitid) {
    const isConfirmed = confirm('Are you sure you want to delete this data?');
    if (isConfirmed) {
      this.masterLcList = [];
      this.SetupService.deleteMasterList(id).subscribe(
        (data: any[]) => {
          this.masterLcList = data;
          this.toastr.success('Deleted Successfully', 'Master LC');
          //this.LoadMasterLcList(unitid);
        },
        (error) => {}
      );
    } else {
      this.toastr.info('Deletion canceled.', 'Master LC');
    }
  }

  DeleteMasterLcDetailList(masterlcdetailId, ItemDetailList, i) {
    const isConfirmed = confirm('Are you sure you want to delete this data?');
    if (isConfirmed) {
      //this.ItemDetailList = [];
      this.SetupService.deleteMasterDetailList(masterlcdetailId).subscribe(
        (data: any[]) => {
          //this.ItemDetailList = data;
          this.toastr.success('Deleted Successfully', 'Master  Detail');
          ItemDetailList.splice(i, 1);
          //this.LoadMasterLcList(unitid);
        },
        (error) => {}
      );
    } else {
      this.toastr.info('Deletion canceled.', 'Master LC');
    }
  }

  saveLCTTFTT(obj: any) {
    //console.log("obj", obj);

    // if(obj.activeStatus === false){
    //   obj.activeStatus =0;
    // }else if(obj.activeStatus === true) {
    //   obj.activeStatus =1;
    // }

    return this.http.post(this.baseUrl_ + 'Setup/SaveCashLcVersion2', obj, {
      headers: this.token.headerToken(),
    });
  }
  saveLCTTFTTAmendment(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SaveCashLcAmendment', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveB2BLcAmendment(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveB2BLCLatestAmend', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveActualDate(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveActualDate', obj, {
      headers: this.token.headerToken(),
    });
  }
  LoadActualDateList() {
    this.masterLcList = [];
    this.SetupService.GetActualDatedata().subscribe(
      (data: any[]) => {
        this.masterLcList = data;
        console.log('Actualdata', data);
      },
      (error) => {}
    );
  }

  DeleteActualDateList(id: number) {
    const isConfirmed = confirm('Are you sure you want to delete this data?');
    if (isConfirmed) {
      this.masterLcList = [];
      this.SetupService.deleteActualdateList(id).subscribe(
        (data: any[]) => {
          //this.masterLcList=data;
          this.toastr.success('Deleted Successfully', 'Actual Date');
          this.LoadActualDateList();
        },
        (error) => {}
      );
    } else {
      this.toastr.info('Deletion canceled.', 'Actual Date');
    }
  }

  // saveImportCosting(obj: any) {
  //   //console.log("obj", obj);

  //   return this.http.post(this.baseUrl_ + 'Setup/SaveImportCosting', obj, {
  //     headers: this.token.headerToken(),
  //   });
  // }

  saveImportCostingNew(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveImportCosting', obj, {
      headers: this.token.headerToken(),
    });
  }
  LoadImportCostingList() {
    this.masterLcList = [];
    this.SetupService.GetImportdata().subscribe(
      (data: any[]) => {
        this.masterLcList = data;
        console.log('MasterLC', data);
      },
      (error) => {}
    );
  }
  DeleteImportCostingList(id) {
    const isConfirmed = confirm('Are you sure you want to delete this data?');
    if (isConfirmed) {
      this.masterLcList = [];
      this.SetupService.deleteImportCostingList(id).subscribe(
        (data: any[]) => {
          //this.masterLcList=data;
          this.toastr.success('Deleted Successfully', 'Import Costing');
          this.LoadImportCostingList();
        },
        (error) => {}
      );
    } else {
      this.toastr.info('Deletion canceled.', 'Import Costing');
    }
  }
  saveCommentsAction(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SaveCommentsAction', obj, {
      headers: this.token.headerToken(),
    });
  }
  saveUdDeclaration(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SaveUdDeclaration', obj, {
      headers: this.token.headerToken(),
    });
  }
  LoadCommentsActionList() {
    this.masterLcList = [];
    this.SetupService.GetCommentsActiondata().subscribe(
      (data: any[]) => {
        this.masterLcList = data;
        console.log('MasterLC', data);
      },
      (error) => {}
    );
  }

  DeleteCommentsAction(id) {
    const isConfirmed = confirm('Are you sure you want to delete this data?');
    if (isConfirmed) {
      this.masterLcList = [];
      this.SetupService.deleteCommentsAction(id).subscribe(
        (data: any[]) => {
          //this.masterLcList=data;
          this.toastr.success('Deleted Successfully', 'Comments Action');
          this.LoadCommentsActionList();
        },
        (error) => {}
      );
    } else {
      this.toastr.info('Deletion canceled.', 'Comments Action');
    }
  }
  LoadPaymentStatusUpdateList(b2blcid, supplierId, piNo, mpoNo) {
    this.PaymentList = [];
    this.SetupService.GetPaymentStatusdata(
      b2blcid,
      supplierId,
      piNo,
      mpoNo
    ).subscribe(
      (data: any[]) => {
        this.PaymentList = data;
        console.log('MasterLC', data);
      },
      (error) => {}
    );
  }

  savePaymentStatus(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SavePaymentStatus', obj, {
      headers: this.token.headerToken(),
    });
  }
  saveMonthlyShipmentForcast(obj: any) {
    //console.log("obj", obj);

    return this.http.post(
      this.baseUrl_ + 'Setup/SaveMonthlyShipmentForcast',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  saveRequestLetter(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SaveRequestLetter', obj, {
      headers: this.token.headerToken(),
    });
  }
  saveTenor(obj: any) {
    //console.log("obj", obj);

    return this.http.post(this.baseUrl_ + 'Setup/SaveTenor', obj, {
      headers: this.token.headerToken(),
    });
  }

  LoadRequestLetterList() {
    this.masterLcList = [];
    this.SetupService.GetRequestLetterdata().subscribe(
      (data: any[]) => {
        this.masterLcList = data;
        console.log('MasterLC', data);
      },
      (error) => {}
    );
  }
  LoadTenorList() {
    this.masterLcList = [];
    this.SetupService.GetTenordata().subscribe(
      (data: any[]) => {
        this.masterLcList = data;
        console.log('MasterLC', data);
      },
      (error) => {}
    );
  }

  LoadTenorDropdown() {
    this.TenorList = [];
    this.SetupService.GetTenorDropdown().subscribe(
      (data: any[]) => {
        this.TenorList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.TenorList.push({
            id: data[i].id,
            label: data[i].displayName,
          });
        }
      },
      (error) => {}
    );
  }
  LoadUomDropdown() {
    this.UomList = [];
    this.SetupService.GetUomDropdown().subscribe(
      (data: any[]) => {
        this.UomList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.UomList.push({
            value: data[i].id,
            label: data[i].displayName,
          });
        }
      },
      (error) => {}
    );
  }

  LoadItemDropdown() {
    this.ItemList = [];
    this.SetupService.GetItemDropdown().subscribe(
      (data: any[]) => {
        console.log('itemList', data);
        this.ItemList.push({ label: '--- Select ---', value: null });
        for (var i = 0; i < data.length; i++) {
          this.ItemList.push({
            value: data[i].id,
            label: data[i].displayName,
          });
        }
      },
      (error) => {}
    );
  }

  DeleteRequestLetter(id) {
    const isConfirmed = confirm('Are you sure you want to delete this data?');
    if (isConfirmed) {
      this.masterLcList = [];
      this.SetupService.deleteRequestLetter(id).subscribe(
        (data: any[]) => {
          //this.masterLcList=data;
          this.toastr.success('Deleted Successfully', 'Request Letter');
          this.LoadRequestLetterList();
        },
        (error) => {}
      );
    } else {
      this.toastr.info('Deletion canceled.', 'Request Letter');
    }
  }
  // DeleteTenor(id) {

  //   this.masterLcList = [];
  //   this.SetupService.deleteTenor(id).subscribe((data: any[]) => {
  //    //this.masterLcList=data;
  //    this.toastr.success("Deleted Successfully", "Tenor");
  //    this.LoadTenorList();

  //   },
  //     (error) => {

  //     }
  //   );
  // }
  DeleteTenor(id: number) {
    // Show confirmation dialog
    const isConfirmed = confirm('Are you sure you want to delete this tenor?');

    if (isConfirmed) {
      this.masterLcList = [];
      this.SetupService.deleteTenor(id).subscribe(
        (data: any[]) => {
          // Notify the user of successful deletion
          this.toastr.success('Deleted Successfully', 'Tenor');
          // Reload the list after deletion
          this.LoadTenorList();
        },
        (error) => {
          // Handle the error here if needed
          this.toastr.error(
            'An error occurred while deleting the tenor.',
            'Error'
          );
        }
      );
    } else {
      // If the user cancels the deletion, you can handle it here (optional)
      this.toastr.info('Deletion canceled.', 'Tenor');
    }
  }

  saveB2BLatest(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveB2BLCLatest', obj, {
      headers: this.token.headerToken(),
    });
  }
  saveB2BLatestAmend(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveB2BLCLatestAmend', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveHiringBill(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveHiringBillAdjustment',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveBasePriceSet(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveBasePriceSetExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetBasePriceSetData(companyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetBasePriceDataByPartyNameExport?PartyNameId=' +
        companyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deletePartyWiseBasePriceById(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeletePartyWiseBasePriceById?id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  savePartyWisePenaltySet(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SavePartyWisePenaltySetExport',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPartyWisePenaltySetData(partyNameId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPartyPenaltySetExport?PartyNameId=' +
        partyNameId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deletePartyWisePenaltySetById(id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeletePartyWisePenaltySetById?id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveandUpdateB2BDraftToOriginal(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveandUpdateB2BLCDraftLCtoOriginal',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }
}
