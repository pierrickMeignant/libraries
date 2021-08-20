import {BehaviorSubject, Observable} from 'rxjs';

export interface ModalListener {
  open: {
    before: () => Observable<(() => BehaviorSubject<boolean>) | undefined>;
    after: () => Observable<boolean>;
  },
  close: {
    before: () => Observable<(() => BehaviorSubject<boolean>) | undefined>;
    after: () => Observable<boolean>;
  }
}
