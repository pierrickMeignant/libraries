import {HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpPathParameters} from './http-path-parameters';
import {Endpoint} from './endpoint';

export interface EndpointsAccessor {
  getEndpoint<T extends any>(endpointName: string, headers?: HttpHeaders | {[header: string]: string | string[]},
                             pathParameters?: HttpPathParameters, parameters?: HttpParams |
      {[param: string]: string | string[]}): Endpoint<T> | undefined;

  hasEndpoint(endpointName: string): boolean;

  endpointsName: string[];
}
