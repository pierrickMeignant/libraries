import {SocketEventType} from '../types/socket-event-type';

export interface SocketEvent {
  type: SocketEventType;
  data: any | Event | CloseEvent;
}
