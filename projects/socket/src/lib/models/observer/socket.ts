import {SocketProtocol} from '../../types/socket-protocol';
import {SocketObservable} from './socket-observable';
import {SocketSubscriber} from './socket-subscriber';

export class Socket<T> extends SocketObservable<T> {
  observers: SocketSubscriber<any>[] = [];
  private socket?: WebSocket;
  reconnect = true;
  constructor(protocol: SocketProtocol, host: string, port?: number,
              urlSocketConnect?: string) {
    super(subscriber => {
      const url = Socket.prepareUrl(protocol, host, port, urlSocketConnect);
      this.connect(url, subscriber);
    });
  }

  private static prepareUrl(protocol: SocketProtocol, host: string, port?: number, urlSocketConnect?: string): string {
    let url = protocol + host;
    if (port) {
      url += ':' + port;
    }
    if (urlSocketConnect) {
      if (!urlSocketConnect.startsWith('/')) {
        url += '/';
      }
      url += urlSocketConnect;
    }
    return url;
  }

  private connect(url: string, subscriber: SocketSubscriber<T>): void {
    this.observers.push(subscriber);
    if (!this.socket) {
      this.socket = new WebSocket(url);
    }
    const socket = this.socket;
    socket.onopen = ev => {
      this.open(ev);
      subscriber.open(ev);
    };
    socket.onmessage = message => {
      const messageConverted = this.convertorMessage(message);
      if (messageConverted) {
        subscriber.receive(messageConverted);
      }
    };
    socket.onclose = ev => {
      this.close(ev);
      this.observers.slice(this.observers.indexOf(subscriber), 1);
      if (this.reconnect && ev.code !== -1) {
        this.connect(url, subscriber);
      }
    }
    socket.onerror = ev => this.error(ev);
  }

  open: (event: Event) => void = (_event: Event) => {};
  convertorMessage: (message: MessageEvent<any>) => T | undefined = _message => {return undefined;};
  error: (error: Event) => void = _error1 => {};
  close: (close: CloseEvent) => void = _close1 => {};
}
