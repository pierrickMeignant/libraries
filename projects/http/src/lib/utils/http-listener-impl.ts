import {BehaviorSubject, Observable} from 'rxjs';
import {HttpSendEvent} from '../models/events/http-send-event';
import {skip} from 'rxjs/operators';
import {Endpoint} from '../models/request/endpoint';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpDownloadEvent} from '../models/events/http-download-event';

export class HttpListenerImpl {
  static eventEmitter = new BehaviorSubject<HttpSendEvent>({
    endpoint: '', type: 'data'
  });

  static downloadEmitter = new BehaviorSubject<HttpDownloadEvent>(
    { endpoint: '', type: 'data'}
  );

  static enableWaitEmitter = new BehaviorSubject(false);

  static errorEmitter = new BehaviorSubject<HttpSendEvent>({endpoint: '', type: 'error'});

  static event(): Observable<HttpSendEvent> {
    return HttpListenerImpl.toObservable(() => HttpListenerImpl.eventEmitter);
  }

  static download(): Observable<HttpDownloadEvent> {
    return HttpListenerImpl.toObservable(() => HttpListenerImpl.downloadEmitter);
  }

  static error(): Observable<HttpSendEvent> {
    return HttpListenerImpl.toObservable(() => HttpListenerImpl.errorEmitter);
  }

  static enableWait(): Observable<boolean> {
    return HttpListenerImpl.toObservable(() => HttpListenerImpl.enableWaitEmitter);
  }

  static putListeners<T>(endpoint: Endpoint<T>, success?: (response: T) => void, error?: (error: HttpErrorResponse) => void,
                         complete?: () => void, progress?: (percent: number) => void): void {
    HttpListenerImpl.putListener(endpoint, 'success', success);
    HttpListenerImpl.putListener(endpoint, 'error', error);
    HttpListenerImpl.putListener(endpoint, 'complete', complete);
    HttpListenerImpl.putListener(endpoint, 'progress', progress);
  }

  private static putListener<T>(endpoint: Endpoint<T>, key: 'success' | 'error' | 'progress' | 'complete',
                                listener?: (data?: any) => void): void {
    if (listener) {
      endpoint[key] = listener;
    }
  }

  private static toObservable<T>(emitter: () => BehaviorSubject<T>): Observable<T> {
    return emitter().pipe(skip(1));
  }
}
