import {ModalType} from './modal-type';

export interface ModalEvent {
  id?: string;
  accept: boolean;
  message?: string;
  type: ModalType;
}
