import {ModalAction} from './modal-action';
import {ModalDisable} from './modal-disable';
import {ModalContent} from './modal-content';
import {ModalTimeout} from './modal-timeout';

export interface ModalContext {
  id?: string;
  timeout?: ModalTimeout;
  content?: ModalContent;
  open?: ModalAction;
  close?: ModalAction;
  disables?: ModalDisable;
}
