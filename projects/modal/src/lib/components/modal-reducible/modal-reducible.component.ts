import {AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ModalController} from '../../models/modal-controller';
import {ModalContext} from '../../models/modal-context';
import {ModalListener} from '../../models/modal-listener';
import {Observable} from 'rxjs';
import {ModalUtilsImpl} from '../../utils/modal-utils-impl';
import {ModalComponent} from '../modal/modal.component';
import {ModalType} from '../../models/modal-type';
import {ModalAction} from '../../models/modal-action';
import {SubscriptionDestroyer} from 'subscription-destroyer';

@Component({
             selector: 'modal-reducible',
             templateUrl: './modal-reducible.component.html',
             styleUrls: ['./modal-reducible.component.css']
           })
export class ModalReducibleComponent extends SubscriptionDestroyer implements OnInit, ModalController, AfterViewInit {
  @Input()
  body?: TemplateRef<any>;
  @Input()
  header?: TemplateRef<any>;
  @Input()
  headerReducible?: TemplateRef<any>;
  reduciblePlacement = 0;

  private activate = false;

  private numberReducing = 0;
  private reducible = false;
  private idReducible?: string;
  private modalContext: ModalContext = {disables: {},
  open: {},
  close: {
    after: () => {
      let reducing: boolean | undefined = undefined;
      let placement = this.reduciblePlacement;
      if (this.reducible) {
        reducing = false;
        this.reducible = false;
        this.reduciblePlacement--;
      }
      ModalUtilsImpl.reduceEvent.next({reducing, placement});
    }
  }};
  @ViewChild('modal') private modal?: ModalComponent;


  constructor() {
    super();
  }

  ngOnInit(): void {
    ModalUtilsImpl.addEnableModal(() => this.idReducible, this);

    this.addObservable(ModalUtilsImpl.reducing(),isReduce => {
      if (isReduce.reducing !== undefined) {
        let removeOrAddReducible = 1;
        if (!isReduce.reducing) {
          removeOrAddReducible = -1;
          if (this.reduciblePlacement > isReduce.placement) {
            this.reduciblePlacement--;
          }
        }
        this.numberReducing += removeOrAddReducible;
      }
    });
  }

  ngAfterViewInit(): void {
    this.modal!.typeModal = ModalType.REDUCIBLE;
    setTimeout(() => this.modal!.context = this.modalContext);
  }

  @Input()
  set id(id: string) {
    this.idReducible = id;
    this.modalContext.id = id + '_reducible';
  }

  @Input()
  set openAction(open: ModalAction) {
    this.modalContext.open = open;
  }

  @Input()
  set beforeOpen(beforeOpen: () => (boolean | Observable<boolean>)) {
    this.modalContext.open!.before = () => beforeOpen();
  }

  @Input()
  set afterOpen(afterOpen: () => void) {
    this.modalContext.open!.after = () => afterOpen();
  }

  @Input()
  set closeAction(close: ModalAction) {
    this.modalContext.close = close;
  }

  @Input()
  set beforeClose(beforeClose: () => (boolean | Observable<boolean>)) {
    this.modalContext.close!.before = () => beforeClose();
  }

  @Input()
  set afterClose(afterClose: () => void) {
    this.modalContext.close!.after = () => {
      let reducing: boolean | undefined = undefined;
      let placement = this.reduciblePlacement;
      if (this.reducible) {
        reducing = false;
        this.reducible = false;
        this.reduciblePlacement--;
      }
      ModalUtilsImpl.reduceEvent.next({reducing, placement});
      afterClose();
    }
  }

  @Input()
  set bodyDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.body = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set footerDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.footer = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set decoratorDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.decorator = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set blackOverrideDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.blackOverride = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set centerDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.center = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set scrollableDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.scrollable = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set active(isActive: boolean | 'true' | 'false') {
    this.activate = ModalUtilsImpl.handlePropertyBoolean(isActive);
  }

  get isActivate(): boolean {
    return this.activate;
  }

  close(): void {
    this.modal?.close();
  }

  open(context?: ModalContext): void {
    this.modal?.open(context);
  }

  /**
   * open modal with listener and check could open
   * @param context context to session
   */
  openWithListener(context?: ModalContext): ModalListener | undefined {
    if (!this.header || !this.headerReducible) {
      let message = 'miss template.s: [ ' + (!this.headerReducible ? 'headerReducible, ' : '') + (!this.header ? 'header' : '');
      if (message.endsWith(', ')) {
        message = message.slice(0, message.length - 2);
      }
      message += ']';
      ModalUtilsImpl.beforeOpenEvent.next({id: this.idReducible, accept: false, message, type: ModalType.REDUCIBLE });
      return undefined;
    }
    return this.modal?.openWithListener(context);
  }

  get isEnable(): boolean {
    return !!this.modal?.isEnable;
  }

  get isReducible(): boolean {
    return this.reducible;
  }

  /**
   * reduce or higher modal
   */
  reduceOpen(): void {
    this.reducible = !this.reducible;
    if (this.reducible) {
      this.reduciblePlacement = this.numberReducing + 1;
    }
    ModalUtilsImpl.reduceEvent.next({reducing: this.reducible, placement: this.reduciblePlacement});
  }

  selectHeader(): TemplateRef<any> {
    return this.isReducible ? this.headerReducible! : this.header!;
  }
}
