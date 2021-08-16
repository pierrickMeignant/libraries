import {Observable, Subscription} from 'rxjs';
import {Component, OnDestroy} from '@angular/core';

@Component({
  template: ''
           })
export abstract class SubscriptionDestroyer implements OnDestroy {
  private subscriptions: Subscription[] = [];

  protected constructor() {
  }

  addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  addObservable<T>(observable: Observable<T>, subscriber: (value: T) => void) {
    this.addSubscription(observable.subscribe(value => subscriber(value)));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(value => value.unsubscribe());
    this.subscriptions = [];
  }

}
