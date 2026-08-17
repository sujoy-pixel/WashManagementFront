import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from 'src/app/shared/services/token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FloorStatusService {
  baseUrl  = environment.apiUrl;
  baseUrl_ = this.baseUrl.replace(/[?&]$/, '');

  constructor(private http: HttpClient, private token: TokenService) { }

  /**
   * Fetch floor status data from the backend.
   * Expects the API to return a FLAT list of rows — one row per operation.
   * The component groups them by batchNo into BatchRow objects.
   *
   * Expected API columns:
   *   batchNo, buyer, job, style, order, type, fabrication, color,
   *   dressPart, gsm, shadeBody, shadeFabric, fabricQtyBody, fabricQtyOther,
   *   garmentsQty, operationStartDate, operationName, machineName, operatorName,
   *   loadStart, loadEnd, duration, totalDuration, status
   */
  getFloorStatusData(
   
    orderType: string,
    unitId: number | string,
    fromDate: string,
    toDate: string,
    status: string,
    globalSearch: string
  ): Observable<any[]> {
    let params = new HttpParams();

    if (orderType)     params = params.set('orderType',    orderType);
    if (unitId)        params = params.set('unitId',       unitId.toString());
    if (fromDate)      params = params.set('fromDate',     fromDate);
    if (toDate)        params = params.set('toDate',       toDate);
    if (status)        params = params.set('status',       status);
    if (globalSearch)  params = params.set('globalSearch', globalSearch);

    return this.http.get<any[]>(
      this.baseUrl_ + 'Setup/getFloorStatusData',
      {
        headers: this.token.headerToken(),
        params
      }
    );
  }
}
