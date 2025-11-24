import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TokenService } from "src/app/shared/services/token.service";
import { environment } from "src/environments/environment";
import { AppUser } from "../../admin/Model/app-user";
import { Role } from "../../admin/Model/role.model";
import { UserDataPermission } from "../../admin/Model/user-data-permission";

@Injectable({
  providedIn: "root",
})
export class RoleService {
  baseUrl = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, "");
  roleList: Role[]=[];
  obj: any;

  constructor(private http: HttpClient, private token: TokenService) {}

  //SAVE OR UPDATE SUPPLIER
  SaveRole(role: Role): Observable<any> {
    return this.http.post<any>(this.baseUrl_ + "RoleManage/CreateRole", role, {
      headers: this.token.headerToken(),
    });
  }

  //Role LIST
  GetRoleList(): Observable<any> {
    return this.http.get<Role[]>(this.baseUrl_ + "RoleManage/GetRoleList", {
      headers: this.token.headerToken(),
    });
  }

  //User Data permission list
  GetUserDataPermissionList() {
    return this.http.get<UserDataPermission[]>(
      this.baseUrl_ + "RoleManage/GetAppUsersDataPermissionList",
      {
        headers: this.token.headerToken(),
      }
    );
  }
  //User Data permission list
  GetUserDataPermissionListById(Id: number) {
    return this.http.get<UserDataPermission[]>(
      this.baseUrl_ + "RoleManage/GetAppUsersDataPermissionListById?Id=" + Id,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  //Get All user list
  GetAppUserList() {
    return this.http.get<AppUser[]>(this.baseUrl_ + "RoleManage/GetAppUsers", {
      headers: this.token.headerToken(),
    });
  }

  CreateUserRole(obj: any, list: UserDataPermission[]) {
    var body = {
      ...obj,
      userRoleList: list,
    };

    return this.http.post(this.baseUrl_ + "RoleManage/UserRoleCreate", body, {
      headers: this.token.headerToken(),
    });
  }

  GetBuyersUsersByUserId(id: number) {
    return this.http.get<any[]>(
      this.baseUrl_ + "RoleManage/GetBuyersUsersByUserId?UserId=" + id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetBranchUsersByUserId(id: number) {
    return this.http.get<any[]>(
      this.baseUrl_ +
        "BranchUserPermission/GetBranchUsersByUserId?UserId=" +
        id,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  GetBranchUsersByUsername(userName: any) {
    return this.http.get<any[]>(
      this.baseUrl_ +
        "BranchUserPermission/GetBranchUsersByUsername?Username=" +
        userName,
      {
        headers: this.token.headerToken(),
      }
    );
  }

  GetCompanyByCurrentUser() {
    return this.http.get<any[]>(
      this.baseUrl_ + "BranchUserPermission/GetBranchUsersByCurrentUser",
      {
        headers: this.token.headerToken(),
      }
    );
  }

  PostBuyersUsers(model: number, list: any[]) {
    this.obj = {};
    this.obj.userId = model;

    var body = {
      ...this.obj,
      list: list,
    };
    // console.log(body);
    return this.http.post(
      this.baseUrl_ + "RoleManage/BuyersUsersCreate",
      body,
      {
        headers: this.token.headerToken(),
      }
    );
  }
  PostBranchUsers(model: number, list: any[]) {
    this.obj = {};
    this.obj.userId = model;

    var body = {
      ...this.obj,
      list: list,
    };
    // console.log(body);
    return this.http.post(
      this.baseUrl_ + "BranchUserPermission/CreateBranchUserPermission",
      body,
      {
        headers: this.token.headerToken(),
      }
    );
  }
}
