import {NgModule} from '@angular/core';
import {ModalComponent} from './components/modal/modal.component';
import {ModalReducibleComponent} from './components/modal-reducible/modal-reducible.component';
import {ModalWaitComponent} from './components/modal-wait/modal-wait.component';
import {CommonModule} from '@angular/common';


@NgModule({
  declarations: [
    ModalComponent, ModalReducibleComponent, ModalWaitComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ModalComponent, ModalReducibleComponent, ModalWaitComponent
  ]
})
export class ModalModule { }
