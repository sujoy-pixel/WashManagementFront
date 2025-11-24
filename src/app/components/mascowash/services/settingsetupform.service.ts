import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenService } from "src/app/shared/services/token.service";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";


@Injectable({
  providedIn: "root",
})
export class SettingSetupFormService {
  baseUrl = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, "");

  healthConditionData: any[] = [];

  constructor(private http: HttpClient, private token: TokenService) { }


  getDivisionNameforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDivisionData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  getDivision(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDivisionData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  GetDivisionNameById(divisionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDivisionDataById?divisionId=" + divisionId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteDivisionNameById(divisionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteDivisionDataById?Id=" + divisionId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  createDivision(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateDivision", obj, {
      headers: this.token.headerToken()
    });
  }


  //Gender


  getGenderforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllGenderData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createGender(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateGender", obj, {

      headers: this.token.headerToken()
    });
  }


  GetGenderNameById(genderId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllGenderDataById?genderId=" + genderId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getGender(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllGenderData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteGenderById(genderId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteGenderDataById?Id=" + genderId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  /////////////Religion




  getReligionforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllReligionData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createReligion(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }


    return this.http.post(this.baseUrl_ + "school/Setting/CreateReligion", obj, {

      headers: this.token.headerToken()
    });
  }


  GetReligionNameById(religionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllReligionDataById?religionId=" + religionId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getReligion(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllReligionData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteReligionById(religionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteReligionDataById?Id=" + religionId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  //Country Name

  getCountryforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllCountryData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createCountry(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    //console.log("obj", obj);
    // let objNew = {

    //   divisionName: obj.DivisionNameEnglish,
    //   activeStatus:obj.ActiveStatus
    // }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateCountry", obj, {

      headers: this.token.headerToken()
    });
  }


  GetCountryNameById(countryId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllCountryDataById?countryId=" + countryId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteCountryNameById(countryId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteCountryDataById?Id=" + countryId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getCountry(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllCountryData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  //Special Health Condition

  getHealthConditionforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSpHealthConditionData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createHealthCondition(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    return this.http.post(this.baseUrl_ + "school/Setting/CreateSpHealthCondition", obj, {

      headers: this.token.headerToken()
    });
  }


  GetHealthConditionNameById(sphConditionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSpHealthConditionDataById?sphConditionId=" + sphConditionId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getHealthCondition(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSpHealthConditionData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteHealthConditionNameById(sphConditionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteSpHealthConditionDataById?Id=" + sphConditionId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  //Disease


  getDiseaseforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiseaseData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createDisease(obj: any) {
    //console.log("obj", obj);

    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateDisease", obj, {

      headers: this.token.headerToken()
    });
  }


  GetDiseaseNameById(diseaseNameId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiseaseDataById?diseaseNameId=" + diseaseNameId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getDisease(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiseaseData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteDiseaseNameById(diseaseNameId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteDiseaseDataById?Id=" + diseaseNameId,
      {
        headers: this.token.headerToken()
      }
    );
  }



  //Blood Group


  getBloodGroupforDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllBloodGroupData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createBloodGroup(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    return this.http.post(this.baseUrl_ + "school/Setting/CreateBloodGroup", obj, {
    headers: this.token.headerToken()
    });
  }


  GetBloodGroupNameById(bloodGroupId: number): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetBloodGroupDataById?bloodGroupId=" + bloodGroupId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getBloodGroup(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllBloodGroupData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteBloodGroupById(bloodGroupId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteBloodGroupDataById?Id=" + bloodGroupId,
      {
        headers: this.token.headerToken()
      }
    );
  }


   //Occuaption


   getOccupationforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllOccupationData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createOccupation(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateOccupation", obj, {

      headers: this.token.headerToken()
    });
  }


  GetOccupationNameById(occupationId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetOccupationDataById?occupationId=" + occupationId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getOccupation(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllOccupationData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  //DeleteOccupationById
  DeleteOccupationById(occupationId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteOccupationDataById?Id=" + occupationId,
      {
        headers: this.token.headerToken()
      }
    );
  }

   //Education


   getEducationforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllEducationData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createEducation(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateEducation", obj, {

      headers: this.token.headerToken()
    });
  }


  GetEducationNameById(qualificationId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetEducationDataById?qualificationId=" + qualificationId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getEducation(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllEducationData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteEducationById(qualificationId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteEducationDataById?Id=" + qualificationId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  //////////////Shift



  getShiftforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllShiftTypeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createShift(obj: any) {
    //console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    
    return this.http.post(this.baseUrl_ + "school/Setting/CreateShiftType", obj, {

      headers: this.token.headerToken()
    });
  }


  GetShiftNameById(shiftTypeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetShiftTypeDataById?shiftTypeId=" + shiftTypeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getShift(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllShiftTypeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  
  DeleteShiftNameById(shiftTypeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteShiftTypeDataById?Id=" + shiftTypeId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  //////////Student Relationship



   getRelationshipforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllStudentRelationshipData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createRelationship(obj: any) {
    //console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateStudentRelationship", obj, {

      headers: this.token.headerToken()
    });
  }


  GetRelationshipNameById(sRelationshipId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetStudentRelationshipDataById?sRelationshipId=" + sRelationshipId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getRelationship(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllStudentRelationshipData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteRelationshipNameById(sRelationshipId: number): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteStudentRelationshipDataById?Id=" + sRelationshipId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  ////////////////Class Entry
  
  getClassEntryforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassEntryData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createClassEntry(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateClassEntry", obj, {

      headers: this.token.headerToken()
    });
  }


  GetClassEntryNameById(classId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetClassEntryDataById?classId=" + classId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getClassEntry(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassEntryData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  
  DeleteClassEntryById(classId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteClassEntryDataById?Id=" + classId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  /////////District 


  getDistrictforDropdown(): Observable<any> {
//debugger
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDistrictData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createDistrict(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateDistrict", obj, {

      headers: this.token.headerToken()
    });
  }


  GetDistrictNameById(districtId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDistrictDataById?districtId=" + districtId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getDistrict(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDistrictData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteDistrictNameById(districtId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteDistrictDataById?Id=" + districtId,
      {
        headers: this.token.headerToken()
      }
    );
  }


   ////////////////Thana /////////////////////////


   getThanaforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllThanaData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createThana(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateThana", obj, {

      headers: this.token.headerToken()
    });
  }


  GetThanaNameById(thanaId: number): Observable<any> {
    
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllThanaDataById?thanaId=" + thanaId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getThana(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllThanaData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteThanaNameById(thanaId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteThanaDataById?Id=" + thanaId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  //////////////Academic Year


  getAcademicforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllAcademicYearData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createAcademic(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateAcademicYear", obj, {

      headers: this.token.headerToken()
    });
  }


  GetAcademicNameById(acaYearId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAcademicYearDataById?acaYearId=" + acaYearId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getAcademic(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllAcademicYearData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  

  
  DeleteAcademicYearById(acaYearId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteAcademicDataById?Id=" + acaYearId,
      {
        headers: this.token.headerToken()
      }
    );
  }



  /////////////////////Class Section Entry /////////////////////////////

  getClassSectionforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassSectionEntryData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createClassSection(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateClassSectionEntry", obj, {

      headers: this.token.headerToken()
    });
  }


  GetClassSectionNameById(sectionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetClassSectionEntryDataById?sectionId=" + sectionId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getClassSection(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassSectionEntryData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteClassSectionEntryById(sectionId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteClassSectionEntryDataById?Id=" + sectionId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  getSectionNameByClassId(Id: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetSectionDataByclassId?Id=" + Id,
      {
        headers: this.token.headerToken()
      }
    );
  }



  getBranchNameBySchoolId(Id: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetBranchDataByschoolId?Id=" + Id,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getStudentIdByGradeIdDropdown(gradeId:number): Observable<any> {

    //return this.http.get<any[]>(this.baseUrl_ + "VMS/GetAllSchoolDataForDropdown",
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetStudentIdByGrade?gradeId=" + gradeId,
      {
        headers: this.token.headerToken()
      }
    );
  }



  GetStudentListById(SchoolId: number, BranchId: number, ClassId:number, SectionId:number): Observable<any> {
   // debugger
    return this.http.get<any[]>(this.baseUrl_ + `school/Setting/GetStudentList?SchoolId=${SchoolId !== null ? SchoolId : 0 }&BranchId=${BranchId !== null ? BranchId : 0}&ClassId=${ClassId !== null ? ClassId : 0}&SectionId=${SectionId !== null ? SectionId : 0}` ,
      {
        headers: this.token.headerToken()
      }
    );
  }
  GetStudentListByOnlyId(id: number): Observable<any> {
   
    return this.http.get<any[]>(this.baseUrl_ + `school/Setting/GetStudentListById?Id=${id}` ,
      {
        headers: this.token.headerToken()
      }
    );
  }
  GetHealthConditionData(id: number): Observable<any> {
    
    return this.http.get<any[]>(this.baseUrl_ + `AdmissionForm/GetHealthConditionData?Id=${id}` ,
      {
        headers: this.token.headerToken()
      }
    );
  }

  GetMedicalConditionDataById(id: number): Observable<any> {
    
    
    return this.http.get<any[]>(this.baseUrl_ + `AdmissionForm/GetMedicalConditionDataById?Id=${id}` ,
      {
        headers: this.token.headerToken()
      }
    );
  }
  GetPreviousInstituteDataById(id: number): Observable<any> {
    
    return this.http.get<any[]>(this.baseUrl_ + `AdmissionForm/GetPreviousInstituteDataById?Id=${id}` ,
    //return this.http.post(this.baseUrl_ + "AdmissionForm/CreateAdmissionForm", obj, {
      {
        headers: this.token.headerToken()
      }
    );
  }
  ///////////////////////Financial FORM Entry
   //////////////Academic Year


   getFinancialforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllFinancialYearData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createFinancial(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateFinancialYearEntry", obj, {

      headers: this.token.headerToken()
    });
  }


  GetFinancialNameById(FinYearId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetFinancialYearDataById?FinYearId=" + FinYearId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getFinancial(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllFinancialYearData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  

  
  DeleteFinancialYearById(FinYearId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteFinancialDataById?Id=" + FinYearId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  ///Holiday Type Entry
 
  
  getHolidayTypeforDropdown(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllHolidayTypeEntryData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createHolidayType(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateHolidayEntry", obj, {

      headers: this.token.headerToken()
    });
  }


  GetHolidayTypeNameById(holidayTypeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetHolidayTypeDataById?holidayTypeId=" + holidayTypeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getHolidayType(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllHolidayTypeEntryData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  
  DeleteHolidayTypeById(holidayTypeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteHolidayTypeDataById?Id=" + holidayTypeId,
      {
        headers: this.token.headerToken()
      }
    );
  }



   //Shift Season Entry


   getShiftSeasonforDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllShiftSeasonData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createShiftSeason(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    return this.http.post(this.baseUrl_ + "school/Setting/CreateShiftSeason", obj, {
    headers: this.token.headerToken()
    });
  }


  GetShiftSeasonNameById(shiftSeasonId: number): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetShiftSeasonDataById?shiftSeasonId=" + shiftSeasonId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getShiftSeason(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllShiftSeasonData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteShiftSeasonById(shiftSeasonId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteShiftSeasonDataById?Id=" + shiftSeasonId,
      {
        headers: this.token.headerToken()
      }
    );
  }



  //Holiday Date Entry



   getHolidayDateforDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllHolidayDateData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createHolidayDate(obj: any) {
    //console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    return this.http.post(this.baseUrl_ + "school/Setting/CreateHolidayDateEntry", obj, {
    headers: this.token.headerToken()
    });
  }


  GetHolidayDateNameById(holidayDateId: number): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetHolidayDateDataById?holidayDateId=" + holidayDateId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getHolidayDate(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllHolidayDateData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteHolidayDateById(holidayDateId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteHolidayDateDataById?Id=" + holidayDateId,
      {
        headers: this.token.headerToken()
      }
    );
  }


  //Holiday Date Entry


  getShiftTimeforDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllShiftTimeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createShiftTime(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    return this.http.post(this.baseUrl_ + "school/Setting/CreateShiftTimeEntryName", obj, {
    headers: this.token.headerToken()
    });
  }


  GetShiftTimeNameById(shiftTimeId: number): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetShiftTimeDataById?shiftTimeId=" + shiftTimeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getShiftTime(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllShiftTimeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeleteShiftTimeById(shiftTimeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteShiftTimeDataById?Id=" + shiftTimeId,
      {
        headers: this.token.headerToken()
      }
    );
  }



  /////////////////////School Create //////////////////////
  createSchoolName(obj: any) {
    
    if(obj.ActiveStatus === false){
      obj.ActiveStatus = 0;
    }else if(obj.ActiveStatus === true) {
      obj.ActiveStatus =1;
    }
  
    return this.http.post(this.baseUrl_ + "VMS/CreateSchool", obj, {

      headers: this.token.headerToken()
    });
  }


  GetSchoolNameById(Id: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "VMS/GetAllSchoolDataById?SchoolId=" + Id,
      {
        headers: this.token.headerToken()
      }
    );
  }



  getSchoolName(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "VMS/GetAllSchoolData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteSchoolNameById(Id: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "VMS/DeleteSchoolNameDataById?Id=" + Id,
      {
        headers: this.token.headerToken()
      }
    );
  }

  /////////////////////School Create //////////////////////

  ////////////////////Grade Start////////////////////////////////
  createGrade(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateGrade", obj, {

      headers: this.token.headerToken()
    });
  }


  GetGradeNameById(gradeId: number): Observable<any> {
    
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllGradeEntryDataById?gradeId=" + gradeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getGrade(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllGradeData",
      {
        headers: this.token.headerToken()
      }
    );
  }


  DeleteGradeNameById(gradeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteGradeEntryDataById?Id=" + gradeId,
      {
        headers: this.token.headerToken()
      }
    );
  }
  ////////////////////Grade End////////////////////////////////

  ///////////////////////////////Payment Type //////////////////////////
  getPaymentTypeforDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllPaymentTypeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createPaymentType(obj: any) {
    //console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    return this.http.post(this.baseUrl_ + "school/Setting/CreatePaymentType", obj, {
    headers: this.token.headerToken()
    });
  }


  GetPaymentTypeNameById(paymentTypeId: number): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllPaymentTypeDataById?paymentTypeId=" + paymentTypeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getPaymentType(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllPaymentTypeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeletePaymentTypeById(paymentTypeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeletePaymentTypeDataById?Id=" + paymentTypeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  ///////////////////////////////Payment Type //////////////////////////


   ///////////////////////////////Payment Mode //////////////////////////
   getPaymentModeforDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllPaymentModeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  createPaymentMode(obj: any) {
   // console.log("obj", obj);
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }
    return this.http.post(this.baseUrl_ + "school/Setting/CreatePaymentMode", obj, {
    headers: this.token.headerToken()
    });
  }


  GetPaymentModeNameById(paymentModeId: number): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllPaymentModeDataById?paymentModeId=" + paymentModeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  getPaymentMode(): Observable<any> {

    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllPaymentModeData",
      {
        headers: this.token.headerToken()
      }
    );
  }

  DeletePaymentModeById(paymentModeId: number): Observable<any> {
    return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeletePaymentModeDataById?Id=" + paymentModeId,
      {
        headers: this.token.headerToken()
      }
    );
  }

  ///////////////////////////////Payment Mode //////////////////////////



  /////////////////Weekly Holiday//////////////////////

  createWeeklyHoliday(obj: any) {
    if(obj.activeStatus === false){
      obj.activeStatus =0;
    }else if(obj.activeStatus === true) {
      obj.activeStatus =1;
    }

    return this.http.post(this.baseUrl_ + "school/Setting/CreateWeeklyHoliday", obj, {

      headers: this.token.headerToken()
    });
  }

