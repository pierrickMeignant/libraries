import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {ColorWait, ModalOpenClose, ShapeWait} from 'modal-viewer';
import {SubscriptionDestroyer} from 'subscription-destroyer';
import {HttpListener} from '../../utils/http-listener';
import {HttpListenerImpl} from '../../utils/http-listener-impl';

@Component({
  selector: 'http-loader',
  templateUrl: './http-loader.component.html',
  styleUrls: ['./http-loader.component.css']
})
export class HttpLoaderComponent extends SubscriptionDestroyer implements OnInit {
  @Input()
  shape: ShapeWait | 'round' | 'circle' = ShapeWait.CIRCLE;
  @Input()
  color:  ColorWait | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' = ColorWait.DARK_BLUE;
  @Input()
  colorText:  ColorWait | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' = ColorWait.DARK_BLUE;
  @Input()
  active: boolean | 'true' | 'false' = false;
  @Input()
  centerDisable: boolean | 'true' | 'false' = false;
  @Input()
  body?: TemplateRef<any>;

  @Output()
  afterOpen = new EventEmitter<void>();
  @Output()
  afterClose = new EventEmitter<void>();

  private modalStarted = 0;
  private enable = true;

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  afterCloseModal(): void {
    this.afterClose.next();
  }

  afterOpenModal(): void {
    this.afterOpen.next();
  }

  signals(openClose: ModalOpenClose) {
    this.addObservable(HttpListener.event(), value => {
      if (this.enable) {
        if (value.type === 'start') {
          this.modalStarted++;
          if (this.modalStarted > 0) {
            openClose.open();
          }
        } else if (value.type === 'end') {
          this.modalStarted--;
          if (this.modalStarted === 0) {
            openClose.close();
          }
        }
      }
    });

    this.addObservable(HttpListenerImpl.enableWait(), value => {
      this.enable = value;
      if (!this.enable) {
        openClose.close();
        this.modalStarted = 0;
      }
    });
  }
}
