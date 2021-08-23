import {Endpoint} from './endpoint';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpPathParameters} from './http-path-parameters';
import {HttpOption} from './http-option';
import {copyOption, copyParams, mergeHeaders} from '../builder/BuilderUtils';
import {EndpointsAccessor} from './endpoints-accessor';

export class Api implements EndpointsAccessor {
  constructor(private endpoints: Map<string, Endpoint<any>> = new Map<string, Endpoint<any>>()) {
  }

  getEndpoint<T extends any>(endpointName: string, headers?: HttpHeaders | {[header: string]: string | string[]},
              pathParameters?: HttpPathParameters, parameters?: HttpParams |  {[param: string]: string | string[]}): Endpoint<T> | undefined {
    const endpoint = this.endpoints.get(endpointName);
    if (endpoint) {
     const options = Api.prepareOptions(endpoint.options, headers, parameters);
     return new Endpoint<T>(endpoint.url, endpoint.method, options,
       endpoint.nameDownload, pathParameters, endpointName);
    }
    return undefined;
  }

  hasEndpoint(endpointName: string): boolean {
    return this.endpointsName.indexOf(endpointName) > -1;
  }

  get endpointsName(): string[] {
    const keys: string[] = [];
    this.endpoints.forEach((value, key) => keys.push(key));
    return keys;
  }

  private static prepareOptions(options: HttpOption | undefined,
                                headers?: HttpHeaders | {[header: string]: string | string[]},
                                parameters?: HttpParams | {[param: string]: string | string[]}): HttpOption | undefined {
    let option = copyOption(options);
    if (parameters || headers) {
      if (!option) {
        option = {};
      }
      option.headers = mergeHeaders(option.headers, headers);
      option.params = copyParams(parameters);
    }
    return option;
  }
}
