import {BehaviorSubject, Observable} from "rxjs";
import {SlideEvent} from "../models/slide-event";
import {skip} from "rxjs/operators";

export class SlideUtilsImpl {
  static handlePropertyBoolean(property: boolean | 'true' | 'false'): boolean {
    return typeof property === 'string' ? property === 'true' : property;
  }

  static slideEventEmitter = new BehaviorSubject<SlideEvent>({move: 'next', index: 0, item: {
    item: {}
    }});

  static slideEvent(): Observable<SlideEvent> {
    return SlideUtilsImpl.slideEventEmitter.pipe(skip(1));
  }
}
