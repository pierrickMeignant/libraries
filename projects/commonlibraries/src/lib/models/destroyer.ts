import {Observable, Subscription} from 'rxjs';
import {Component, OnDestroy} from '@angular/core';
import {Timeout} from './timeout/timeout';
import {timeoutToMillisecond} from '../LibrariesUtils';

@Component({
  template: ''
})
export abstract class Destroyer implements OnDestroy {
  private subscriptions: Subscription[] = [];
  private intervals: any[] = [];

  protected constructor() {
  }

  addSubscription(subscription: Subscription): number {
    return this.subscriptions.push(subscription) - 1;
  }

  addObservable<T>(observable: Observable<T>, subscriber: (value: T) => void): number {
    return this.addSubscription(observable.subscribe(value => subscriber(value)));
  }

  addInterval(interval: any): number {
    return this.intervals.push(interval) - 1;
  }

  createInterval(body: () => void, timeout: number | Timeout): number {
    return this.addInterval(setInterval(() => body(), typeof  timeout === 'number' ? timeout : timeoutToMillisecond(timeout)));
  }

  getSubscription(index: number): Subscription | undefined {
    return this.subscriptions[index];
  }

  getInterval(index: number): any | undefined {
    return this.intervals[index];
  }

  destroySubscription(index: number): void {
   this.getSubscription(index)?.unsubscribe();
  }

  destroyInterval(index: number): void {
    const interval = this.getInterval(index);
    if (interval) {
      clearInterval(interval);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(value => value.unsubscribe());
    this.subscriptions = [];
    this.intervals.forEach(value => clearInterval(value));
    this.intervals = [];
  }
}
