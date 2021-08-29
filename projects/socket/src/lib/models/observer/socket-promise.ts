import {BehaviorSubject} from 'rxjs';
import {SocketEventType} from '../../types/socket-event-type';
import {filter, skip} from 'rxjs/operators';
import {SocketSubscription} from './socket-subscription';

export class SocketPromise<T> {
  private event = new BehaviorSubject({type: SocketEventType.OPEN, data: undefined as (T | Event | undefined)});
  private listen = this.event.pipe(skip(1));
  private subscriptions: SocketSubscription[] = [];

  constructor(promise: (receive: (message: T | undefined) => void, error: (errorEvent: Event) => void, open: (openEvent: Event) => void,
                        close: (closeEvent: CloseEvent) => void)  => void) {
    promise(message => this.sendEvent(SocketEventType.RECEIVE, message),
        errorEvent => this.sendEvent(SocketEventType.ERROR, errorEvent),
        openEvent => this.sendEvent(SocketEventType.OPEN, openEvent),
        closeEvent => this.sendEvent(SocketEventType.CLOSE, closeEvent));
  }

  then<B>(receive: (message: T) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.RECEIVE, value => receive(value as T));
  }

  error<B>(error: (errorEvent: Event) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.RECEIVE, value => error(value as Event));
  }

  open<B>(open: (openEvent: Event) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.RECEIVE, value => open(value as Event));
  }

  close<B>(close: (closeEvent: CloseEvent) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.RECEIVE, value => close(value as CloseEvent));
  }

  unsubscribe(): void {
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  private listenEvent<B>(typeFilter: SocketEventType, subscribe: (value: T | Event | undefined) => B): SocketPromise<B> {
    return new SocketPromise<B>(receive => {
      this.subscriptions.push(this.listen.pipe(filter(value => value.type === typeFilter))
        .subscribe(value => receive(subscribe(value.data))));
    });
  }

  private sendEvent(type: SocketEventType, data: T | Event | undefined): void {
    this.event.next({type, data});
  }
}
