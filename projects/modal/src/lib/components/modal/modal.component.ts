import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {BehaviorSubject, isObservable, Observable} from 'rxjs';
import {skip, take} from 'rxjs/operators';
import {ModalController} from '../../models/modal-controller';
import {ModalContext} from '../../models/modal-context';
import {ModalType} from '../../models/modal-type';
import {ModalUtilsImpl} from '../../utils/modal-utils-impl';
import {ModalTimeout} from '../../models/modal-timeout';
import {ModalAction} from '../../models/modal-action';
import {ModalDisable} from '../../models/modal-disable';
import {ModalContent} from '../../models/modal-content';
import {ModalListener} from '../../models/modal-listener';
import {ModalTimeoutUnit} from '../../models/modal-timeout-unit';
import {SubscriptionDestroyer} from 'subscription-destroyer';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent extends SubscriptionDestroyer implements OnInit, AfterViewInit, ModalController {
  @Input()
  header?: TemplateRef<any>;
  @Input()
  body?: TemplateRef<any>;
  @Input()
  footer?: TemplateRef<any>;

  @Output()
  signalOpen = new EventEmitter<() => BehaviorSubject<ModalContext | undefined>>();
  @Output()
  signalClose = new EventEmitter<() => BehaviorSubject<boolean>>();

  closeBind: () => void = this.close.bind(this);
  readonly isReducible = false;

  private enable = false;
  private modalContext: ModalContext = {
    content: {
      buttonCloseName: 'Close'
    },
    open: {
      before: () => true
    },
    close: {
      before: () => true
    },
    disables: {
      body: false,
      footer: false,
      header: false,
      cross: false,
      button: false,
      decorator: false,
      background: false
    }
  };
  private openReceipt = new BehaviorSubject<ModalContext | undefined>(undefined);
  private closeReceipt = new BehaviorSubject(false);

  private currentContext: ModalContext = {};
  private patternIsNumeric = new RegExp("[0-9]+");
  private type = ModalType.MODAL;

  constructor() {
    super();
  }

  ngOnInit(): void {
  }


  ngAfterViewInit(): void {
    this.addSubscription(this.openReceipt.pipe(skip(1)).subscribe(value => this.open(value)));
    this.addSubscription(this.closeReceipt.subscribe(value => value ? this.close() : undefined));
    this.signalOpen.next(() => this.openReceipt);
    this.signalClose.next(() => this.closeReceipt);

    ModalUtilsImpl.addEnableModal(() => this.id, this);
  }

  @Input()
  set context(context: ModalContext) {
    this.modalContext.id = context.id;
    this.modalContext.content!.title = context.content?.title;

    if (context.disables) {
      this.updateDisables(() => this.modalContext, context);
    }
    const buttonCloseName = context.content?.buttonCloseName;
    if (buttonCloseName) {
      this.modalContext.content!.buttonCloseName = buttonCloseName;
    }
    if (context.open) {
      this.modalContext.open = context.open;
    }
    if (context.close) {
      this.modalContext.close = context.close;
    }
  }

  @Input()
  set timeout(timeout: number | string | ModalTimeout) {
    const typeTimeout = typeof timeout;
    if (!this.modalContext.timeout) {
      this.modalContext.timeout = {};
    }
    if (typeTimeout === 'string') {
      if (this.patternIsNumeric.test(timeout as string)) {
        this.modalContext.timeout = {
          timeout: Number(timeout)
        };
      }
    } else if (typeTimeout === 'object'){
      this.modalContext.timeout = timeout as ModalTimeout;

    } else {
      this.modalContext.timeout = {
        timeout: timeout as number
      };
    }
  }

  @Input()
  set timeoutUnit(unit: 'second' | 'minute' | 'millisecond' | ModalTimeoutUnit) {
    if (!this.modalContext.timeout) {
      this.modalContext.timeout = {};
    }
    this.modalContext.timeout.unit = typeof unit === 'string' ? ModalUtilsImpl.transformStringToTimeoutUnit(unit) : unit;
  }

  @Input()
  set id(id) {
    this.modalContext.id = id;
  }

  @Input()
  set content(content) {
    this.modalContext.content = content;
  }

  @Input()
  set title(title: string) {
    this.modalContext.content!.title = title;
  }

  @Input()
  set buttonCloseName(buttonCloseName: string) {
    this.modalContext.content!.buttonCloseName = buttonCloseName;
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
    this.modalContext.close!.after = () => afterClose();
  }

  @Input()
  set disables(disables) {
    this.modalContext.disables = disables;
  }

  @Input()
  set backgroundDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.background = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set buttonDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.button = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set crossDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.cross = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set headerDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.header = ModalUtilsImpl.handlePropertyBoolean(disable);
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
    this.enable = ModalUtilsImpl.handlePropertyBoolean(isActive);
  }

  set typeModal(type: ModalType) {
    this.type = type;
  }

  get id(): string | undefined {
    return this.modalContext.id;
  }

  get hasTimeout(): any  {
    return this.currentContext.timeout && this.currentContext.timeout.timeout
           && this.currentContext.timeout.timeout > 0;
  }

  get disables(): ModalDisable {
    return this.currentContext.disables!;
  }

  get isEnable(): boolean {
    return this.enable;
  }

  get content(): ModalContent {
    return this.currentContext.content!;
  }

  /**
   * enable modal
   * @param context context this session modal
   */
  open(context?: ModalContext): void {
    this.currentContext = this.modalContext;
    if (this.couldDoEnable(true)) {
      if (context) {
        this.prepareOpen(context);
      }
      this.activate('open');
    }

  }

  /**
   * enable modal and return listener this session
   * @param context context this session
   */
  openWithListener(context?: ModalContext): ModalListener | undefined {
    this.currentContext = this.modalContext;
    if (!this.couldDoEnable(true)) {
      return undefined;
    }
    if (context) {
      this.prepareOpen(context);
    }

    const beforeOpen = new BehaviorSubject<(() => BehaviorSubject<boolean>) | undefined>(undefined);
    const beforeClose = new BehaviorSubject<(() => BehaviorSubject<boolean>) | undefined>(undefined);
    const afterOpen = new BehaviorSubject<boolean>(false);
    const afterClose = new BehaviorSubject<boolean>(false);

    this.currentContext = {
      content: this.currentContext.content,
      open: this.actionListener('open', () => beforeOpen, () => afterOpen),
      close: this.actionListener('close', () => beforeClose, () => afterClose),
      disables: this.currentContext.disables,
      timeout: this.currentContext.timeout
    };
    setTimeout(() => this.activate('open'), 10);
    return {
      open: {
        before: () => beforeOpen.asObservable().pipe(skip(1), take(1)),
        after: () => afterOpen.asObservable().pipe(skip(1), take(1))
      },
      close: {
        before: () => beforeClose.asObservable().pipe(skip(1), take(1)),
        after: () => afterClose.asObservable().pipe(skip(1), take(1))
      }
    };
  }

  close(): void {
    if (!this.hasTimeout) {
      if (this.couldDoEnable(false)) {
        this.activate('close');
      }
    } else {
      ModalUtilsImpl.beforeCloseEvent.next({id: this.id, accept: false, message: 'this modal has timeout', type: this.type});
    }
  }

  /**
   * override before and after to call by listener
   * @param keyContext key access in context
   * @param before action when before
   * @param after action when after
   * @private
   */
  private actionListener(keyContext: 'open' | 'close',
                         before: () => BehaviorSubject<(() => BehaviorSubject<boolean>) | undefined>,
                         after: () => BehaviorSubject<boolean>): ModalAction {
    return {
      before: () => this.beforeListener(keyContext, before),
      after: () => this.afterListener(keyContext, after)
    };
  }

  /**
   * create new listener to receive could open or close, and destroy subscription when received
   * add could if listener subscribe before
   * @param keyContext key access in context
   * @param before action when before open or close
   * @private
   */
  private beforeListener(
    keyContext: 'open' | 'close',
    before: () => BehaviorSubject<(() => BehaviorSubject<boolean>) | undefined>): boolean | Observable<boolean> {
    const could = new BehaviorSubject(false);
    if (before().observers.length > 0) {
      before().next(() => could);
      return could.pipe(skip(1), take(1));
    }
    const beforeDefault = this.modalContext[keyContext]?.before;
    if (beforeDefault) {
      return beforeDefault();
    }
    return true;
  }

  private afterListener(keyContext: 'open' | 'close',
                        after: () => BehaviorSubject<boolean>): void {
    if (after().observers.length > 0) {
      after().next(true);
    } else {
      const afterDefault = this.modalContext[keyContext]?.after;
      if (afterDefault) {
        afterDefault();
      }
    }
  }

  /**
   * activate or disable modal
   * @param keyContext key access context to send before and after action
   * @private
   */
  private activate(keyContext: 'open' | 'close'): void {
    const before = this.currentContext[keyContext]?.before;
    if (before) {
      const result = before();
      if (isObservable(result)) {
        result.subscribe(value => {
          this.sendBeforeEvent(keyContext, value);
          if (value) {
            this.executeEnable(keyContext);
          }
        });
      } else {
        this.sendBeforeEvent(keyContext, result);
        if (result) {
          this.executeEnable(keyContext);
        }
      }
    } else {
      this.sendBeforeEvent(keyContext, true);
      this.executeEnable(keyContext);
    }
  }

  /**
   * final activate modal
   * @param keyContext key access context to execute before and after actions
   * @private
   */
  private executeEnable(keyContext: 'open' | 'close'): void {
    this.enable = keyContext === 'open';
    if (this.isEnable && this.hasTimeout) {
      setTimeout(() => this.activate('close'), this.timeoutExecute());
    }
    const after = this.currentContext[keyContext]?.after;
    if (after) {
      after();
    }
    (this.isEnable ? ModalUtilsImpl.afterOpenEvent : ModalUtilsImpl.afterCloseEvent)
      .next({id: this.id, accept: true, type: this.type});
    if (!this.isEnable) {
      this.currentContext = this.modalContext;
    }
  }

  /**
   * create current context in this session (merge default context with context establish to session)
   * @param context context created to session
   * @private
   */
  private prepareOpen(context: ModalContext | undefined): void {
    if (context) {
      const contextModal: ModalContext = {
        content: {},
        timeout: context.timeout
      };
      contextModal.content!.title = context.content?.title ? context.content.title : this.modalContext.content?.title;
      contextModal.content!.buttonCloseName = context.content?.buttonCloseName ? context.content.buttonCloseName
                                                                               : this.modalContext.content?.buttonCloseName;
      this.insertActions('open', context, () => contextModal);
      this.insertActions('close', context, () => contextModal);
      this.updateDisables(() => contextModal, context);
      this.currentContext = contextModal;
    }
  }

  private insertActions(keyContext: 'open' | 'close', context: ModalContext, contextModal: () => ModalContext): void {
    const actions = context[keyContext];
    if (actions) {
      contextModal()[keyContext] = {
        before: actions.before ? actions.before : this.modalContext[keyContext]?.before,
        after: actions.after ? actions.after : this.modalContext[keyContext]?.after
      };
    }
  }

  private updateDisables(contextModal: () => ModalContext, context: ModalContext): void {
    const disables = context.disables;
    const defaultDisables = this.modalContext.disables!;
    contextModal().disables = {
      blackOverride: disables?.blackOverride ? disables.blackOverride : defaultDisables.blackOverride,
      center: disables?.center ? disables.center : defaultDisables.center,
      scrollable: disables?.scrollable ? disables.scrollable : defaultDisables.scrollable,
      button: disables?.button ? disables.button : defaultDisables.button,
      background: disables?.background ? disables.background : defaultDisables.background,
      cross: disables?.cross ? disables.cross : defaultDisables.cross,
      header: disables?.header ? disables.header : defaultDisables.header,
      footer: disables?.footer ? disables.footer : defaultDisables.footer,
      body: disables?.body ? disables.body : defaultDisables.body,
      decorator: disables?.decorator ? disables.decorator : defaultDisables.decorator,
    };
  }

  private timeoutExecute(): number {
    let convertorToMillisecond = 1;
    switch (this.currentContext.timeout?.unit) {
      case ModalTimeoutUnit.SECOND: convertorToMillisecond = 1000; break;
      case ModalTimeoutUnit.MINUTE: convertorToMillisecond = 60000; break;
      case ModalTimeoutUnit.MILLISECOND: convertorToMillisecond = 1; break;
    }
    const timeout = this.currentContext.timeout!.timeout!;
    return timeout * convertorToMillisecond;
  }

  private sendBeforeEvent(keyContext: 'open' | 'close', value: boolean): void {
    (keyContext === 'open' ? ModalUtilsImpl.beforeOpenEvent : ModalUtilsImpl.beforeCloseEvent)
      .next({
              id: this.id,
              accept: value,
              type: this.type
            });
  }

  private couldDoEnable(isOpen: boolean): boolean {
    if (isOpen) {
      if (this.isEnable) {
        ModalUtilsImpl.beforeOpenEvent.next({id: this.id, accept: false, message: 'already open', type: this.type});
        return false;
      }
      return true;
    } else {
      if (!this.isEnable) {
        ModalUtilsImpl.beforeOpenEvent.next({id: this.id, accept: false, message: 'already close', type: this.type});
        return false;
      }
      return true;
    }
  }
}
