import {BehaviorSubject} from 'rxjs';
import {SocketEventType} from '../../types/socket-event-type';
import {filter, skip} from 'rxjs/operators';
import {SocketSubscription} from './socket-subscription';

export class SocketPromise<T> {
  private event = new BehaviorSubject({type: SocketEventType.OPEN,
    data: undefined as (T | Event | CloseEvent | undefined | {event: Event, identity: number})});
  private listen = this.event.pipe(skip(1));
  private subscriptions: SocketSubscription[] = [];

  constructor(promise: (receive: (message: T | undefined) => void, error: (errorEvent: Event) => void,
                        open: (openEvent: Event, identity: number) => void,
                        close: (closeEvent: CloseEvent) => void)  => void) {
    promise(message => this.sendEvent(SocketEventType.RECEIVE, message),
        errorEvent => this.sendEvent(SocketEventType.ERROR, errorEvent),
      (openEvent, identity) => this.sendEvent(SocketEventType.OPEN, {event: openEvent, identity}),
        closeEvent => this.sendEvent(SocketEventType.CLOSE, closeEvent));
  }

  then<B>(receive: (message: T) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.RECEIVE, value => receive(value as T));
  }

  error<B>(error: (errorEvent: Event) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.ERROR, value => error(value as Event));
  }

  open<B>(open: (openEvent: Event, identity: number) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.OPEN, value => {
      const openReceive = value as {event: Event, identity: number};
      return open(openReceive.event, openReceive.identity);
    });
  }

  close<B>(close: (closeEvent: CloseEvent) => B): SocketPromise<B> {
    return this.listenEvent(SocketEventType.CLOSE, value => close(value as CloseEvent));
  }

  unsubscribe(): void {
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  private listenEvent<B>(typeFilter: SocketEventType,
                         subscribe: (value: T | Event | CloseEvent | undefined | {event: Event, identity: number}) => B): SocketPromise<B> {
    return new SocketPromise<B>(receive => {
      this.subscriptions.push(this.listen.pipe(filter(value => value.type === typeFilter))
        .subscribe(value => receive(subscribe(value.data as (T | Event | CloseEvent | undefined | {event: Event, identity: number})))));
    });
  }

  private sendEvent(type: SocketEventType, data: T | Event | CloseEvent | undefined | {event: Event, identity: number}): void {
    this.event.next({type, data});
  }
}
