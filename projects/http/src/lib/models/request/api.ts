import {Endpoint} from './endpoint';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpPathParameters} from './http-path-parameters';
import {HttpOption} from './http-option';
import {copyOption, copyParams, mergeHeaders} from '../builder/BuilderUtils';
import {ApisAccessor} from './apis-accessor';

export class Api implements ApisAccessor {
  private apiNames?: string[];
  constructor(private endpoints: Map<string, Endpoint<any>> = new Map<string, Endpoint<any>>(),
              private apis: Map<string, Api> = new Map<string, Api>()) {
  }

  getEndpoint<T extends any>(endpointName: string, headers?: HttpHeaders | {[header: string]: string | string[]},
              pathParameters?: HttpPathParameters, parameters?: HttpParams |  {[param: string]: string | string[]}): Endpoint<T> | undefined {
    let endpoint = this.endpoints.get(endpointName);
    if (!endpoint) {
      const keys = this.apisName;
      let key = keys.shift();
      while (key && !endpoint) {
        endpoint = this.getApi(key)?.getEndpoint(endpointName, headers, pathParameters, parameters);
        key = keys.shift();
      }
    }
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

  get apisName(): string[] {
    if (!this.apiNames) {
      this.apiNames = [];
      this.apis.forEach((value, key) => this.apiNames!.push(key));
    }
    return Array.from(this.apiNames);
  }

  getApi(apiName: string): ApisAccessor | undefined {
    return this.apis.get(apiName);
  }

  hasApi(apiName: string): boolean {
    return this.apisName.indexOf(apiName) > -1;
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
