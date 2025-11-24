import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TokenService } from "src/app/shared/services/token.service";
import { environment } from "src/environments/environment";
import { Category } from "../../admin/Model/category";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  formData: Category|any;
  categoryList: Category[]=[];
  processCategoryList: Category[]=[];
  headers = {};
  baseUrl = environment.apiUrl + "merchandising/";
  baseUrl_ = this.baseUrl.replace(/[?&]$/, "");

  auth_token = null;
  constructor(private http: HttpClient, private token: TokenService) {}

 
  getCategoryData(categoryType: string): Observable<any> {
    if(categoryType!= null)
    {
      return this.http.get<Category[]>(this.baseUrl_ + "Category/GetCategoryByType?categoryType="+ categoryType, {
        headers: this.token.headerToken(),
      });
    }
    else{
      return this.http.get<Category[]>(this.baseUrl_ + "Category/GetCategoryList", {
        headers: this.token.headerToken(),
      });
    }
  }

  getFabricCategoryData(): Observable<any> {
      return this.http.get<Category[]>(this.baseUrl_ + "Category/GetFabricCategoryList", {
        headers: this.token.headerToken(),
      });
  }

 

}
