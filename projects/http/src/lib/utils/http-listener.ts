import {Observable} from 'rxjs';
import {HttpSendEvent} from '../models/events/http-send-event';
import {HttpListenerImpl} from './http-listener-impl';

export class HttpListener {
  static event(): Observable<HttpSendEvent> {
    return HttpListenerImpl.event();
  }
}
