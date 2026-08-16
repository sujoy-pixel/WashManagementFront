import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from 'src/app/shared/services/token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FloorStatusService {
  baseUrl = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  constructor(private http: HttpClient, private token: TokenService) { }

  getFloorStatusData(
    orderType: string,
    unitId: number | string,
    fromDate: string,
    toDate: string,
    status: string,
    globalSearch: string
  ): Observable<any[]> {
    let params = new HttpParams();

    if (orderType) params = params.set('orderType', orderType);
    if (unitId) params = params.set('unitId', unitId.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (status) params = params.set('status', status);
    if (globalSearch) params = params.set('globalSearch', globalSearch);

    // Expecting the API to return a flat list of operations that we group by batch in the component
    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/GetFloorStatusDashboardData',
      {
        headers: this.token.headerToken(),
        params: params
      }
    );
  }

  getUnitList(): Observable<any[]> {
    return this.http.get<any[]>(
      this.baseUrl_ + 'Common/GetUnitName',
      { headers: this.token.headerToken() }
    );
  }
}
