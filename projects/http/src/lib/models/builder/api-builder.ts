import {Api} from '../request/api';
import {Endpoint} from '../request/endpoint';
import {EndpointBuilder} from './endpoint-builder';
import {mergeOption, mergeUrl} from './BuilderUtils';
import {HttpBuilder} from './http-builder';
import {HttpOption} from '../request/http-option';
import {HttpHeaders} from '@angular/common/http';
import {HttpMethod} from '../types/http-method';

export class ApiBuilder<R> extends HttpBuilder<ApiBuilder<R>, R, Api>{
  private endpointsBuilder = new Map<string, (options: HttpOption | undefined) => Endpoint<any>>();
  private apisBuilder = new Map<string, (options: HttpOption | undefined) => Api>();

  constructor(private baseUrl: string,  buildMe:(api: (options: HttpOption | undefined) => Api) => R) {
    super(buildMe);
    this.builder = this;
  }

  endpoint(name: string, method: HttpMethod = HttpMethod.GET, addName: boolean = true, ...completeUrl: string[]): EndpointBuilder<R> {
    return new EndpointBuilder(mergeUrl(this.baseUrl, name, addName, completeUrl), name, method,
        endpoint1 => {
      this.endpointsBuilder.set(name, endpoint1);
      return this;
    });
  }

  api(name: string, addName: boolean = true, ...completeUrl: string[]): ApiBuilder<ApiBuilder<R>> {
    return this.createApiBuilder(name, addName, completeUrl);
  }

  createApi(name: string, headers: HttpHeaders | {[header: string]: string | string[]},
            addName: boolean = true, ...completeUrl: string[]): ApiBuilder<ApiBuilder<R>> {
    return this.createApiBuilder(name, addName, completeUrl).header(headers);
  }

  protected building(options?: HttpOption): Api {
    const defaultOptions = mergeOption(options, this.options);
    return new Api(this.mapBuilder(this.endpointsBuilder, defaultOptions), this.mapBuilder(this.apisBuilder, defaultOptions));
  }

  private mapBuilder<T>(builders: Map<string, (options: HttpOption | undefined) => T>,
                        defaultOptions?: HttpOption): Map<string, T> {
    const accessors = new Map<string, T>();
    builders.forEach((builder, key) => accessors.set(key, builder(defaultOptions)));
    return accessors;
  }

  private createApiBuilder(name: string, addName: boolean, completeUrl: string[]): ApiBuilder<ApiBuilder<R>> {
    let urlApi = this.baseUrl + (addName ? '/' + name : '');
    completeUrl.forEach(value => urlApi += '/' + value);
    return new ApiBuilder(urlApi, api => {
      this.apisBuilder.set(name, api);
      return this;
    });
  }
}