//////////////////////////////////////////////////

//Discount Entry


getDiscountforDropdown(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiscountData",
    {
      headers: this.token.headerToken()
    }
  );
}

createDiscount(obj: any) {
  //console.log("obj", obj);

  if(obj.activeStatus === false){
    obj.activeStatus =0;
  }else if(obj.activeStatus === true) {
    obj.activeStatus =1;
  }

  return this.http.post(this.baseUrl_ + "school/Setting/CreateDiscount", obj, {

    headers: this.token.headerToken()
  });
}


GetDiscountNameById(discountId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiscountDataById?discountId=" + discountId,
    {
      headers: this.token.headerToken()
    }
  );
}

getDiscount(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiscountData",
    {
      headers: this.token.headerToken()
    }
  );
}

DeleteDiscountNameById(discountId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteDiscountDataById?Id=" + discountId,
    {
      headers: this.token.headerToken()
    }
  );
}







 /////////Discount Amount 


 getDiscountAmountforDropdown(): Observable<any> {
  //debugger
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiscountAmountData",
        {
          headers: this.token.headerToken()
        }
      );
    }
  
    createDiscountAmount(obj: any) {
      if(obj.activeStatus === false){
        obj.activeStatus =0;
      }else if(obj.activeStatus === true) {
        obj.activeStatus =1;
      }
  
      return this.http.post(this.baseUrl_ + "school/Setting/CreateDiscountAmountEntry", obj, {
  
        headers: this.token.headerToken()
      });
    }
  
  
    GetDiscountAmountNameById(discountAmountId: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetDiscountAmountDataById?discountAmountId=" + discountAmountId,
        {
          headers: this.token.headerToken()
        }
      );
    }
  
    getDiscountAmount(): Observable<any> {
  
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiscountAmountData",
        {
          headers: this.token.headerToken()
        }
      );
    }
  
    DeleteDiscountAmountNameById(discountAmountId: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteDiscountAmountDataById?Id=" + discountAmountId,
        {
          headers: this.token.headerToken()
        }
      );
    }



    //////////////////Student Wise Discount Set ///////////////////////////////////
    getAllDiscountDataByStudentId(studentId: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiscountDataByStudentId?studentId=" + studentId,
        {
          headers: this.token.headerToken()
        }
      );
    }


    getAllStudentIdByBranchId(id: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllStudentIdByBranchId?Id=" + id,
        {
          headers: this.token.headerToken()
        }
      );
    }

