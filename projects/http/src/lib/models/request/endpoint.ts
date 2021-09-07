import {HttpMethod} from '../types/http-method';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpPathParameters} from './http-path-parameters';
import {HttpOption} from './http-option';

export class Endpoint<T> {
  private urlEndpoint = '';
  constructor(baseUrl: string, public readonly method: HttpMethod = HttpMethod.GET,
              public readonly options?: HttpOption,
              public nameDownload?: string,
              pathParameters?: HttpPathParameters,
              public readonly nameEndpoint: string = '') {
    if (pathParameters) {
      const pathUrl = baseUrl.split('/');
      const protocol = pathUrl.shift();
      if (protocol) {
        this.urlEndpoint = `${protocol}/`;
        pathUrl.shift();
      }
      pathUrl.forEach(path => this.transformByParameter(path, pathParameters, transform => `/${transform}`));
    } else {
      this.urlEndpoint = baseUrl;
    }
  }

  success?: (response: T) => void;
  error?: (error: HttpErrorResponse) => void;
  progress?: (percent?: number) => void;
  complete?: () => void;

  get url(): string {
    return this.urlEndpoint;
  }

  private transformByParameter(path: string, pathParameters: HttpPathParameters,
                               transform: (transform: string) => string): void {
    let value = path;
    if (path.startsWith('{') && path.endsWith('}')) {
      value = pathParameters.get(path.substring(1, path.length - 1));
    }
    this.urlEndpoint += transform(value);
  }
}
