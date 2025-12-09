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
    return this.http.post(this.baseUrl_ + 'Setup/SaveInspectionArea', obj, {
      headers: this.token.headerToken(),
    });
  }

  getInspectionAreaLists() {
    return this.http.get(this.baseUrl_ + 'Setup/GetInspectionAreaData', {
      headers: this.token.headerToken(),
    });
  }

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

  getInspectionAreaList() {
    return this.http.get('Setup/GetInspectionArea');
  }

  // saveInspectionAreaEntry(payload: any) {
  //   return this.http.post('Setup/SaveInspectionArea', payload);
  // }

  deleteInspectionArea(payload: any) {
    return this.http.post('Setup/DeleteInspectionArea', payload);
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
}
