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

  GetBuyerName(Id: number): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetBuyerList?Id=' + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  TypeofInspectionService(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveTypeofInspection', obj, {
      headers: this.token.headerToken(),
    });
  }

  getAllTypeofInspection() {
    return this.http.get(this.baseUrl_ + 'Setup/GetTypeofInspectionData', {
      headers: this.token.headerToken(),
    });
  }

  // saveInspectionAreaEntry(obj: any) {
  //   //return this.http.post('Setup/SaveInspectionArea', payload);

  //   return this.http.post(
  //     this.baseUrl_ + 'Setup/SaveInspectionArea', obj,
  //     { headers: this.token.headerToken() }
  //   );
  // }



 saveInspectionAreaEntry(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveInspectionArea',
      obj,
      { headers: this.token.headerToken() }
    );
  }

  getInspectionAreaLists() {
    return this.http.get(this.baseUrl_ + 'Setup/GetInspectionAreaData', {
      headers: this.token.headerToken(),
    });
  }



 deleteInspectionArea(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveInspectionArea', obj, {
      headers: this.token.headerToken(),
    });

  // deleteInspectionArea(payload: any) {
  //   return this.http.post('Setup/DeleteInspectionArea', payload);
  // }

  // TypeofInspectionService(obj: any) {
  //   return this.http.post(this.baseUrl_ + 'Setup/SaveTypeofInspection', obj, {
  //     headers: this.token.headerToken(),
  //   });
  // }

  // getAllTypeofInspection() {
  //   return this.http.get(this.baseUrl_ + 'Setup/GetTypeofInspectionData', {
  //     headers: this.token.headerToken(),
  //   });
  // }

  }


  
  saveProcessNameEntryData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveProcessNameEntry', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetUnitName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetUnitName', {
      headers: this.token.headerToken(),
    });
  }
  GetProcessNameEntryList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetProcessNameEntryData',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  deleteProcessNameEntry(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveProcessNameEntry', obj, {
      headers: this.token.headerToken(),
    });
  }

  GetOperationNameEntryList(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetOperationNameEntryData',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  saveOperationNameEntryData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveOperationNameEntry', obj, {
      headers: this.token.headerToken(),
    });
  }

  deleteOperationNameEntry(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveOperationNameEntry', obj, {
      headers: this.token.headerToken(),
    });
  }


// SAVE FAULT NAME
saveFaultName(obj: any) {
  return this.http.post(
    this.baseUrl_ + 'Setup/SaveFaultName',
    obj,
    { headers: this.token.headerToken() }
  );
}

// GET FAULT NAME LIST
getFaultNameList() {
  return this.http.get(
    this.baseUrl_ + 'Setup/GetFaultNameData',
    { headers: this.token.headerToken() }
  );
}

// DELETE FAULT NAME
deleteFaultName(obj: any) {
  return this.http.post(
    this.baseUrl_ + 'Setup/SaveFaultName',
    obj,
    { headers: this.token.headerToken() }
  );
}

// GET FAULT HEAD DROPDOWN
getFaultHeadList() {
  return this.http.get(
    this.baseUrl_ + 'Common/GetFaultHead',
    { headers: this.token.headerToken() }
  );
}



  saveInspectionHeadEntryData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveInspectionHead', obj, {
      headers: this.token.headerToken(),
    });
  }
  GetInspectionHeadList(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetInspectionHeadData', {
      headers: this.token.headerToken(),
    });
  }

  deleteInspectionHeadEntryData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveInspectionHead', obj, {
      headers: this.token.headerToken(),
    });
  }

  saveFaultHeadEntryData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveFaultHead', obj, {
      headers: this.token.headerToken(),
    });
  }
  GetFaultHeadList(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetFaultHeadData', {
      headers: this.token.headerToken(),
    });
  }

  deleteFaultHeadEntryData(obj: any) {
    return this.http.post(this.baseUrl_ + 'Setup/SaveFaultHead', obj, {
      headers: this.token.headerToken(),
    });
  }

//   // check single machine exists
// checkMachineExists(obj: { unitId: number; operationId: number; machineName: string }) {
//   return this.http.post(this.baseUrl_ + 'Setup/CheckMachineExists', obj, { headers: this.token.headerToken() });
// }

// // save master + details
// saveMachineMasterDetail(obj: any) {
//   return this.http.post(this.baseUrl_ + 'Setup/SaveMachineName', obj, { headers: this.token.headerToken() });
// }

// // load master list (optional)
// getMachineMasterList() {
//   return this.http.get(this.baseUrl_ + 'Setup/GetMachineMasterList', { headers: this.token.headerToken() });
// }
// load DDL For Operation
GetOperationNameDDLs() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetOperationNameDDL',
    { headers: this.token.headerToken() }
  );
}

 // ===== check single machine exists =====
  checkMachineExists(obj: {
    unitId: number;
    operationId: number;
    machineName: string;
  }) {
    return this.http.post(
      this.baseUrl_ + 'Setup/CheckMachineExists',
      obj,
      { headers: this.token.headerToken() }
    );
  }

  // ===== save master + details =====
  saveMachineMasterDetail(obj: any) {
    return this.http.post(
      this.baseUrl_ + 'Setup/SaveMachineName',
      obj,
      { headers: this.token.headerToken() }
    );
  }

  // ===== final grid =====
  // getMachineMasterList() {
  //   return this.http.get(
  //     this.baseUrl_ + 'Setup/GetMachineMasterList',
  //     { headers: this.token.headerToken() }
  //   );
  // }
getMachineMasterList(): Observable<any[]> {
  return this.http.get<any[]>(this.baseUrl_ + 'Setup/GetMachineMasterList', { 
    headers: this.token.headerToken() 
  });
}

GetTrackingNoAuto() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetTrackingNo',
    { headers: this.token.headerToken() }
  );
}

GetBuyerNameDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetBuyerDDL',
    { headers: this.token.headerToken() }
  );
}

GetJobNoDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetJobDDL',
    { headers: this.token.headerToken() }
  );
}

GetStyleNoDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetStyleDDL',
    { headers: this.token.headerToken() }
  );
}
GetOrderNoDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetOrderDDL',
    { headers: this.token.headerToken() }
  );
}
GetFabricationDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetFabricationDDL',
    { headers: this.token.headerToken() }
  );
}


GetGSMDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetGSMDDL',
    { headers: this.token.headerToken() }
  );
}
GetDressPartDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetDressPart',
    { headers: this.token.headerToken() }
  );
}

GetUOMDDL() {
  return this.http.get<any[]>(
    this.baseUrl_ + 'Common/GetUOM',
    { headers: this.token.headerToken() }
  );
}
getReceiveByTrackingNo(trackingNo: string): Observable<any[]> {
    return this.http.get<any[]>(
     this.baseUrl_ +  `Setup/GetReceiveByTrackingNo?trackingNo=${trackingNo}`,
      { headers: this.token.headerToken() }
    );
  }
GetInspectionTypeDdl(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetTypeOfInspectionDDL',
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetInspectionHeadDdl(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetInspectionHeadDDL', {
      headers: this.token.headerToken(),
    });
  }
  GetFaultHeadDdl(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + 'Common/GetFaultHeadDDL', {
      headers: this.token.headerToken(),
    });
  }
saveReceiveOperation(data: any) {
  return this.http.post(
    this.baseUrl_ + 'Setup/SaveTrackingNoReceive',
    data,
    { headers: this.token.headerToken() }
  );
}

}
