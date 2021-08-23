import {ModalContext} from './modal-context';
import {ModalListener} from './modal-listener';

export interface ModalOpenClose {
  open: (context?: ModalContext) => ModalListener | undefined;
  close: () => void;
}
