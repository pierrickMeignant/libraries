import {Api} from '../request/api';
import {HttpOption} from '../request/http-option';
import {HttpProtocol} from '../types/http-protocol';
import {ApiBuilder} from './api-builder';
import {HttpHeaders} from '@angular/common/http';
import {Server} from '../request/server';
import {HttpBuilderHeader} from './http-builder-header';

export class ServerBuilder extends HttpBuilderHeader<ServerBuilder> {
  private url?: string;
  private apis = new Map<string, Api>();
  private apisBuilder = new Map<string, (options: HttpOption | undefined) => Api>();

  private constructor(protocol: HttpProtocol,host: string, port: number, completeUrl: string[]) {
    super();
    this.url = protocol + host + ':' + port;
    completeUrl.forEach(value => this.url += '/' + value);
    this.builder = this;
  }

  static create(host: string = 'localhost', port: number = 8080, completeUrl: string[],
                protocol: HttpProtocol = HttpProtocol.HTTP): ServerBuilder {
    return new ServerBuilder(protocol, host, port, completeUrl);
  }

  static builder(host: string = 'localhost', port: number = 8080, protocol: HttpProtocol = HttpProtocol.HTTP,
                 ...completeUrl: string[]): ServerBuilder {
    return ServerBuilder.create(host, port, completeUrl, protocol);
  }

  api(name: string, addName: boolean = true, ...completeUrl: string[]): ApiBuilder<ServerBuilder> {
    return this.createApiBuilder(name, addName, completeUrl);
  }

  createApi(name: string, headers: HttpHeaders | {[header: string]: string | string[]},
            addName: boolean = true, ...completeUrl: string[]): ApiBuilder<ServerBuilder> {
    return this.createApiBuilder(name, addName, completeUrl).header(headers);
  }

  build(): Server {
    this.apisBuilder.forEach((value, key) => this.apis.set(key, value(this.options)));
    return new Server(this.apis);
  }

  private createApiBuilder(name: string, addName: boolean, completeUrl: string[]): ApiBuilder<ServerBuilder> {
    let urlApi = this.url + (addName ? '/' + name : '');
    completeUrl.forEach(value => urlApi += '/' + value);
    return new ApiBuilder(urlApi, api => {
      this.apisBuilder.set(name, api);
      return this;
    });
  }
}
