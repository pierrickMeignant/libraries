import {SocketSubscriber} from './socket-subscriber';
import {SocketSubscription} from './socket-subscription';
import {SocketPromise} from './socket-promise';

export class SocketObservable<T extends any>{
  private readonly subscriber: (subscriber: SocketSubscriber<T>) => void = _subscriber1 => {};
  constructor(subscriber?: (subscriber: SocketSubscriber<T>) => void) {
    if (subscriber) {
      this.subscriber = subscriber;
    }
  }

  subscribe(receive?: (message: T | undefined) => void, error?: (error: Event) => void,
            close?: (close: CloseEvent) => void, open?: (open: Event) => void): SocketSubscription {
    const subscriber = new class implements SocketSubscriber<T> {
      pause = false;
      private isClose = false;
      close(closeEvent: CloseEvent): void {
        this.subscribe(close, closeEvent);
        this.isClose = true;
      }

      error(errorEvent: Event): void {
        this.subscribe(error, errorEvent);
        this.isClose = true;
      }

      open(openEvent: Event): void {
        this.isClose = false;
        this.subscribe(open, openEvent);
      }

      receive(message: T | undefined): void {
        this.subscribe(receive, message);
      }

      get closed(): boolean {
        return this.isClose;
      }

      set closed(_close: boolean) {

      }
      private subscribe<P>(functionExecute: ((value: P) => void) | undefined, value: P): void {
        if (!this.pause && !this.isClose && functionExecute) {
          functionExecute(value);
        }
      }
    };
    const subscription = new SocketSubscription(() => this.createUnsubscribe(subscriber));
    this.subscriber(subscriber);
    return subscription;
  }

  toPromise(): SocketPromise<T> {
    return new SocketPromise<T>((receive, error, open, close) => {
      this.subscribe(message => receive(message), error1 => error(error1), close1 => close(close1),
        open1 => open(open1));
    });
  }

  private createUnsubscribe(subscriber: {pause: boolean, close: (closeEvent: CloseEvent) => void}): void {
    subscriber.pause = false;
    subscriber.close({
      code: -1,
      reason: 'unsubscribe',
      wasClean: true,
      bubbles: false,
      preventDefault() {
      },
      AT_TARGET: -1,
      BUBBLING_PHASE: -1,
      cancelable: false,
      cancelBubble: false,
      CAPTURING_PHASE: -1,
      composed: false,
      composedPath(): EventTarget[] {
        return [];
      },
      currentTarget: null,
      defaultPrevented: true,
      eventPhase: -1,
      initEvent(_type: string, _bubbles?: boolean, _cancelable?: boolean) {
      },
      type: 'unsubscribe',
      NONE: -1,
      isTrusted: true,
      returnValue: true,
      srcElement: null,
      stopImmediatePropagation() {
      },
      stopPropagation() {
      },
      target: null,
      timeStamp: 0
    });
  }
}