////////////////Student Wise Discount Set ///////////////
saveStudentDiscountSet(obj: any) {

  return this.http.post(this.baseUrl_ + "school/Setting/SaveStudentDiscountSet", obj, {

    headers: this.token.headerToken()
  });
}


saveEscortData(obj: FormData) {      
  return this.http.post(this.baseUrl_ + "Escort/SaveEscort", obj, {  headers: this.token.headerToken()
  });

}

///////////////////////////////////////////////////
    
    ///////////////////////Student Fees Generation//////////////////////

    getAllDataBystudentId(studentId: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllFeesDataByStudentId?studentId=" + studentId,
        {
          headers: this.token.headerToken()
        }
      );
    }

    getAllDataByMobile(mobileNo: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllFeesDataByMobile?mobile=" + mobileNo,
        {
          headers: this.token.headerToken()
        }
      );
    }


    getAllDataByStudentName(studentName: any): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllFeesDataByStudentName?studentName=" + studentName,
        {
          headers: this.token.headerToken()
        }
      );
    }


    getAllExtraFeesByStudentId(studentId: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllExtraFeesDataByStudentId?studentId=" + studentId,
        {
          headers: this.token.headerToken()
        }
      );
    }


    getAmountDataBydiscountId(discountId: number): Observable<any> {
      return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllDiscountAmountByDiscountId?discountId=" + discountId,
        {
          headers: this.token.headerToken()
        }
      );
    }
  


    saveStudentFees(obj: any) {
      return this.http.post(this.baseUrl_ + "school/Setting/SaveStudentFees", obj, {
        headers: this.token.headerToken()
      });
    }
    

