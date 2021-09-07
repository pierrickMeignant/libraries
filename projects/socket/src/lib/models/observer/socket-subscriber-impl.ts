import {SocketSubscriber} from './socket-subscriber';

export interface SocketSubscriberImpl<T> extends SocketSubscriber<T>{
  pause: boolean;
}
