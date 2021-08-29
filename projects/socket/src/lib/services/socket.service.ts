import {Injectable} from '@angular/core';
import {SocketProtocol} from '../types/socket-protocol';
import {Socket} from '../models/observer/socket';
import {BehaviorSubject, Observable} from 'rxjs';
import {SocketEvent} from '../events/socket-event';
import {SocketEventType} from '../types/socket-event-type';
import {SocketMessageType} from '../types/socket-message-type';
import {SocketObservable} from '../models/observer/socket-observable';
import {skip} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private eventEmitter = new BehaviorSubject<SocketEvent>({type: SocketEventType.OPEN, data: {}});
  private sockets = new Map<string, () => SocketObservable<any>>();

  constructor() { }

  createSocket<T>(protocol: SocketProtocol, host: string, completeUrl?: string, port?: number,
                              reconnect: boolean = true,
                              convertor: (message: MessageEvent<any>) => T | undefined = this.jsonConvertor()): SocketObservable<T> {
      let socketNumber = 1;
      let key = SocketService.createKey(socketNumber, protocol, host, port, completeUrl);
      while (this.sockets.has(key)) {
        key = `${socketNumber}${key.substring(socketNumber.toString().length)}`;
        socketNumber++;
      }
      return this.findSocket(socketNumber, protocol, host, completeUrl, port, reconnect, convertor);
  }

  findSocket<T>(socketNumber: number, protocol: SocketProtocol, host: string, completeUrl?: string, port?: number,
                reconnect: boolean = true,
                convertor: (message: MessageEvent<any>) => T | undefined = this.jsonConvertor()): SocketObservable<T> {
    const key = SocketService.createKey(socketNumber, protocol, host, port, completeUrl);
    const observable = this.sockets.get(key);
    if (observable) {
      return observable();
    }
    const socket = new Socket<T>(protocol, host, port, completeUrl);
    socket.reconnect = reconnect;
    socket.open = event => this.sendEvent(SocketEventType.OPEN, event);
    socket.error = error => this.sendEvent(SocketEventType.ERROR, error);
    socket.close = close => this.sendEvent(SocketEventType.CLOSE, close);
    socket.convertorMessage = message => {
      this.sendEvent(SocketEventType.RECEIVE, message.data);
      return convertor(message);
    }
    this.sockets.set(key, () => socket);
    return socket;
  }

  socketEventListener(): Observable<SocketEvent> {
    return this.eventEmitter.pipe(skip(1));
  }

  jsonConvertor<T>(): (message: MessageEvent<any>) => T | undefined {
    return message => {
      let data: any | undefined;
      if (message.type === SocketMessageType.STRING && this.isFormatJson(message.data)) {
        data = JSON.parse(message.data);
      } else {
        data = message.data;
      }
      return data;
    }
  }

  private static createKey(socketNumber: number, protocol: SocketProtocol, host: string,
                           port?: number, completeUrl?: string): string {
    let key = `${socketNumber}_${protocol}_${host}`;
    if (port) {
      key += `_${port}`;
    }
    if (completeUrl) {
      key += `_${completeUrl}`;
    }
    return key;
  }

  private sendEvent(type: SocketEventType, data: any | Event | CloseEvent): void {
    this.eventEmitter.next({type, data});
  }

  private isFormatJson(data: string, starter?: string, ender?: string): boolean {
    if (starter) {
      return data.startsWith(starter) && data.endsWith(ender!);
    } else {
      return this.isFormatJson(data, '{', '}') || this.isFormatJson(data, '[', ']');
    }
  }
}
