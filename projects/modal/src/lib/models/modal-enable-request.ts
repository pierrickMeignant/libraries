import {ModalContext} from './modal-context';
import {BehaviorSubject} from 'rxjs';
import {ModalListener} from './modal-listener';

export interface ModalEnableRequest {
  id?: string;
  context?: ModalContext | undefined;
  receiptListener: () => BehaviorSubject<ModalListener | undefined>;
  isOpen?: boolean;
}
