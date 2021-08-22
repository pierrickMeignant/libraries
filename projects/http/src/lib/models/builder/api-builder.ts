import {Api} from '../request/api';
import {Endpoint} from '../request/endpoint';
import {EndpointBuilder} from './endpoint-builder';
import {mergeOption, mergeUrl} from './BuilderUtils';
import {HttpBuilder} from './http-builder';
import {HttpOption} from '../request/http-option';
import {ServerBuilder} from './server-builder';

export class ApiBuilder extends HttpBuilder<ApiBuilder, ServerBuilder, Api>{
  private endpoints = new Map<string, Endpoint<any>>();
  private endpointsBuilder = new Map<string, (options: HttpOption | undefined) => Endpoint<any>>();

  constructor(private baseUrl: string,  buildMe:(api: (options: HttpOption | undefined) => Api) => ServerBuilder) {
    super(buildMe);
    this.builder = this;
  }

  endpoint(name: string, addName: boolean = true, ...completeUrl: string[]): EndpointBuilder {
    return new EndpointBuilder(mergeUrl(this.baseUrl, name, addName, completeUrl), name,endpoint1 => {
      this.endpointsBuilder.set(name, endpoint1);
      return this;
    });
  }

  protected building(options?: HttpOption): Api {
      const defaultOptions = mergeOption(options, this.options);
      this.endpointsBuilder.forEach((endpointBuilder,key) =>
                                      this.endpoints.set(key, endpointBuilder(defaultOptions)));
      return new Api(this.endpoints);
  }
}

