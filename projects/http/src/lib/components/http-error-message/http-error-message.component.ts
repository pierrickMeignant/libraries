import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalContext, ModalListener} from 'modal-viewer';
import {HttpListenerImpl} from '../../utils/http-listener-impl';
import {AccordionItem} from 'accordion-viewer';
import {HttpErrorResponse} from '@angular/common/http';
import {Destroyer} from 'commonlibraries';

@Component({
  selector: 'http-error-message',
  templateUrl: './http-error-message.component.html',
  styleUrls: ['./http-error-message.component.css']
})
export class HttpErrorMessageComponent extends Destroyer implements OnInit {
  @Input()
  title = 'http error messages';

  @Output()
  receiveError = new EventEmitter<HttpErrorResponse>();
  @Output()
  afterOpen = new EventEmitter<void>();
  @Output()
  afterClose = new EventEmitter<void>();

  errors: AccordionItem[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  open(openModal: (context?: ModalContext) => ModalListener | undefined): void {
    this.addObservable(HttpListenerImpl.error(), value => {
      const error = value.data as HttpErrorResponse;
      this.receiveError.next(error);
      this.errors.push({
        isExpand: this.errors.length === 0,
        header: value.endpoint,
        text: `status: ${error.status} => ${error.error ? JSON.stringify(error.error) : error.message}`
      });
      openModal();
    });
  }

  onClose(): void {
    this.errors = [];
    this.afterClose.next();
  }

  onOpen(): void {
    this.afterOpen.next();
  }
}
