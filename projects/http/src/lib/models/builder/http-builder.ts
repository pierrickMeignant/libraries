import {HttpOption} from '../request/http-option';
import {HttpHeaders} from '@angular/common/http';
import {HttpResponseType} from '../types/http-response-type';
import {copyOption, mergeOption} from './BuilderUtils';
import {HttpBuilderHeader} from './http-builder-header';

export abstract class HttpBuilder<B, R, E> extends HttpBuilderHeader<B>{

  private headersDeleting: {name: string, value?: string | string[]}[] = [];

  protected constructor(private buildMe:(buildAction: (options: HttpOption | undefined) => E) => R) {
    super();
  }

  deleteHeader(name: string, value: string | string[]): B {
    this.headersDeleting.push({name, value});
    return this.builder;
  }

  withCredentials(withCredentials: boolean): B {
    return this.updateOptions(() => this.options!.withCredentials = withCredentials);
  }

  reportProgress(reportProgress: boolean): B {
    return this.updateOptions(() => this.options!.reportProgress = reportProgress);
  }

  responseType(responseType: HttpResponseType): B {
    return this.updateOptions(() => this.options!.responseType = responseType as HttpResponseType.JSON);
  }

  protected abstract building(options?: HttpOption): E;

  build(): R {
    return this.buildMe(options => {
      const endpointOptions = mergeOption(this.deleteInHeaderApi(options), this.options);
      return this.building(endpointOptions);
    });
  }

  private deleteInHeaderApi(options?: HttpOption): HttpOption | undefined {
    if (!options) {
      return undefined;
    }
    let optionCopy = options;
    if (options.headers) {
      optionCopy = copyOption(options)!;
      let header = options.headers as HttpHeaders;
      this.headersDeleting.forEach(value => header = header.delete(value.name, value.value));
      optionCopy.headers = header;
    }
    return optionCopy;
  }
}