//Class Time Setup

getClassTimeforDropdown(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassTimeData",
    {
      headers: this.token.headerToken()
    }
  );
}

createClassTimeSetup(obj: any) {
  if(obj.activeStatus === false){
    obj.activeStatus =0;
  }else if(obj.activeStatus === true) {
    obj.activeStatus =1;
  }

  return this.http.post(this.baseUrl_ + "school/Setting/CreateClassTime", obj, {

    headers: this.token.headerToken()
  });
}


GetClassTimeById(classTimeId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassTimeDataById?classTimeId=" + classTimeId,
    {
      headers: this.token.headerToken()
    }
  );
}


DeleteClassTimeById(classTimeId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteClassTimeDataById?Id=" + classTimeId,
    {
      headers: this.token.headerToken()
    }
  );
}

getClassTime(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassTimeData",
    {
      headers: this.token.headerToken()
    }
  );
}


///////////////////////Subject Create ////////////////////
getSubjectforDropdown(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSubjectData",
    {
      headers: this.token.headerToken()
    }
  );
}

createSubject(obj: any) {
  //console.log("obj", obj);

  if(obj.activeStatus === false){
    obj.activeStatus =0;
  }else if(obj.activeStatus === true) {
    obj.activeStatus =1;
  }

  return this.http.post(this.baseUrl_ + "school/Setting/CreateSubject", obj, {

    headers: this.token.headerToken()
  });
}


