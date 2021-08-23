import {BehaviorSubject, Observable, Subscriber, Subscription} from 'rxjs';
import {HttpErrorResponse, HttpEvent} from '@angular/common/http';

export class HttpObservable<T> extends Observable<T>{
  constructor(observableIdentify: Observable<string>,
    subscriptionEmitter: () => BehaviorSubject<(() => Subscription)>,
    private request: Observable<HttpEvent<any>>,
    private success: (identify:string, response: HttpEvent<any>) => T | undefined,
    private error: (identify: string, error: HttpErrorResponse) => HttpErrorResponse,
    private complete: (identify: string) => void
  ) {
    super(subscriber => {
      observableIdentify.subscribe(identify => {
        const subscription = HttpObservable.executeRequest(subscriber, request, success, error, complete, identify);
        subscriptionEmitter().next(() => subscription);
      });
    });
  }

  private static endRequest(subscription: () => Subscription, execute: () => void): void {
    execute();
    setTimeout(() => subscription().unsubscribe(), 1);
  }

  private static executeRequest<T>(subscriber: Subscriber<T>,
    request: Observable<HttpEvent<any>>,
    success: (identify: string, response: HttpEvent<any>) => (T | undefined),
    error: (identify: string, error: HttpErrorResponse) => HttpErrorResponse,
    complete: (identify: string) => void,
    identify: string): Subscription {
    const subscription: Subscription = request.subscribe(value => {
        const data = success(identify, value);
        if (data) {
          subscriber.next(data);
        }
      }, error1 => HttpObservable.endRequest(() => subscription, () => subscriber.error(error(identify, error1))),
      () => HttpObservable.endRequest(() => subscription, () => {
        complete(identify);
        subscriber.complete();
      }));
    return subscription;
  }
}
