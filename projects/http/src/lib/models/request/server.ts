import {HttpProtocol} from '../types/http-protocol.enum';
import {Api} from './api';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {EndpointsAccessor} from './endpoints-accessor';
import {HttpPathParameters} from './http-path-parameters';
import {Endpoint} from './endpoint';
import {ServerBuilder} from '../builder/server-builder';

export class Server implements EndpointsAccessor {
  private endpointNames?: string[];
  private apiNames?: string[];
  constructor(private apis: Map<string, Api> = new Map<string, Api>()) {
  }

  static builder(host: string = 'localhost', port: number = 8080, protocol: HttpProtocol = HttpProtocol.HTTP,
                 ...completeUrl: string[]): ServerBuilder {
    return ServerBuilder.create(host, port, completeUrl, protocol);
  }

  getEndpoint<T extends any>(endpointName: string, headers?: HttpHeaders | { [p: string]: string | string[] },
                             pathParameters?: HttpPathParameters, parameters?: HttpParams
      | { [p: string]: string | string[] }): Endpoint<T> | undefined {
    const apis = this.apis.values();
    let api = apis.next();
    let endpoint: Endpoint<T> | undefined = undefined;
    while (!api.done && !endpoint) {
      endpoint = api.value.getEndpoint(endpointName, headers, pathParameters, parameters);
      api = apis.next();
    }
    return endpoint;
  }

  get endpointsName(): string[] {
    if (!this.endpointNames) {
      this.endpointNames = [];
      this.apis.forEach(api => api.endpointsName.forEach(endpointName => this.endpointNames!.push(endpointName)));
    }
    return Array.from(this.endpointNames);
  }

  hasEndpoint(endpointName: string): boolean {
    return this.endpointsName.indexOf(endpointName) > -1;
  }

  getApi(apiName: string): EndpointsAccessor | undefined {
    return this.apis.get(apiName);
  }

  get apisName(): string[] {
    if (!this.apiNames) {
      this.apiNames = [];
      this.apis.forEach((value, key) => this.apiNames!.push(key));
    }
    return Array.from(this.apiNames);
  }

  hasApi(apiName: string): boolean {
    return this.apisName.indexOf(apiName) > -1;
  }


}
