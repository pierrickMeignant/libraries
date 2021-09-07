import {SocketSubscriber} from './socket-subscriber';
import {SocketSubscription} from './socket-subscription';
import {SocketPromise} from './socket-promise';
import {SocketSubscriberImpl} from './socket-subscriber-impl';

export class SocketObservable<T extends any>{
  private readonly subscriber: (subscriber: SocketSubscriber<T>) => void = _subscriber1 => {};
  private socketSubscriber?: SocketSubscriberImpl<T>;
  protected _unsubscribe?: () => void;
  protected _disconnect: () => void = () => this.unsubscribe();
  identity = 1;

  constructor(subscriber?: (subscriber: SocketSubscriber<T>) => void) {
    if (subscriber) {
      this.subscriber = subscriber;
    }
  }

  subscribe(receive?: (message: T | undefined) => void, error?: (error: Event) => void,
            open?: (open: Event, identity: number) => void,
            close?: (close: CloseEvent) => void): SocketSubscription {
    if (!this.socketSubscriber) {
      this.socketSubscriber = this.createSubscriber(receive, error, close, open, this.identity);
      this.subscriber(this.socketSubscriber);
    }
    this.socketSubscriber.pause = false;
    return new SocketSubscription(() => this.unsubscribe());
  }

  toPromise(): SocketPromise<T> {
    return new SocketPromise<T>((receive, error, open, close) => {
      this.subscribe(message => receive(message), error1 => error(error1),
        (open1, identity) => open(open1, identity),
        close1 => close(close1));
    });
  }

  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  disconnect(): void {
    this._disconnect();
  }

  private createSubscriber(receive1: ((message: (T | undefined)) => void) | undefined, error1: ((error: Event) => void) | undefined,
                           close1: ((close: CloseEvent) => void) | undefined,
                           open1: ((open: Event, identity: number) => void) | undefined, identity: number): SocketSubscriberImpl<T> {
    const subscriber = new class implements SocketSubscriberImpl<T> {
      pause = false;
      private isClose = false;
      close(closeEvent: CloseEvent): void {
        this.subscribe(close1, closeEvent);
        this.isClose = true;
      }

      error(errorEvent: Event): void {
        this.subscribe(error1, errorEvent);
        this.isClose = true;
      }

      open(openEvent: Event): void {
        this.isClose = false;
        if (this.isEnable(open1)) {
          open1!(openEvent, identity);
        }
      }

      receive(message: T | undefined): void {
        this.subscribe(receive1, message);
      }

      get closed(): boolean {
        return this.isClose;
      }

      set closed(_close: boolean) {

      }
      private subscribe<P>(functionExecute: ((value: P) => void) | undefined, value: P): void {
        if (this.isEnable(functionExecute)) {
          functionExecute!(value);
        }
      }

      private isEnable(functionExecute: any | undefined): boolean {
        return !this.pause && !this.isClose && functionExecute;
      }
    };
    if (!this._unsubscribe) {
      this._unsubscribe = () => this.socketSubscriber!.pause = true;
    }
    return subscriber;
  }
}
