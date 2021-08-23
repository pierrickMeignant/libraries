import {HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpResponseType} from '../types/http-response-type.enum';
import {HttpObserveType} from '../types/http-observe-type.enum';

export interface HttpOption {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  responseType?: HttpResponseType.JSON;
  reportProgress?: boolean;
  observe?: HttpObserveType.BODY;
  withCredentials?: boolean;
}
