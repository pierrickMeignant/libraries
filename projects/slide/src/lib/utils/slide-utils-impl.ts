import {BehaviorSubject, Observable} from 'rxjs';
import {SlideEvent} from '../models/slide-event';
import {toObservable} from 'commonlibraries';

export class SlideUtilsImpl {
  static slideEventEmitter = new BehaviorSubject<SlideEvent>({move: 'next', index: 0, item: {
    item: {}
    }});

  static slideEvent(): Observable<SlideEvent> {
    return toObservable(() => SlideUtilsImpl.slideEventEmitter);
  }
}
