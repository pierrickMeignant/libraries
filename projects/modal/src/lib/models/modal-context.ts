import {ModalAction} from './modal-action';
import {ModalDisable} from './modal-disable';
import {ModalContent} from './modal-content';
import {Timeout} from 'commonlibraries';

export interface ModalContext {
  id?: string;
  timeout?: Timeout;
  content?: ModalContent;
  open?: ModalAction;
  close?: ModalAction;
  disables?: ModalDisable;
}
