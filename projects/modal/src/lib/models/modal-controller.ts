import {ModalContext} from './modal-context';
import {ModalListener} from './modal-listener';

export interface ModalController {
  open(context?: ModalContext): void;
  openWithListener(context?: ModalContext): ModalListener | undefined;
  close(): void;
  isEnable: boolean;
  isReducible: boolean;
}
