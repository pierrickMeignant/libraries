import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {HttpEvent} from './http-event';

export interface HttpDownloadEvent extends HttpEvent<Blob> {
  subscription?: () => Observable<() => Subscription>;
  id?: () => BehaviorSubject<string>;
}
