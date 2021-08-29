import {HttpHeaders} from '@angular/common/http';
import {copyHeader, copyOption} from './BuilderUtils';
import {HttpOption} from '../request/http-option';

export abstract class HttpBuilderHeader<B> {
  protected builder!: B;
  protected options?: HttpOption;

  protected constructor(options?: HttpOption) {
    this.options = copyOption(options);
  }

  header(headers: HttpHeaders | {[header: string]: string | string[]}): B {
    return this.updateOptions(() => {
      this.options!.headers = copyHeader(headers);
    });
  }

  setHeader(name: string, value: string | string[]): B {
    return this.updateOptions(() => {
      this.updateHeader(header => {
        return header.set(name, value);
      });
    });
  }

  appendHeader(name: string, value: string | string[]): B {
    return this.updateOptions(() => {
      this.updateHeader(header => {
        return header.append(name, value);
      });
    });
  }

  protected updateHeader(updater: (header: HttpHeaders) => HttpHeaders) {
    let header = this.options!.headers;
    if (!header) {
      header = new HttpHeaders();
    }
    this.options!.headers = updater(header as HttpHeaders);
  }

  protected updateOptions(updateOptions: () => void): B {
    if (!this.options) {
      this.options = {};
    }
    updateOptions();
    return this.builder;
  }
}
