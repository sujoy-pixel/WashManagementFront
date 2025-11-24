import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from 'src/app/shared/services/token.service';
import { environment } from 'src/environments/environment';
//import { CreateSchoolComponent } from "../schoolnames/create-school/create-school.component";
import { Observable } from 'rxjs';
import { User } from '../../forms/form-validation/user.module';

@Injectable({
  providedIn: 'root',
})
export class WashSetupService {
  // baseUrl = environment.apiUrl + "school/";           VMS/CreateVmsEntrySave
  // baseUrl_ = this.baseUrl.replace(/[?&]$/, "");

  baseUrl = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  constructor(private http: HttpClient, private token: TokenService) {}

  createSchoolName(obj: any) {
    if (obj.ActiveStatus === false) {
      obj.ActiveStatus = 0;
    } else if (obj.ActiveStatus === true) {
      obj.ActiveStatus = 1;
    }

    return this.http.post(this.baseUrl_ + 'VMS/CreateSchool', obj, {
      headers: this.token.headerToken(),
    });
  }
  GetBuyerName(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetBuyerList?Id=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetStyleNameByBuyerId(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetStyleList?BuyerId=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetJobNameByBuyerId(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetJobList?BuyerId=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetJobNameByBuyerIdStyle(Id: number, Id1: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetJobByStyleList?Id=' + Id + '&Id1=' + Id1,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetConcernPersonName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetConcernPersonList', {
      headers: this.token.headerToken(),
    });
  }
  GetConcernPersonNameAuto(filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Common/GetConcernPersonListAutocomplete?Filter=' +
        filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetItemAuto(filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetItemAutocomplete?Filter=' + filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetItemAutoCashLc(filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetItemAutocompleteCashLc?Filter=' + filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetHsCodeAuto(filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetHsCodeAutocomplete?Filter=' + filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPoAutoForeign(buyerId, filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPoAutocompleteForeign?BuyerId=' +
        buyerId +
        '&Filter=' +
        filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetStyleAutoForeign(buyerId, orderId, filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetStyleNoAutocompleteForeign?BuyerId=' +
        buyerId +
        '&OrderId=' +
        orderId +
        '&Filter=' +
        filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetColorAutoForeign(filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetColorAutocompleteForeign?Filter=' + filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetStyleAutoSelectForeign(buyerId, orderId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetStyleNoSelectAutocompleteForeign?BuyerId=' +
        buyerId +
        '&OrderId=' +
        orderId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetOrderStyleDataAutoSelectForeign(
    buyerId,
    orderId,
    styleId
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/ProformaInvoiceForeignOrderDetailsGet?BuyerId=' +
        buyerId +
        '&PO=' +
        orderId +
        '&StyleId=' +
        styleId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetPiNoAuto(filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetPiNoAutocomplete?Filter=' + filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetBankName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetBankList', {
      headers: this.token.headerToken(),
    });
  }
  GetBranchName(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetBranchList?BankNo=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCompanyBankInfoBankName(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetCompanyBankInfoBankList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCompanyBankBranchAndAddressByBankNo(BankNo: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetBranchNameAndAddressByBankNo?BankNo=${BankNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCompanyBankRoutingSwiftCodeByParams(
    CompanyId: number,
    BankNo: number,
    BranchId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetComapanyDataByParams?CompanyId=${CompanyId}&BankNo=${BankNo}&BranchId=${BranchId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCompanyBankBranchAndAddressByBankNoWithCompanyId(
    BankNo: number,
    CompanyId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetBranchNameAndAddressByBankNoAndCompanyId?BankNo=${BankNo}&CompanyId=${CompanyId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMPOName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetMpoListSCM', {
      headers: this.token.headerToken(),
    });
  }
  GetMPONameByPiNo(PiNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMpoListByPiNo?PiNo=' + PiNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMPONameByMasterLcNo(MasterLc: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetMpoListByMasterLc?MasterLc=' +
        encodeURIComponent(MasterLc),
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMPONameBySupplier(SupplierId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMpoListBySupplier?SupplierId=' + SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetPiNoNameBySupplier(SupplierId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetPiOrBillListSCM?SupplierId=' + SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMPOForwardingNoBySupplier(
    SupplierId: number,
    TypeName: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetMpoListBySupplierandCompanyId?SupplierId=${SupplierId}&TypeName=${TypeName}
		`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPiOrBill(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetPiOrBillListSCM', {
      headers: this.token.headerToken(),
    });
  }
  GetTenorDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetTenorDropdown', {
      headers: this.token.headerToken(),
    });
  }
  GetUomDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetUomDropdown', {
      headers: this.token.headerToken(),
    });
  }

  GetItemDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetItemDropdown', {
      headers: this.token.headerToken(),
    });
  }

  GetSupplierName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetSupplierList', {
      headers: this.token.headerToken(),
    });
  }
  GetSupplierNameLCTT(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetSupplierListLCTT', {
      headers: this.token.headerToken(),
    });
  }
  GetMasterFileNoAmendment(CompanyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMasterLcNoAmendment?CompanyId=' + CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetFileNoActualDate(CompanyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetFileNoActualDate?CompanyId=' + CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetFileNoCashLc(CompanyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetFileListCashLcAmend?CompanyId=' + CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetSupplierNamePaymentStatus(b2blcid: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetSupplierListPaymentStatus?Id=' + b2blcid,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetLcNoListPaymentStatus(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetLcNoListPaymentStatus?Id=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPaymentStatusData(B2BLcNo: string, LcType: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPaymentDataList?B2BLcNo=' +
        B2BLcNo +
        '&LcType=' +
        LcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetShipmentData(FinYear: string, Month: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetMonthlyShipmentForcast?FinYear=' +
        FinYear +
        '&Month=' +
        Month,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetFileNoPaymentStatus(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetFileNoPayment', {
      headers: this.token.headerToken(),
    });
  }
  GetPiName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetPiList', {
      headers: this.token.headerToken(),
    });
  }

  GetPiNameActualDate(supplierId: string, B2BLcId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPiListActualDate?SupplierId=' +
        supplierId +
        '&B2BLcId=' +
        B2BLcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPiNameImportCosting(supplierId: string, B2BLcId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPiListImport?SupplierId=' +
        supplierId +
        '&B2BLcId=' +
        B2BLcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetActualDatePi(supplierId: string, LcId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetActualDatePi?SupplierId=' +
        supplierId +
        '&LcId=' +
        LcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetPiNamePaymentStatus(supplierId: string, LcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPiListPaymentStatus?SupplierId=' +
        supplierId +
        '&LcNo=' +
        LcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  //deleteMasterList(id: number): Observable<any> {
  GetMpoName(PiNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetActualdataByPiNo?PiNo=' + PiNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMpoNamePaymentStatus(PiNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMPONoByPiNoPaymentStatus?PiNo=' + PiNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCurrencyName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetCurrencyList', {
      headers: this.token.headerToken(),
    });
  }

  GetCurrencyNameCashlc(piNo: any, type: any): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetCurrencyListCashLc?CashLcPINo=' +
        piNo +
        '&Type=' +
        type,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCurrencyNameForEdit(id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetCurrencyListMasterLcEdit?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetLcListFileNo(FileNo: any): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetLcNoFileList?Id=' + FileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCashLcListFileNo(FileNo: any): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetCashLcNoData?CashLcFileNo=' + FileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCashLcItemInfo(FileNo: any, LcNo: any): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetCashLcNoItemInfoData?Id=' +
        FileNo +
        '&LcNo=' +
        LcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLcNoImport(FileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetLcNoByFileImport?FileNo=' + FileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCompanyName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetCompanyList', {
      headers: this.token.headerToken(),
    });
  }
  GetCompanyNameCashLcAmend(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetCompanyListCashLcAmend',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCompanyNameWithShortCode(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetCompanyListByShortCodeId',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetBillofLadingORInvoice(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DuplicateInvoiceORBillOfLadingDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetForwardingCompanyName(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetForwardingCompanyList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCompanyBankInfoUnitNameAndAddress(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetCompanyBankUnitListAndAddress',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAmendmentLCompanyName(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetAmendmentLetterCompanyList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLienCompanyName(LetterType: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetLienCompanyList?LetterType=' + LetterType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetAccepCompanyName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetAccepCompanyList', {
      headers: this.token.headerToken(),
    });
  }
  GetAccepCompanyNameLcWise(LcType: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetAccepCompanyListLcWise?LcType=' + LcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetFinYear(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/dropdownfinancialyear', {
      headers: this.token.headerToken(),
    });
  }
  GetFinMonth(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/dropdownfinancialmonth',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetBuyerShipment(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/dropdownBuyerShipment', {
      headers: this.token.headerToken(),
    });
  }
  ExporterNameList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/ExporterNameDropdownForeign',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  ExporterNameListRevise(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/ExporterNameReviseDropdownForeign',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  BillOfLadingDropDownList(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/BillOfLadingDropdown', {
      headers: this.token.headerToken(),
    });
  }

  InvoiceDataByInvoiceNoRevise(
    ProformaInvoiceForeignId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/ProformaInvoiceReviseDataForeign?ProformaInvoiceForeignId=' +
        ProformaInvoiceForeignId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  BuyerNameListRevise(ExportUnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/BuyerReviseDropdownForeign?ExportUnitId=' +
        ExportUnitId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  ProformaInvoiceListRevise(ExportUnitId, BuyerId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/ProformaInviceReviseDropdownForeign?ExportUnitId=' +
        ExportUnitId +
        '&BuyerId=' +
        BuyerId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  ExporterBankList(ExporterNameId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/ExporterBankDropdownForeign?ExporterNameId=' +
        ExporterNameId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  ExporterBankBranchList(BankId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/ExporterBankBranchDropdownForeign?BankId=' +
        BankId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  ExportBuyerList(ExporterNameId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/BuyerDropdownForeign?ExporterNameId=' +
        ExporterNameId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  ExportBuyerBankList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/BuyerBankDropdownForeign',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  ConsigneeNameList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/ConsigneeNameDropdownForeign',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  PaymentMethodList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/PaymentMethodDropdownForeign',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  PaymentTermsList(PaymentMethod: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/PaymentTermsDropdownForeign?PaymentMethod=' +
        PaymentMethod,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetUnitName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetUnitList', {
      headers: this.token.headerToken(),
    });
  }
  GetPaymentTypeName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetPaymentTypeList', {
      headers: this.token.headerToken(),
    });
  }
  GetMasterLcdata(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetBuyerWiseMasterLcList?Id=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLcAmenddata(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMasterLcListAmend?Id=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLcDetaildata(Id: number, LcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetBuyerWiseMasterLcDetailList?Id=' +
        Id +
        '&LcNo=' +
        LcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterLcDetaildataWithLCNo(
    Id: number,
    masterlcNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetBuyerWiseMasterLcDetailListWithLcNo?Id=${Id}&MasterLcNo=${masterlcNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterLcDetaildataLcNo(Id: number, LcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetMasterDataByLcNoAmendmentList?Id=' +
        Id +
        '&LcNo=' +
        encodeURIComponent(LcNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteMasterList(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/DeleteMasterLCList?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteMasterDetailList(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/DeleteMasterLCDetailList?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterLcNo(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetMasterLcNo', {
      headers: this.token.headerToken(),
    });
  }
  GetB2bLcData(MasterLc: string, SupplierId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2bLcData?MasterLcNo=' +
        encodeURIComponent(MasterLc) +
        '&SupplierId=' +
        SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2bLcSearchData(MasterLc: string, SupplierId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2bLcSearchData?MasterLcId=' +
        MasterLc +
        '&SupplierId=' +
        SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCashLcDetailData(CashLcMasterId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetCashLcDetail?CashLcMasterId=' + CashLcMasterId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLcDetailData(B2BLCId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetB2BDetail?B2BLCId=' + B2BLCId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLcDetailDataVersion1(
    B2BLCId: number,
    b2BLCFTTRTGS: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BDetailVerson1?B2BLCId=' +
        B2BLCId +
        '&&B2BLCFTTRTGS=' +
        b2BLCFTTRTGS,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetAllBuyerName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetAllBuyerList', {
      headers: this.token.headerToken(),
    });
  }

  GetImportCostingByFileWithLc(FileNo: string, LcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetImportCostingDataByB2BfileandLC?FileNo=${FileNo}&LcNo=${LcNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLcAmendDetailData(
    B2BLCNo: string,
    B2BLCFile: string,
    type: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetB2BDetailForAmend?B2BLcNo=${B2BLCNo}&b2bFile=${B2BLCFile}&data=${type}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLcAmendDetailDataNew(B2BLCNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetB2BDetailAmend?B2BLCFTTRTGS=${B2BLCNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLcAmendListData(B2BLCFileNo, B2BLCNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetB2BAmendmentList?B2BLcFileNo=${B2BLCFileNo}&B2BLcNo=${B2BLCNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCashLcItemDetailData(CashLcMasterId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetCashLcDetailItem?CashLcMasterId=' +
        CashLcMasterId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCashLcItemDetailDataByCashLcDetailId(
    CashLcDetailId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetCashLcDetailItemByCashLcDetailId?CashLcDetailId=' +
        CashLcDetailId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteB2BList(MasterLcId: number, SupplierId: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/DeleteB2bLcData?MasterLcId=' +
        MasterLcId +
        '&SupplierId=' +
        SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetItemInfodata(Mpo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetItemInfoByMpo?Mpo=' + Mpo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetItemInfodataByAccFwNo(AccFwNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetItemInfoByAccumulateForwardingMPO?AccforwardingNo=' +
        AccFwNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCashLcAmendmentSearchdata222(FileNo: any, LcNo: any): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetCashLcNoAmendmentSearchData?FileNo=' +
        FileNo +
        '&LcNo=' +
        LcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCashLcAmendmentSearchdata(FileNo: any, LcNo: any): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetCashLcDetailIndividualCashLcNo?CashLcMasterId=' +
        FileNo +
        '&CashLcNo=' +
        LcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteCashLc(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(this.baseUrl_ + 'Setup/DeleteCashLc?Id=' + id, {
      headers: this.token.headerToken(),
    });
  }
  deleteCashLcDetail(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteCashLcDetail?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteCashLcPIDetail(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteCashLcDetailPI?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteCashLcPIDetailAmendment(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteCashLcDetailPIAmendment?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deletePaymentDetail(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeletePaymentRow?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteShipmentDetail(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteShipmentRow?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteOrderDetail(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteOrderDetailRowForeign?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteItemDetailRow(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteCashLcItemDetail?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteItemDetailRowAmendment(
    CashLcDetailId: number,
    CashLcItemDetailId: number,
    qty,
    totalValue
  ): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/DeleteCashLcItemDetailAmendment?CashLcDetailId=' +
        CashLcDetailId +
        '&CashLcItemDetailId=' +
        CashLcItemDetailId +
        '&Qty=' +
        qty +
        '&Value=' +
        totalValue,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteB2BItemDetailRow(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteB2BLcItemDetail?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteB2BPIBYPiId(b2bPiId: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/deleteB2BPI_Id?B2BPI_Id=' + b2bPiId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteB2BLcDetail(id: number, consumerPer: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/DeleteB2BLcDetail?Id=${id}&ConsumePer=${consumerPer}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  CancelB2BLCNoByDetailId(detailId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/B2BCancelStatus?B2BLCDetailId=' + detailId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterCompanyLoad(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetLetterCompany', {
      headers: this.token.headerToken(),
    });
  }

  GetMasterDataByMasterFileLien(masterfile: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetMasterDataByLien?MasterLcFileNo=${masterfile}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterDataByB2BFile(b2bfile: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMasterDataByB2BFile?B2BFileNo=' + b2bfile,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterDataByB2BFileLcWise(
    b2bfile: string,
    lctype: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetMasterDataByB2BFileLcWise?B2BFileNo=' +
        b2bfile +
        '&LcType=' +
        lctype,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterPiNoLoad(masterLcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Common/GetLetterPiNo?MasterLcNo=' +
        encodeURIComponent(masterLcNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterPiDateByPiNo(piNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetPiDateByLetterPiNo?piNo=${piNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterBranchByBankNo(bankNo: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetBranchByBankId?bankId=${bankNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterBranchByBankNoForwarding(
    bankNo: number,
    branchNo: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetBranchByBankIdForwardingLetter?bankId=${bankNo}&branchNo=${branchNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterBranchAddressByBranchNo(branchNo: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetBranchAddressByBranchId?branchNo=${branchNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterDataByMasterLcNo(masterLcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetDataByMasterLc?masterLcNo=' +
        encodeURIComponent(masterLcNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterLcValbyFileNoandLcNo(
    fileNo: string,
    masterLcNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetLetterMasterLcValue?B2BFileNo=' +
        fileNo +
        '&masterLcNo=' +
        masterLcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLienMasterLcValbyFileNoandLcNo(
    fileNo: string,
    masterLcNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetLienLetterMasterLcValue?MasterLcFileNo=' +
        fileNo +
        '&masterLcNo=' +
        encodeURIComponent(masterLcNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BMasterLcValbyFileNoandLcNo(
    fileNo: string,
    masterLcNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BAccepMasterLcValue?B2BFileNo=' +
        fileNo +
        '&B2BLcNo=' +
        encodeURIComponent(masterLcNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BMasterLcValbyFileNoandLcNoLcWise(
    fileNo: string,
    masterLcNo: string,
    lctype: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BAccepMasterLcValueLcWise?B2BFileNo=' +
        fileNo +
        '&B2BLcNo=' +
        encodeURIComponent(masterLcNo) +
        '&LcType=' +
        lctype,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLcDatebyMasterLcNo(masterLcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetForwardingMasterLcDateByMasterLcNo?MasterLcNo=' +
        masterLcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLienMasterLcDatebyMasterLcNo(
    masterLcNo: string,
    typeName: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetLienMasterLcDateByMasterLcNo?MasterLcNo=' +
        encodeURIComponent(masterLcNo) +
        '&TypeName=' +
        typeName,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCashLcMasterdata(CompanyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetCashLcData?CompanyId=' + CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCashLcFiledata(FileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetCashLcFileData?FileNo=' + FileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLcNewdata(fileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetB2BLCDataNew?fileNo=' + fileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLcNewdataAmend(B2BfileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetB2BLCDataNewAmend?B2BfileNo=' + B2BfileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCashLcNewdataAmend(B2BfileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetAmendCLDataByB2BFileNo?B2BFileNo=' + B2BfileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetActualDatedata(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetActualdateData', {
      headers: this.token.headerToken(),
    });
  }
  GetDuplicateMasterLCNo(MasterLCNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/DuplicateMasterLcCheck?MasterLCNo=' +
        encodeURIComponent(MasterLCNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteActualdateList(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteActualDateData?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  onSubmitStudentInformation(obj: FormData) {
    debugger;
    // var Data = {
    //   ...studentData,
    //   healthInfoData: healthInfoData,
    //   healthConditionData:healthConditionData,
    //   previousInstituteData:previousInstituteData,
    // }
    // console.log('studentData2: ', JSON.stringify(studentData));
    // console.log('healthinfo_JSON: ', JSON.stringify(healthInfoData));
    // console.log('health_Condition_JSON: ', JSON.stringify(healthConditionData));
    // console.log('previs_JSON: ', JSON.stringify(previousInstituteData));
    return this.http.post(
      this.baseUrl_ + 'AdmissionForm/CreateAdmissionForm',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  // }

  CreateSampleProjection(sampleProjectionTypeObj: any, sizeList: any[]) {
    var projectionData = {
      ...sampleProjectionTypeObj,
      sizeList: sizeList,
    };
    return this.http.post<any>(
      this.baseUrl_ + 'SampleDevelopment/CreateSampleProjection',
      projectionData,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetImportdata(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetImportCostingData', {
      headers: this.token.headerToken(),
    });
  }
  deleteImportCostingList(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteImportCostingData?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetCommentsActiondata(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetCommentsActionData', {
      headers: this.token.headerToken(),
    });
  }
  GetUddata(MasterLcid: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetUdDataByMasterLcFileNo?MasterLcId=' +
        MasterLcid,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetUddataChild(MasterLcid: number, B2BLcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetUdDataChildByMasterLcFileNo?MasterLcId=' +
        MasterLcid +
        '&B2BLcNo=' +
        B2BLcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetActionPlandata(id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetActionPlanData?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterListLc(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetMasterLcList', {
      headers: this.token.headerToken(),
    });
  }
  GetMasterLCFileNo(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/MasterFileDropdown', {
      headers: this.token.headerToken(),
    });
  }
  GetMasterLCFileNoUd(companyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/MasterFileDropdownUd?companyId=' + companyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLCNoUd(MasterLcId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/MasterLcNoUd?Id=' + MasterLcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BListLc(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetB2BLcList', {
      headers: this.token.headerToken(),
    });
  }
  deleteCommentsAction(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteCommentsActionData?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetPaymentStatusdata(
    b2bLcId: number,
    id: number,
    id1: string,
    id2: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPaymentStatus?b2bLcId=' +
        b2bLcId +
        '&supplierid=' +
        id +
        '&pino=' +
        id1 +
        '&mpono=' +
        id2,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostingbyFileandLc(
    B2BLcfileNo: string,
    lcNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetImportListByB2BlcFileWithLc?B2BLcfileNo=${B2BLcfileNo}&B2BLcNo=${lcNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetRequestLetterdata(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetRequestLetterData', {
      headers: this.token.headerToken(),
    });
  }
  GetTenordata(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetTenorData', {
      headers: this.token.headerToken(),
    });
  }
  deleteRequestLetter(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteRequestLetterData?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteTenor(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteTenorData?Id=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterLcNoForAcDate(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetActualDateMasterLcList',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetImportCostingFileNo(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetFileNoImport', {
      headers: this.token.headerToken(),
    });
  }
  GetHiringUnit(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/HiringUnitDropdown', {
      headers: this.token.headerToken(),
    });
  }
  GetProviderUnit(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/HiringProviderDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetPenaltyName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/PenaltyNameDropdown', {
      headers: this.token.headerToken(),
    });
  }
  GetHiringBillInfo(UnitId, ProviderId, ShipmentDate): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/HiringBillInfoDetail?UnitId=' +
        UnitId +
        '&ProviderId=' +
        ProviderId +
        '&ShipmentDate=' +
        ShipmentDate,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  // GetHiringBillInfo(UnitId, ProviderId, ShipmentDate): Observable<any> {
  //   return this.http.get<any[]>(
  //     this.baseUrl_ +
  //       'Setup/HiringBillInfoDetail?UnitId=' +
  //       UnitId +
  //       '&ProviderId=' +
  //       ProviderId +
  //       '&ShipmentDate=' +
  //       ShipmentDate,
  //     {
  //       headers: this.token.headerToken(),
  //     }
  //   );
  // }
  GetItemDataAcDate(FileNo: string, LcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetActualdateDataByLc?FileNo=' +
        FileNo +
        '&LcNo=' +
        LcNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLCNoForAcDate(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetActualDateB2BLcList',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetLCNoForAcDate(FileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetActualDateB2BLcList?FileNo=' + FileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetActualDatedataByAdId(adid: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetActualdateDataListByAdId?AdId=' + adid,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2bLcDataByMasterId(MasterLc: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2bLcDataByMasterLcNo?MasterLcNo=' +
        encodeURIComponent(MasterLc),
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2bLcDataByB2BLcId(B2BLcNo: string, SupplierId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2bLcDataByB2BLcNo?B2BLcNo=' +
        B2BLcNo +
        '&SupplierId=' +
        SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetActualDataListByMasterId(MasterLcId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetActualdateListByMasterId?MasterLcNo=' +
        encodeURIComponent(MasterLcId),
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetActualDataListByB2BLcId(B2BLcId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetActualdateListByB2bLc?B2BLcNo=' + B2BLcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostingByMasterId(
    FileNo: string,
    LcNo: string,
    mpoNumber: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetImportCostingDataByMasterLcNo?FileNo=' +
        FileNo +
        '&LcNo=' +
        encodeURIComponent(LcNo) +
        '&MpoNum=' +
        mpoNumber,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostingByB2BId(B2BLc: string, mpoNumber: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetImportCostingDataByB2BLcNo?B2BLcNo=' +
        B2BLc +
        '&MpoNum=' +
        mpoNumber,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostDetailBySupplierId(SupplierId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetImportCostingDetailsBySupplierId?SupplierId=' +
        SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostingSupplierByB2BId(B2BLc: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetImportCostingSupplierDropdown?B2BLcNo=' + B2BLc,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostListByMasterId(MasterLcId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetImportListByMasterId?MasterLcNo=' + MasterLcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostListByB2BId(B2BLcId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetImportListByB2bIdId?B2bLcNo=' + B2BLcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostListByCostId(CostId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetImportCostingDataByCostId?CostId=' + CostId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetImportCostChildByCostId(CostId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetImportCostingChildByCostId?CostId=' + CostId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetChargeHeadListData(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetChargeHeadData', {
      headers: this.token.headerToken(),
    });
  }

  createChargeHeadSetup(obj: any) {
    if (obj.activeStatus === false) {
      obj.activeStatus = 0;
    } else if (obj.activeStatus === true) {
      obj.activeStatus = 1;
    }

    return this.http.post(this.baseUrl_ + 'Setup/SaveHeadCharge', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetChargeHeadDataById(headId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetChargeDataById?id=' + headId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  DeleteChargeHeadById(headId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteBankChargeData?id=' + headId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetChargeHeadDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/ChargeHeadDropdown', {
      headers: this.token.headerToken(),
    });
  }

  GetSupplierCategoryListData(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/SupplierCategoryDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterFileNoDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/MasterFileDropdown', {
      headers: this.token.headerToken(),
    });
  }

  GetMasterFileNoDropdownByUnitId(UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/B2BMasterFileDropdown?UnitId=${UnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDraftB2BLCDataByCompanyId(CompanyId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetB2BDataForUpdateLCByCompany?CompanyId=${CompanyId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDraftB2BLCDataByFileNo(fileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetB2BDataForUpdateLcByLcFileNo?LcFileNo=${fileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BFileNoDropdownByUnitId(UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/B2BLCFileDropdownByUnit?UnitId=${UnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterFileNoDropdownByUnitIdForGoods(UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/B2BMasterFileDropdownForGoods?UnitId=${UnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLCNoByB2BLCFileNoForGoods(B2BLcFileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/B2BLCNoDropdownForGoods?B2BLcFileNo=${B2BLcFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLCNoByShortCodeForGoods(shortCode, goodType): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/B2BLcNoDropdownForGoodsUsingShortCode?unitShortCode=${shortCode}&goodType=${goodType}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLcFileNoByLCNoForGoods(LcNo, goodType): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetB2BLcFileDrpByLcNoGoodsDelivery?lcNo=${LcNo}&goodType=${goodType}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetItemDetailsByLCNoForGoods(LcNo, goodType): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetGoodsLcSelectItemDropdwon?LcNo=${LcNo}&goodType=${goodType}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLienMasterFileNoDropdownByUnitId(LetterType, UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/LienMasterFileDropdown?LetterType=' +
        LetterType +
        '&UnitId=' +
        UnitId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetFileNoDropdownByUnitId(CompanyId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/AccepB2BFileNoDropdown?CompanyId=' + CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetFileNoDropdownByUnitIdLcWise(CompanyId, LcType): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/AccepB2BFileNoDropdownLcWise?CompanyId=' +
        CompanyId +
        '&LcType=' +
        LcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetFileNoDropdownByUnitIdNoc(CompanyId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/MasterLcFileNoDropdownNoc?CompanyId=' + CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetForwardingB2BFileNoDropdownByUnitId(UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/ForwardingB2BMasterFileDropdown?UnitId=${UnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetForwardingCashLCDropdownByUnitId(UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/ForwardingCashLCFileDropdown?UnitId=${UnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAmendmentLetterLcDropdown(UnitId, LCName): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/AmendmentLetterFileDropdown?UnitId=${UnitId}&LCName=${LCName}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterConcernPersonDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/LetterConcernPersonList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterBankNameDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/LetterBankNameDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterReportCompanyDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMasterReportCompanyList',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetInvoiceNoDropdown(reportType: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/InvoiceNoDropdownReportLocal?reportType=' +
        reportType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetReportNameDropdown(parentMenu: string, UserId: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Report/GetReportName?ParentMenu=' +
        parentMenu +
        '&&UserId=' +
        UserId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLCUnitDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetLCUnitExport', {
      headers: this.token.headerToken(),
    });
  }
  GetMonthDropdown(LCUnitId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMonthExport?LCUnitId=' + LCUnitId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetFinYearDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetFinYearExport', {
      headers: this.token.headerToken(),
    });
  }
  GetMonthNameDropdown(FinYear: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMonthNameExport?FinYear=' + FinYear,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterReportBankDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMasterReportBankList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BReportBankDropdown(
    CompanyId: number,
    FromDate: string,
    ToDate: string,
    BankId: number,
    BuyerId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BBankDropdwon?CompanyId=' +
        CompanyId +
        '&FromDate=' +
        FromDate +
        '&ToDate=' +
        ToDate +
        '&BankId=' +
        BankId +
        '&BuyerId=' +
        BuyerId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BReportBuyerDropdown(
    CompanyId: number,
    FromDate: string,
    ToDate: string,
    BankId: number,
    BuyerId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BBuyerDropdwon?CompanyId=' +
        CompanyId +
        '&FromDate=' +
        FromDate +
        '&ToDate=' +
        ToDate +
        '&BankId=' +
        BankId +
        '&BuyerId=' +
        BuyerId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BReportMasterLcDropdown(
    CompanyId: number,
    FromDate: string,
    ToDate: string,
    BankId: number,
    BuyerId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BMasterLcDropdwon?CompanyId=' +
        CompanyId +
        '&FromDate=' +
        FromDate +
        '&ToDate=' +
        ToDate +
        '&BankId=' +
        BankId +
        '&BuyerId=' +
        BuyerId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BCombinedReportMasterLcFileNoDropdown(
    CompanyId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BCombinedDetailsReportMasterLcFileNoDropdown?CompanyId=' +
        CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BReportSupplierDropdown(
    CompanyId: number,
    FromDate: string,
    ToDate: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BDetailsReportSupplierDropdown?CompanyId=' +
        CompanyId +
        '&FromDate=' +
        FromDate +
        '&ToDate=' +
        ToDate,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLCFileNoDropdown(
    CompanyId: number,
    MasterLCFileNo: string,
    MasterLCNo: string,
    B2BLCId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BLCFileNoDropdwon?CompanyId=' +
        CompanyId +
        '&MasterLCFileNo=' +
        MasterLCFileNo +
        '&MasterLCNo=' +
        MasterLCNo +
        '&B2BLcId=' +
        B2BLCId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BReportMasterLcFileNoDropdown(
    CompanyId: number,
    FromDate: string,
    ToDate: string,
    SupplierId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BDetailsReportMasterLcFileNoDropdown?CompanyId=' +
        CompanyId +
        '&FromDate=' +
        FromDate +
        '&ToDate=' +
        ToDate +
        '&SupplierId=' +
        SupplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLCNoDropdown(CompanyId: number, B2BLcId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BLCNoDropdwon?CompanyId=' +
        CompanyId +
        '&B2BLcId=' +
        B2BLcId,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BReportMasterLcNoDropdown(
    CompanyId: number,
    FromDate: string,
    ToDate: string,
    SupplierId: number,
    MasterLcFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BDetailsReportMasterLcNoDropdown?CompanyId=' +
        CompanyId +
        '&FromDate=' +
        FromDate +
        '&ToDate=' +
        ToDate +
        '&SupplierId=' +
        SupplierId +
        '&MasterLCFileNo=' +
        MasterLcFileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BCombinedReportMasterLcNoDropdown(
    MasterLcFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BDetailsCombinedReportMasterLcNoDropdown?MasterLCFileNo=' +
        MasterLcFileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterReportBuyerDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetMasterReportBuyerList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLetterBankandBranchFilter(B2BFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetBankByB2BFileNoForLetter?B2BFileNo=${B2BFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetDashboardData(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetDashboardData', {
      headers: this.token.headerToken(),
    });
  }

  GetMasterLCNoDropdown(masterFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Common/GetMasterLcNoByB2BForwarding?B2BFileNo=${masterFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterLCNoDropdownForLien(masterFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetMasterLcNoByLien?MasterLcFileNo=${masterFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLCNoDropdownForAccep(b2bFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/AccepB2BLcNoDropdown?B2BFileNo=' + b2bFileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLCNoDropdownForAccepLcWise(
    b2bFileNo: string,
    lcType: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/AccepB2BLcNoDropdownLcWise?B2BFileNo=' +
        b2bFileNo +
        '&LcType=' +
        lcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLCFileDropdownForAcceptance(
    companyId: number,
    lcType: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/MasterLCDropdownLcWiseAccep?CompanyId=' +
        companyId +
        '&LcType=' +
        lcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetFileNoDropdownByUnitIdFileNoLcWise(
    CompanyId,
    MasterLcId,
    LcType
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/AccepB2BFileNoDropdownLcWise?CompanyId=' +
        CompanyId +
        '&MasterLcId=' +
        MasterLcId +
        '&LcType=' +
        LcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLCNoDropdownForAccepLcWiseLetter(
    b2bFileNo: string,
    lcType: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/AccepB2BLcNoDropdownLcWiseLetter?B2BFileNo=' +
        b2bFileNo +
        '&LcType=' +
        lcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLCNoDropdownForNoc(MasterLcFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/MasterLcNoDropdownNoc?MasterLcFileNo=' +
        MasterLcFileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BLCNoDropdownForNoc(MasterLcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/B2BLcNoDropdownNoc?MasterLcNo=' +
        encodeURIComponent(MasterLcNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetForwardingB2BLCDrop(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetForwardB2BLCFileDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterLcAmendmentNoDate(UnitId: number, MasterLcNo: any): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetMasterLcAmendmentNoDateList?UnitId=' +
        UnitId +
        '&MasterLcNo=' +
        encodeURIComponent(MasterLcNo),
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLcNoAll(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/TransferMasterLcDropdownNoc',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetB2BFileNoDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/B2BLCFileDropdown', {
      headers: this.token.headerToken(),
    });
  }
  GetB2BFileNoDropdownNew(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/B2BLCFileDropdownNew', {
      headers: this.token.headerToken(),
    });
  }

  GetForwardingAllDataBySelectB2BFile(b2bfileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetAllDataByForwardingbyB2BFile?B2BLcFileNo=${b2bfileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetForwardingCashAllDataBySelectCashLcFile(CashLcfileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetAllDataByForwardingbyCashLcFile?CashLcFileNo=${CashLcfileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetForwardingPiDataBySelectB2BFile(b2bfileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetCommaSepartedPiNoandDatebyB2BFileNo?B2BLcFileNo=${b2bfileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetForwardingCashPiDataBySelectCashLcFile(cashLcfileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetCommaSepartedPiNoandDatebyCashLcFileNo?CashLcFileNo=${cashLcfileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetForwardingShipandExpireDateDataBySelectB2BFile(
    b2bfileNo
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetCommaSepartedShipandExpireDatebyB2BFileNo?B2BLcFileNo=${b2bfileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BSupplierDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetB2BSupplier', {
      headers: this.token.headerToken(),
    });
  }

  GetdataByFileNo(fileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetB2BPageDataByFileNo?FileNo=' + fileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetdataByB2BLcFileNo(B2BFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetB2BPageDataByB2BFileNo?B2BFileNo=' + B2BFileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetSearchDataByFileNo(fileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetSeachListDataByFileNo?FileNo=' + fileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetUpdateB2BDataByB2BId(B2BId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetDataForUpdateByb2bId?B2BId=' + B2BId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetUpdateItemDetailDataByB2BId(B2BId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetDataForItemUpdateByb2bId?B2BId=' + B2BId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  deleteB2BLcDataList(id: number): Observable<any> {
    debugger;

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteB2BData?B2BId=' + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLcAmendDetailForTable(
    B2BLCNo: string,
    B2BLCFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetB2BDetailForAmendTable?B2BLcNo=${B2BLCNo}&&b2bFile=${B2BLCFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetConversionNumByCurrency(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetConversionValCurrency',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetConversionNumByCurrencyByB2BLcNo(B2BFileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetConversionValCurrencyAmendment?B2BFileNo=' +
        B2BFileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetConversionNumByCurrencyByMasterFileNo(FileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetConversionValCurrencyByFileNo?FileNo=' + FileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetConversionNumByCurrencyByB2BLcFileNo(B2BLcFileNo): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetConversionValCurrencyByB2BFileNo?B2BLcFileNo=' +
        B2BLcFileNo,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetConversionNumByCurrencyByB2BDetailId(B2BDetailId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetConversionValCurrencyByB2BDetailId?B2BDetailId=' +
        B2BDetailId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveForwardingLetter(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveForwardingLetter', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveForwardingCashLetter(obj: any) {
    //console.log("obj", obj);
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveForwardingCashLetter',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveLienLetter(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveLienLetter', obj, {
      headers: this.token.headerToken(),
    });
  }
  saveAcceptanceLetter(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveAcceptanceLetter', obj, {
      headers: this.token.headerToken(),
    });
  }
  saveNoc(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveNOC', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveAmendmentLetterLC(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveAmendmentLetterLC', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetMasterReportData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/ShowDataMasterLcReport', obj, {
      headers: this.token.headerToken(),
    });
  }
  GetMasterLCReportDetailData(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/ShowDataMasterLcDetailReport',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLCReportDetailData(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/ShowDataB2BLcDetailReport',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMonthlyShipmentData(obj: any) {
    return this.http.post(
      this.baseUrl_ +
        'Setup/GetMonthlyShipmentDataExport?LCUnitId=' +
        obj.LCUnitId +
        '&Month=' +
        obj.Month,
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetMasterLCB2BReportCombinedDetailData(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/ShowDataMasterLCB2BLCCombinedReport',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetB2BLCSubTypeListData(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetB2BLCTypeDataDropdwon',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLCFormatDataBySelectTenor(
    paymentType: string,
    lcType: string,
    tenor: string,
    bankNo: number,
    branchNo: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetB2BLCNoFormatData?TypePayment=${paymentType}&LcType=${lcType}&Tenor=${tenor}&BankNo=${bankNo}&BranchNo=${branchNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveSupplierData(obj: any) {
    if (obj.activeStatus === false) {
      obj.activeStatus = 0;
    } else if (obj.activeStatus === true) {
      obj.activeStatus = 1;
    }

    return this.http.post(
      this.baseUrl_ + 'Setup/SaveSupplierFromCommercial',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveGoodsDocument(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveGoodDocumentStatusCommercial',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  checkDuplicateForGoodsSave(
    goodType: string,
    lcNo: string,
    invoiceNo: string,
    billOfLading: string
  ) {
    return this.http.post(
      this.baseUrl_ +
        `Setup/GetGoodsDeliveryDuplicateCheck?GoodType=${goodType}&LcNo=${lcNo}&InvoiceNo=${invoiceNo}&BillofLadingNo=${billOfLading}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetSupplierListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetSupplierData', {
      headers: this.token.headerToken(),
    });
  }

  GetSupplierListDataById(supplierId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetSupplierListDataById?id=' + supplierId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  DeleteSupplierDataById(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteSupplierDataById?id=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDuplicateB2BInfo(data: string, paymentType: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/DuplicateB2BLcCheck?B2BLC=${data}&PaymentType=${paymentType}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAllGoodsDocumentStatus(lcNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetGoodsDocumentList?LcNo=${lcNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetGoodsServiceStatusByDeliveryDate(deliveryDate: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetGoodsExcelData?DeliveryDate=${deliveryDate}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAllGoodsDocumentStatusFOC(
    GoodType: string,
    companyId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetGoodsDocumentListForFOC?goodType=${GoodType}&companyId=${companyId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetGoodsDocumentStatusById(GoodsDocumentId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetGoodsDocumentsDataById?id=' + GoodsDocumentId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  DeleteGoodsDocumentDataById(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteGoodsDocumentDataById?id=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAmendmentLetterLcDataByFileNo(LCFileNo, LcName, UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetAllDataByAmendmentLetterLC?LcFileNo=${LCFileNo}&LCName=${LcName}&UnitId=${UnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAmendmentLetterLcNoAndDateByFileNo(LCFileNo, LcName): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetLCNoandDatebyLcFileNo?LcFileNo=${LCFileNo}&LCName=${LcName}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPaymentTermsListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetPaymentTermsData', {
      headers: this.token.headerToken(),
    });
  }

  savePaymentTermsData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SavePaymentTermsExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetConsigneeInfoListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetConsigneeData', {
      headers: this.token.headerToken(),
    });
  }

  saveConsigneeInfoData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveConsigneeExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetApplicantInfoListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetApplicantData', {
      headers: this.token.headerToken(),
    });
  }

  saveApplicantDataInfoData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveApplicantExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetBuyerExport(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetBuyerDropdown', {
      headers: this.token.headerToken(),
    });
  }

  GetBuyerBankListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetBuyerBankData', {
      headers: this.token.headerToken(),
    });
  }

  saveBuyerBankInfoData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveBuyerBankExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveCompanyBankInfoData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveCompanyBankExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetCompanyBankInfoListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetCompanyBankData', {
      headers: this.token.headerToken(),
    });
  }

  GetExportApplicantDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetExportApplicantDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetExportCompanyDropdownWithAddress(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetCompanyWithAddressDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetExportPerformaLocalBuyerDrop(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetBuyerDropdownForPerformaLocal',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetExportPerformaLocalCurrencyDrp(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetPerformaCurrencyList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetStyleAutoLocal(buyerId, filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetStyleAutocompleteLocal?BuyerId=' +
        buyerId +
        '&Filter=' +
        filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetHsCodeAutoLocalFilter(filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetHsCodeAutoCompleteLocal?Filter=' + filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPOAutoSelectForeign(buyerId, styleId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPONoSelectAutocompleteLocal?BuyerId=' +
        buyerId +
        '&StyleId=' +
        styleId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPOAutoLocal(buyerId, styleId, filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPONoAutocompleteLocal?BuyerId=' +
        buyerId +
        '&StyleId=' +
        styleId +
        '&Filter=' +
        filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPerformaLocalBankList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetPerformaBankListLocal',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPerformaLocalBankListByCompanyId(CompanyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetPerformaBankListLocalByCompanyId?CompanyId=' +
        CompanyId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPerformaLocalPaymentTermsList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetPerformaPaymentTermsListLocal',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPerformaBeneficiaryReviseList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/BeneficiaryNameReviseList',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetProformaInvoiceListReviseLocal(BeneficiaryId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/ProformaInviceReviseDropdownLocal?BeneficiaryId=' +
        BeneficiaryId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAllLocalDataByProformalInvoiceLocalId(
    ProformaInvoiceLocalId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetProformaInvoiceDataForReviseLocal?ProformaInvoiceLocalId=' +
        ProformaInvoiceLocalId,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPerformaLocalDeliveryTermsList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetPerformaDeliveryListLocal',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveDeliveryTermsData(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveDeliveryTermsExport',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDeliveryTermsListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetDeliveryTermsData', {
      headers: this.token.headerToken(),
    });
  }

  saveBillOfLadingData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveBillOfLadingExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetBillOfLadingListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetBillOfLadingData', {
      headers: this.token.headerToken(),
    });
  }

  GetExportProformLocalDataByBuyerStylePO(
    BuyerId: number,
    StyleId: number,
    PO: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/ProformaInvoiceLocalOrderDetailsGet?BuyerId=${BuyerId}&StyleId=${StyleId}&PO=${PO}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetPenaltyTypeListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetPenaltyTypeData', {
      headers: this.token.headerToken(),
    });
  }

  savePenaltyTypeData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SavePenaltyTypeExport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetExportPartyNameDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/ExportPartyNameDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetExportHiringTypeDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/ExportHiringTypeDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetExportCapacityDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/ExportCapacityDropdown',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetExportPartyWisePenaltyDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/PenaltyNameDropdownPartyWise',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDateOfShipmentBuyerDrop(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetBuyerDropdownForDateWiseShipment',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDateOfShipmentLCUnitDrop(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetCompanyListForDateOfShipment',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDateOfShipmentProdUnitByLCUnit(LCUnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetProductionUnitByLCUnit?LCUnitId=${LCUnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetJobAutoLocalNew(buyerId, filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetJobAutocompleteLocalByBuyerId?BuyerId=' +
        buyerId +
        '&Filter=' +
        filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetOrderAutoLocal(buyerId, jobId, filter): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetOrderAutocompleteLocalByBuyerIdandJobNo?BuyerId=' +
        buyerId +
        '&JobNo=' +
        jobId +
        '&Filter=' +
        filter,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveDateWiseShipmentData(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveDateWiseShipmentSetup',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDateWiseShipmentDataListCommercial(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetDateWiseShipmentData',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetOrderDropByBuyerIdandJobId(
    buyerId: number,
    jobId: number
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetOrderForDateShipmentByBuyerIdandJobId?BuyerId=${buyerId}&JobId=${jobId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDataBySelectAmendmentMulitselect(
    AmendmentNo: string,
    MasterLcFileNo: any,
    MasterLcNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetAmendmentInfoByAmendNoandFileNo?AmendmentNo=${encodeURI(
          AmendmentNo
        )}&MasterLcFileNo=${MasterLcFileNo}&MasterLcNo=${MasterLcNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetLienMasterLcValbyFileNoandLcNoandTypeName(
    fileNo: string,
    masterLcNo: string,
    typeName: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetLienLetterMasterLcValueByType?MasterLcFileNo=' +
        fileNo +
        '&masterLcNo=' +
        encodeURIComponent(masterLcNo) +
        '&TypeName=' +
        typeName,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMergeReplacMasterLcCompanyDrop(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/MergeReplaceCompanyListDrop',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMasterFileNoDropdownByUnitIdMergeReplace(UnitId): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/MergeReplaceMasterFileDropByUnit?UnitId=${UnitId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAcceptanceDataByB2B(
    b2bfileNo: string,
    b2blcNo: string,
    lcType: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        'Setup/GetB2BAccepMasterLcValueLcWise?B2BFileNo=' +
        b2bfileNo +
        '&&B2BLcNo=' +
        encodeURIComponent(b2blcNo) +
        '&&lcType=' +
        lcType,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetInfoMasterLcDataUsingMasterFileNo(
    masterLcFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/MergeReplaceGetMasterLcInfoByMasterFileNo?MasterLcFileNo=${masterLcFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetMergeDataByUsingMergeLcNo(
    MergeForLCNo: string,
    MergeToLcNo: string,
    UnitId: number,
    MasterLCFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetDataByMergeFileNo?MergeForLCNo=${MergeForLCNo}&MergeToLcNo=${MergeToLcNo}&UnitId=${UnitId}&MasterLCFileNo=${MasterLCFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveMergeMasterLCData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/MergeMasterLCInfo', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetMasterMergeInfoLetterByMasterFileNo(
    masterLcFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/MasterLcNoFromMergeByFileNoMergeLetter?MasterLcFileNo=${masterLcFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveMergeMasterLCLetter(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveMergeMasterLetter', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveReplaceMasterLCData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/ReplaceMasterLCInfo', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveReplaceMasterLCLetter(obj: any) {
    //console.log("obj", obj);
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveReplaceMasterLetter',
      obj,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetAcceptanceLetterLCFormatByLCNo(
    LCNo: string,
    LCType: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/Getb2bDataForAcceptanceByB2BLCNo?LCNo=${encodeURI(
          LCNo
        )}&LCType=${LCType}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  getAccetanceLetterType(
    bankNo: number,
    branchId: number,
    paymentType: string,
    lcType: string,
    lcSubType: string,
    lcTenor: string
  ) {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetAcceptB2BLCFileFormatData?BankNo=${bankNo}&BranchId=${branchId}&PaymentType=${paymentType}&LCType=${lcType}&LCSubType=${lcSubType}&LCTenor=${lcTenor}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDeleteLetterB2BCompanyDrop(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/DeleteLetterForCompanyListDrop',
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetDeleteB2BFileByCompanyId(companyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/DeleteLetterB2BFileNoByCompanyId?companyId=${companyId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCancelMasterLcFileByCompanyId(companyId: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/CancelLetterB2BFileNByCompanyId?companyId=${companyId}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCancelMasterLcNoByMasterLcFileNo(masterLcFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/CancelLetterMasterLcNoByMasterFileNo?masterLcFileNo=${masterLcFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCancelB2BLCFileNoByMasterLcFileNo(
    masterLcFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/CancelB2BLCDataByMasterFileNo?masterLcFileNo=${masterLcFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCancelB2BLCNoByB2BFileNo(b2bFileNo: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/CancelB2BLCNoByB2BFileNo?B2BFileNo=${b2bFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetTransferMasterLCNOC(
    companyId: number,
    masterLcFileNo: string
  ): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ +
        `Setup/GetTransferMasterByCompanyIdandFileNo?companyId=${companyId}&MasterLcFileNo=${masterLcFileNo}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveItemCategoryData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveItemCategoryImport', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetItemCategoryListDataCommercial(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetItemCategoryData', {
      headers: this.token.headerToken(),
    });
  }

  GetItemCategoryDataByLcType(LCType: string): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + `Setup/GetLCItemCategoryData?LcType=${LCType}`,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  saveCancelLetter(obj: any) {
    //console.log("obj", obj);
    return this.http.post(this.baseUrl_ + 'Setup/SaveCancelLetter', obj, {
      headers: this.token.headerToken(),
    });
  }
}
