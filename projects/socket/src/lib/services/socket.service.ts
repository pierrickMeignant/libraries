import {Injectable} from '@angular/core';
import {SocketProtocol} from '../types/socket-protocol';
import {Socket} from '../models/observer/socket';
import {BehaviorSubject, Observable} from 'rxjs';
import {SocketEvent} from '../events/socket-event';
import {SocketEventType} from '../types/socket-event-type';
import {SocketObservable} from '../models/observer/socket-observable';
import {filter, map, skip} from 'rxjs/operators';
import {SocketConfiguration} from '../models/socket-configuration';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private eventEmitter = new BehaviorSubject<SocketEvent>({type: SocketEventType.OPEN, data: {}, identity: 0});
  private sockets = new Map<number, () => Socket<any>>();

  constructor() { }

  createSocket<T>(protocol: SocketProtocol | SocketConfiguration<T>, host?: string, path?: string, port?: number,
                              reconnect: boolean = true,
                              convertor: (message: MessageEvent<any>) => T | undefined = this.jsonConvertor()): SocketObservable<T> {
    let socketConfig: SocketConfiguration<T> = {
      protocol: SocketProtocol.WSS,
      host: ''
    };
    if (protocol === SocketProtocol.WS || protocol === SocketProtocol.WSS) {
      socketConfig.protocol = protocol;
      socketConfig.host = host!;
      socketConfig.path = path;
      socketConfig.reconnect = reconnect;
      socketConfig.port = port;
      socketConfig.convertor = convertor;
      socketConfig.identity = 1;
    } else {
      socketConfig = protocol;
    }
    let socketNumber = socketConfig.identity ? socketConfig.identity : 1;
    while (this.sockets.has(socketNumber)) {
      socketNumber++
    }
    socketConfig.identity = socketNumber;
    return this.findSocket(socketConfig);

  }

  findSocket<T>(socketNumber: number | SocketConfiguration<T>, protocol?: SocketProtocol, host?: string, path?: string,
                port?: number,
                reconnect: boolean = true,
                convertor: (message: MessageEvent<any>) => T | undefined = this.jsonConvertor()): SocketObservable<T> {
    if (typeof socketNumber !== 'number') {
      if (!socketNumber.identity) {
        throw new Error('identity is required');
      }
      return this.findSocket(socketNumber.identity, socketNumber.protocol, socketNumber.host, socketNumber.path,
        socketNumber.port, socketNumber.reconnect, socketNumber.convertor);
    }
    const socket = new Socket<T>(protocol!, host, port, path);
    socket.reconnect = reconnect;
    socket.identity = socketNumber;
    socket.open = event => this.sendEvent(SocketEventType.OPEN, event, socketNumber);
    socket.error = error => this.sendEvent(SocketEventType.ERROR, error, socketNumber);
    socket.close = close => this.sendEvent(SocketEventType.CLOSE, close, socketNumber);
    socket.convertorMessage = message => {
      const messageConverted = convertor(message);
      this.sendEvent(SocketEventType.RECEIVE, messageConverted, socketNumber);
      return messageConverted;
    }
    this.sockets.set(socketNumber, () => socket);
    return socket;
  }

  disconnect(socketNumber: number): void {
    const socket = this.sockets.get(socketNumber);
    if (socket) {
     socket().disconnect();
    }
  }

  send(socketNumber: number, message: any,
       convertor: (message: any) => string | ArrayBufferLike | Blob | ArrayBufferView = this.jsonMessageConvertor): void {
    const socket = this.sockets.get(socketNumber);
    if (socket) {
      socket().webSocket?.send(convertor(message));
    }
  }

  socketEventListener(): Observable<SocketEvent> {
    return this.eventEmitter.pipe(skip(1));
  }

  openEvent(identity?: number | (() => number | undefined)): Observable<Event> {
    return this.filterEvent(SocketEventType.OPEN, identity);
  }

  closeEvent(identity?: number | (() => number | undefined)): Observable<CloseEvent> {
    return this.filterEvent(SocketEventType.CLOSE, identity);
  }

  errorEvent(identity?: number | (() => number | undefined)): Observable<Event> {
    return this.filterEvent(SocketEventType.ERROR, identity);
  }

  receiveEvent<T>(identity?: number | (() => number | undefined)): Observable<T> {
    return this.filterEvent(SocketEventType.RECEIVE, identity);
  }

  jsonMessageConvertor(message: any): string | ArrayBufferLike | Blob | ArrayBufferView {
    if (message instanceof ArrayBuffer || message instanceof Blob || typeof  message === 'string') {
      return message;
    }
    return JSON.stringify(message);
  }

  jsonConvertor<T>(): (message: MessageEvent<any>) => T | undefined {
    return message => {
      let data: any | undefined;
      if (typeof message.data === 'string' && this.isFormatJson(message.data)) {
        data = JSON.parse(message.data);
      } else {
        data = message.data;
      }
      return data;
    }
  }

  private filterEvent<T>(filterEvent: SocketEventType, identity?: number | (() => number | undefined)): Observable<T> {
    let id: number | undefined = undefined;
    if (identity) {
      id = typeof identity === 'number' ? identity : identity();
    }
    return this.socketEventListener().pipe(filter(value => value.type === filterEvent
    && id ? id === value.identity : true), map(this.mapper()));
  }

  private sendEvent(type: SocketEventType, data: any | Event | CloseEvent, socketNumber: number): void {
    this.eventEmitter.next({type, data, identity: socketNumber});
  }

  private isFormatJson(data: string, starter?: string, ender?: string): boolean {
    if (starter) {
      return data.startsWith(starter) && data.endsWith(ender!);
    } else {
      return this.isFormatJson(data, '{', '}') || this.isFormatJson(data, '[', ']');
    }
  }

  private mapper<T>(): (event: SocketEvent) => T{
    return event => event.data as T;
  }
}
