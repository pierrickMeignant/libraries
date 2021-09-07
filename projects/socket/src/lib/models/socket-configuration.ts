import {SocketProtocol} from '../types/socket-protocol';

export interface SocketConfiguration<T> {
  protocol: SocketProtocol;
  host: string;
  port?: number;
  path?: string;
  identity?: number;
  reconnect?: boolean;
  convertor?: (message: MessageEvent<any>) => T | undefined;
}
