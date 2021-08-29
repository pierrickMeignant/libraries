import {Endpoint} from '../request/endpoint';
import {ApiBuilder} from './api-builder';
import {HttpMethod} from '../types/http-method.enum';
import {HttpOption} from '../request/http-option';
import {HttpBuilder} from './http-builder';

export class EndpointBuilder<R> extends HttpBuilder<EndpointBuilder<R>, ApiBuilder<R>, Endpoint<any>>{
  private method = HttpMethod.GET;
  private nameDownload?: string;
  constructor(private baseUrl: string,
    private nameEndpoint: string,
    buildMe:(endpoint: (options: HttpOption | undefined) => Endpoint<any>) => ApiBuilder<R>) {
    super(buildMe);
    this.builder = this;
  }

  download(nameDownload: string = this.nameEndpoint): EndpointBuilder<R> {
    this.nameDownload = nameDownload;
    return this;
  }

  protected building(options?: HttpOption): Endpoint<any> {
    return new Endpoint<any>(this.baseUrl, this.method, options, this.nameDownload);
  }
}
