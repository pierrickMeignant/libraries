import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ModalController} from '../../models/modal-controller';
import {ModalContext} from '../../models/modal-context';
import {ModalListener} from '../../models/modal-listener';
import {BehaviorSubject} from 'rxjs';
import {ModalUtilsImpl} from '../../utils/modal-utils-impl';
import {ModalComponent} from '../modal/modal.component';
import {ModalType} from '../../models/modal-type';
import {ModalAction} from '../../models/modal-action';
import {ModalOpenClose} from '../../models/modal-open-close';
import {Destroyer, propertyToBoolean} from 'commonlibraries';

@Component({
             selector: 'modal-reducible',
             templateUrl: './modal-reducible.component.html',
             styleUrls: ['./modal-reducible.component.css']
           })
export class ModalReducibleComponent extends Destroyer implements OnInit, ModalController, AfterViewInit {
  @Input()
  body?: TemplateRef<any>;
  @Input()
  header?: TemplateRef<any>;
  @Input()
  headerReducible?: TemplateRef<any>;
  @Input()
  title?: string;

  @Output()
  signalOpen = new EventEmitter<(context?: ModalContext) => ModalListener | undefined>();
  @Output()
  signalClose = new EventEmitter<() => void>();
  @Output()
  signals = new EventEmitter<ModalOpenClose>();

  @Output()
  beforeOpen = new EventEmitter<() => BehaviorSubject<boolean>>();
  @Output()
  beforeClose = new EventEmitter<() => BehaviorSubject<boolean>>();
  @Output()
  afterOpen = new EventEmitter<void>();
  @Output()
  afterClose = new EventEmitter<void>();

  reduciblePlacement = 0;

  private activate = false;

  private numberReducing = 0;
  private reducible = false;
  private idReducible?: string;
  private modalContext: ModalContext = {
    disables: {},
    open: {},
    close: {
    }
  };
  @ViewChild('modal') private modal?: ModalComponent;


  constructor() {
    super();
  }

  ngOnInit(): void {
    ModalUtilsImpl.addEnableModal(() => this.idReducible, this);
    ModalUtilsImpl.prepareContextWithEmitters(() => this.modalContext, () => this.beforeOpen,
                                              () => this.afterOpen, () => this.beforeClose,
                                              () => new EventEmitter<void>());
    let after = () => {};
    if (this.afterClose.observers.length > 0) {
      after = () => this.afterClose.next();
    }
    this.setAfterClose(after);

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

    const open = (context?: ModalContext) => this.openWithListener(context);
    const close = () => this.close();
    this.signals.next({open,close});
    this.signalClose.next(close);
    this.signalOpen.next(open);
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
  set closeAction(close: ModalAction) {
    this.modalContext.close = close;
  }

  private setAfterClose(afterClose: () => void) {
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
    this.modalContext.disables!.body = propertyToBoolean(disable);
  }

  @Input()
  set footerDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.footer = propertyToBoolean(disable);
  }

  @Input()
  set decoratorDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.decorator = propertyToBoolean(disable);
  }

  @Input()
  set blackOverrideDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.blackOverride = propertyToBoolean(disable);
  }

  @Input()
  set centerDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.center = propertyToBoolean(disable);
  }

  @Input()
  set scrollableDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.scrollable = propertyToBoolean(disable);
  }

  @Input()
  set active(isActive: boolean | 'true' | 'false') {
    this.activate = propertyToBoolean(isActive);
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

  selectHeader(emptyHeader: TemplateRef<any>): TemplateRef<any> {
    return this.isReducible ? this.headerReducible! : this.header ? this.header : emptyHeader;
  }
}