GetSubjectById(subjectId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetSubjectDataById?subjectId=" + subjectId,
    {
      headers: this.token.headerToken()
    }
  );
}

getSubject(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSubjectData",
    {
      headers: this.token.headerToken()
    }
  );
}

DeleteSubjectById(subjectId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteSubjectDataById?Id=" + subjectId,
    {
      headers: this.token.headerToken()
    }
  );
}
///////////////////////Subject Create ////////////////////


///////////////////////Subject Wise Class Setup ////////////////////
getSubjectWiseClassforDropdown(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSubjectWiseClass",
    {
      headers: this.token.headerToken()
    }
  );
}

getTeacherNameById(empId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetTeacherNameById?EMP_ID=" + empId,
    {
      headers: this.token.headerToken()
    }
  );
}

createSubjectWiseClass(obj: any) {
  //console.log("obj", obj);

  if(obj.activeStatus === false){
    obj.activeStatus =0;
  }else if(obj.activeStatus === true) {
    obj.activeStatus =1;
  }

  return this.http.post(this.baseUrl_ + "school/Setting/CreateSubjectWiseClass", obj, {

    headers: this.token.headerToken()
  });
}


GetSubjectWiseClassById(subjectWiseClassId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetSubjectClassDataById?subjectWiseClassId=" + subjectWiseClassId,
    {
      headers: this.token.headerToken()
    }
  );
}

