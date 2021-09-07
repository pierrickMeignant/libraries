import {SocketProtocol} from '../../types/socket-protocol';
import {SocketObservable} from './socket-observable';
import {SocketSubscriber} from './socket-subscriber';
import {SocketConfiguration} from '../socket-configuration';

export class Socket<T> extends SocketObservable<T> {
  observers: SocketSubscriber<any>[] = [];
  webSocket?: WebSocket;
  reconnect = true;
  private couldDisconnect = false;
  private disconnectIfSignalDisconnectReceiveBeforeOpen: () => boolean = () => false;
  constructor(protocol: SocketProtocol | SocketConfiguration<T>, host?: string, port?: number,
              path?: string) {
    super(subscriber => {
      let url: string;
      if (protocol === SocketProtocol.WS || protocol === SocketProtocol.WSS) {
        url = Socket.prepareUrl(protocol, host!, port, path)
      } else {
        url = Socket.prepareUrl(protocol.protocol, protocol.host, protocol.port, protocol.path);
      }
      this.connect(url, subscriber);
    });
  }

  private static prepareUrl(protocol: SocketProtocol, host: string, port?: number, path?: string): string {
    let url = protocol + host;
    if (port) {
      url += ':' + port;
    }
    if (path) {
      if (!path.startsWith('/')) {
        url += '/';
      }
      url += path;
    }
    return url;
  }

  private connect(url: string, subscriber: SocketSubscriber<T>): void {
    this.observers.push(subscriber);
    if (!this.webSocket) {
      this.webSocket = new WebSocket(url);
    }
    const socket = this.webSocket;
    socket.onopen = ev => {
      if (!this.disconnectIfSignalDisconnectReceiveBeforeOpen()) {
        this.open(ev);
        this.disconnectIfSignalDisconnectReceiveBeforeOpen();
        subscriber.open(ev);
      }
    };
    socket.onmessage = message => {
      const messageConverted = this.convertorMessage(message);
      if (messageConverted) {
        subscriber.receive(messageConverted);
      }
    };
    socket.onclose = ev => {
      this.close(ev);
      subscriber.close(ev);
      this.observers.slice(this.observers.indexOf(subscriber), 1);
      if (this.reconnect && ev.code !== 1000) {
        this.connect(url, subscriber);
      }
    }
    socket.onerror = ev => {
      this.error(ev);
      subscriber.error(ev);
    }
  }

  open: (event: Event) => void = (_event: Event) => {};
  convertorMessage: (message: MessageEvent<any>) => T | undefined = _message => {return undefined;};
  error: (error: Event) => void = _error1 => {};
  close: (close: CloseEvent) => void = _close1 => {};

  disconnect(): void {
    if (this.couldDisconnect) {
      this.webSocket?.close(1000, 'disconnect');
    } else {
      this.disconnectIfSignalDisconnectReceiveBeforeOpen = () => {
        this.couldDisconnect = true;
        this.disconnect();
        return true;
      };
    }
  }
}
