import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpEventType} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {Endpoint} from '../models/request/endpoint';
import {HttpOption} from '../models/request/http-option';
import {mergeOption} from '../models/builder/BuilderUtils';
import {HttpMethod} from '../models/types/http-method.enum';
import {HttpObserveType} from '../models/types/http-observe-type.enum';
import {HttpResponseType} from '../models/types/http-response-type.enum';
import {HttpObservable} from '../models/response/http-observable';
import {HttpListenerImpl} from '../utils/http-listener-impl';
import {take} from 'rxjs/operators';
import {toLimitObservable} from 'commonlibraries';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private requestExecuting: string[] = [];

  constructor(private httpClient: HttpClient) {
  }

  execute<B, T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
                success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
                complete?: () => void, progress?: (percent: number) => void): Observable<T> | undefined {
    if (!endpoint) {
      return undefined;
    }
    HttpListenerImpl.putListeners(endpoint, success, error, complete, progress);
    const option = mergeOption(endpoint.options, options);
    // @ts-ignore
    const isHttpResponse = option?.observe === HttpObserveType.RESPONSE;
    const sender = this.createSender<B>(endpoint.method);
    const clientOption = HttpService.createClientOption(option, endpoint.nameDownload);
    return this.sendRequest<B, T>(endpoint, body, sender, clientOption, isHttpResponse);
  }

  safeExecute<B, T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
                    success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
                    complete?: () => void, progress?: (percent: number) => void): Observable<T> | undefined {
    if (!endpoint) {
      return undefined;
    }
    return this.safe(endpoint.nameEndpoint, () => this.execute(endpoint, body, options, success, error,
      complete, progress));
  }

  send<T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
          success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
          complete?: () => void, progress?: (percent: number) => void): Observable<T> | undefined {
    return this.execute<T, T>(endpoint, body, options, success, error, complete, progress);
  }

  safeSend<T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
              success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
              complete?: () => void, progress?: (percent: number) => void): Observable<T> | undefined {
    return this.safeExecute<T, T>(endpoint, body, options, success, error, complete, progress);
  }

  executeInstant<B, T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
                       success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
                       complete?: () => void, progress?: (percent: number) => void): boolean {
    return !!this.execute<B, T>(endpoint, body, options, success, error, complete, progress)?.subscribe();
  }

  safeExecuteInstant<B, T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
                           success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
                           complete?: () => void, progress?: (percent: number) => void): boolean {
    if (!endpoint) {
      return false;
    }
    return this.safeToInstant(endpoint.nameEndpoint, () => this.execute<B, T>(endpoint, body, options,
      success, error, complete, progress));
  }

  instant<T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
             success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
             complete?: () => void, progress?: (percent: number) => void): boolean {
    return this.executeInstant<T, T>(endpoint, body, options, success, error, complete, progress);
  }

  safeInstant<T>(endpoint: Endpoint<T> | undefined, body?: any, options?: HttpOption,
                 success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
                 complete?: () => void, progress?: (percent: number) => void): boolean {
    return this.safeExecuteInstant<T, T>(endpoint, body, options, success, error, complete, progress);
  }

  download(endpoint: Endpoint<Blob> | undefined, nameDownload?: string, body?: any,  options?: HttpOption,
    success?: (response: Blob) => void, error?: (error: HttpErrorResponse) => void,
    complete?: () => void, progress?: (percent: number) => void): Observable<Blob> | undefined {
    if (!endpoint) {
      return undefined;
    }
    if (nameDownload) {
      endpoint.nameDownload = nameDownload;
    } else if (!endpoint.nameDownload) {
      endpoint.nameDownload = endpoint.nameEndpoint;
    }
    return this.send(endpoint, body, options, success, error, complete, progress);
  }

  safeDownload(endpoint: Endpoint<Blob> | undefined, nameDownload?: string, body?: any,  options?: HttpOption,
    success?: (response: Blob) => void, error?: (error: HttpErrorResponse) => void,
    complete?: () => void, progress?: (percent: number) => void): Observable<Blob> | undefined {
    if (!endpoint) {
      return undefined;
    }
    return this.safe(endpoint!.nameEndpoint, () => this.download(endpoint,nameDownload, body, options,
      success, error, complete, progress));
  }

  private safe<T>(endpointName: string, sender: () => Observable<T> | undefined): Observable<T> | undefined {
    if (endpointName && this.requestExecuting.indexOf(endpointName) === -1) {
      this.requestExecuting.push(endpointName);
      return sender();
    }
    return undefined;
  }

  private safeToInstant<T>(endpointName: string, sender: () => Observable<T> | undefined): boolean {
    return !!this.safe(endpointName, sender)?.subscribe();
  }

  private createSender<T>(method: HttpMethod): (url: string, body: any | null, options?: HttpOption) => Observable<HttpEvent<T>> {
    switch (method) {
      case HttpMethod.GET: return (url, body, options) => this.httpClient.get<HttpEvent<T>>(url, options);
      case HttpMethod.POST: return (url, body, options) => this.httpClient.post<HttpEvent<T>>(url, body, options);
      case HttpMethod.PUT: return (url, body, options) => this.httpClient.put<HttpEvent<T>>(url, body, options);
      case HttpMethod.DELETE: return (url, body, options) => this.httpClient.delete<HttpEvent<T>>(url, options);
    }
  }

  private static createClientOption(option: HttpOption | undefined, nameDownload?: string): HttpOption {
    const reportProgress = !!nameDownload || option?.reportProgress;
    return {
      headers: option?.headers,
      responseType: (nameDownload ? HttpResponseType.BLOB : option?.responseType) as HttpResponseType.JSON,
      reportProgress,
      params: option?.params,
      withCredentials: option?.withCredentials,
      observe: (reportProgress ? HttpObserveType.EVENTS : HttpObserveType.RESPONSE) as HttpObserveType.BODY
    };
  }

  private sendRequest<B, T>(endpoint: Endpoint<T>, body: any | undefined,
                              sender: (url: string, body: any, options?: HttpOption) => Observable<HttpEvent<B>>,
               clientOption: HttpOption, isHttpResponse: boolean): Observable<T> {
    HttpListenerImpl.eventEmitter.next({endpoint: endpoint.nameEndpoint, type: 'start'});
    let identifyEmitter = new BehaviorSubject(endpoint.nameEndpoint);
    const isDownload = !!endpoint.nameDownload;
    let observableIdentify = of(isDownload ? endpoint.nameDownload! : endpoint.nameEndpoint).pipe(take(1));
    const subscriptionReceived = new BehaviorSubject<() => Subscription>(() => of().pipe(take(1)).subscribe());
    // @ts-ignore
    if (isDownload && HttpListenerImpl.downloadEmitter.observers.length > 0) {
      identifyEmitter = new BehaviorSubject('');
      HttpListenerImpl.downloadEmitter.next({
        endpoint: endpoint.nameEndpoint,
        type: 'start',
        subscription: () => toLimitObservable(() => subscriptionReceived),
        id: () => identifyEmitter
      });
      observableIdentify = toLimitObservable(() => identifyEmitter);
    }
    return new HttpObservable<T>(observableIdentify, () => subscriptionReceived, sender(endpoint.url, body, clientOption),
      (identify, response) => HttpService.successEventRequest<B, T>(endpoint, identify, isHttpResponse, response, isDownload),
      (identify, error) => {
        HttpListenerImpl.eventEmitter.next({endpoint: identify, type: 'error', data: error});
        if (isDownload) {
          HttpListenerImpl.downloadEmitter.next({endpoint: identify, type: 'error', data: error});
        }
        HttpListenerImpl.errorEmitter.next({endpoint: identify, type: 'error', data: error});
        if (endpoint.error) {
          endpoint.error(error);
        }
        this.complete(identify, isDownload, endpoint.complete);
        return error;
      }, identify => this.complete(identify, isDownload, endpoint.complete)).pipe(take(1));
  }

  private complete(endpoint: string, isDownload: boolean, complete?: () => void): void {
    HttpListenerImpl.eventEmitter.next({endpoint, type: 'end'});
    if (isDownload) {
      HttpListenerImpl.downloadEmitter.next({endpoint, type: 'end'});
    }
    const indexSafeRequest = this.requestExecuting.indexOf(endpoint);
    if (indexSafeRequest > -1) {
      this.requestExecuting.splice(indexSafeRequest, 1);
    }
    if (complete) {
      complete();
    }
  }

  private static successEventRequest<B, T>(endpoint: Endpoint<T>, identify: string, isHttpResponse: boolean,
    response: HttpEvent<B>, isDownload: boolean): T | undefined {
    if (response.type === HttpEventType.DownloadProgress) {
      const percent = response.total ? Math.trunc((response.loaded / response.total) * 100) : undefined;
      HttpListenerImpl.eventEmitter.next({endpoint: identify, data: percent, type: 'percent'});
      HttpListenerImpl.downloadEmitter.next({endpoint: identify, data: percent, type: 'percent'});
      if (endpoint.progress) {
        endpoint.progress(percent);
      }
    }
    let data: T | undefined = undefined;
    if (response.type === HttpEventType.Response) {
      HttpListenerImpl.eventEmitter.next({endpoint: identify, data: response.body, type: 'data'});
      if (isDownload) {
        HttpListenerImpl.downloadEmitter.next({endpoint: identify, data: response.body as unknown as Blob, type: 'data'});
      }
      data = (isHttpResponse ? response : response.body) as unknown as T;
      if (endpoint.success) {
        endpoint.success(data);
      }
    }
    return data;
  }
}