getSubjectWiseClass(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSubjectWiseClass",
    {
      headers: this.token.headerToken()
    }
  );
}

DeleteSubjectWiseClassById(subjectWiseClassId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteSubjectWiseClassDataById?Id=" + subjectWiseClassId,
    {
      headers: this.token.headerToken()
    }
  );
}
///////////////////////Subject Wise Class Setup Create ////////////////////

////////////////////////Subject Wise Teacher Setupu Create ///////////////
getAllTeacherDropdown(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllTeaherData",
    {
      headers: this.token.headerToken()
    }
  );
}



getSubjectWiseTeacherforDropdown(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSubjectWiseTeacher",
    {
      headers: this.token.headerToken()
    }
  );
}

createSubjectWiseTeacherSetup(obj: any) {
  if(obj.activeStatus === false){
    obj.activeStatus =0;
  }else if(obj.activeStatus === true) {
    obj.activeStatus =1;
  }

  return this.http.post(this.baseUrl_ + "school/Setting/CreateSubjectWiseTeacherSetup", obj, {

    headers: this.token.headerToken()
  });
}


GetSubjectWiseTeacherById(subjectWiseTeacherId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetSubjectWiseTeacherDataById?subjectWiseTeacherId=" + subjectWiseTeacherId,
    {
      headers: this.token.headerToken()
    }
  );
}


DeleteSubjectWiseTeacherById(subjectWiseTeacherId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteSubjectWiseTeacherDataById?Id=" + subjectWiseTeacherId,
    {
      headers: this.token.headerToken()
    }
  );
}

getSubjectWiseTeacher(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllSubjectWiseTeacher",
    {
      headers: this.token.headerToken()
    }
  );
}

////////////////////////Subject Wise Teacher Setupu Create ///////////////

///////////////////////Class Routine ////////////////////////////////////
getClassRoutineforDropdown(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassRoutine",
    {
      headers: this.token.headerToken()
    }
  );
}

createClassRoutine(obj: any) {
  if(obj.activeStatus === false){
    obj.activeStatus =0;
  }else if(obj.activeStatus === true) {
    obj.activeStatus =1;
  }

  return this.http.post(this.baseUrl_ + "school/Setting/CreateClassRoutineSetup", obj, {

    headers: this.token.headerToken()
  });
}


GetClassRoutineById(classRoutineId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetClassRoutineDataById?classRoutineId=" + classRoutineId,
    {
      headers: this.token.headerToken()
    }
  );
}


DeleteClassRoutineById(classRoutineId: number): Observable<any> {
  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/DeleteClassRoutineById?Id=" + classRoutineId,
    {
      headers: this.token.headerToken()
    }
  );
}

getClassRoutine(): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ + "school/Setting/GetAllClassRoutine",
    {
      headers: this.token.headerToken()
    }
  );
}
///////////////////////Class Routine ////////////////////////////////////

///////////////////////////////Attendance ////////////////////
getStudentAttendanceBySearch(gradeId: number, sectionId:number,studentId:number,fromDate:string, toDate:string): Observable<any> {
  
  return this.http.get<any[]>(this.baseUrl_ + `school/Setting/GetAttendanceDataBySearch?gradeId=${gradeId}&sectionId=${sectionId === null ? 0 : sectionId}&studentId=${studentId === null ? 0 : studentId}&fromDate=${fromDate}&toDate=${toDate}`,
    {
      headers: this.token.headerToken()
    }
  );
}


////////////////////////////////////////Get Admission Data by Student ID ///////////////////////////////
getAdmissionDataByStudentId(studentId:number): Observable<any> {

  return this.http.get<any[]>(this.baseUrl_ +  "school/Setting/GetAdmissionDataByStudentId?studentId=" + studentId,
    {
      headers: this.token.headerToken()
    }
  );
}


}