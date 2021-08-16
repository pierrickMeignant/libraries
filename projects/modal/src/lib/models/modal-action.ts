import {Observable} from 'rxjs';

export interface ModalAction {
  before?: () => (boolean | Observable<boolean>);
  after?: () => void;
}
