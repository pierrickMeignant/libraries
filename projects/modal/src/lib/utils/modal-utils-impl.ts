import {BehaviorSubject, Observable} from 'rxjs';
import {ModalListener} from '../models/modal-listener';
import {skip} from 'rxjs/operators';
import {ModalEvent} from '../models/modal-event';
import {ModalController} from '../models/modal-controller';
import {ModalType} from '../models/modal-type';
import {ModalTimeoutUnit} from '../models/modal-timeout-unit';
import {ColorWait} from '../models/color-wait.enum';
import {ModalEnableRequest} from '../models/modal-enable-request';
import {SubscriptionDestroyer} from 'subscription-destroyer';
import {ModalContext} from '../models/modal-context';
import {EventEmitter} from '@angular/core';
import {ModalAction} from '../models/modal-action';
import {ModalDisable} from '../models/modal-disable';

export class ModalUtilsImpl {
  static modalEmitter = new BehaviorSubject<ModalEnableRequest>({receiptListener: () => ModalUtilsImpl.prepareListener()});
  static beforeOpenEvent = new BehaviorSubject<ModalEvent>({accept: false, type: ModalType.MODAL});
  static afterOpenEvent = new BehaviorSubject<ModalEvent>({accept: false, type: ModalType.MODAL});
  static beforeCloseEvent = new BehaviorSubject<ModalEvent>({accept: false, type: ModalType.MODAL});
  static afterCloseEvent = new BehaviorSubject<ModalEvent>({accept: false, type: ModalType.MODAL});
  static reduceEvent = new BehaviorSubject<{reducing?: boolean, placement: number}>({placement: 1});

  static modalEnable(): Observable<ModalEnableRequest> {
    return ModalUtilsImpl.toObservable(() => ModalUtilsImpl.modalEmitter);
  }

  static beforeOpen(): Observable<ModalEvent> {
    return ModalUtilsImpl.toObservable(() => ModalUtilsImpl.beforeOpenEvent);
  }

  static afterOpen(): Observable<ModalEvent> {
    return ModalUtilsImpl.toObservable(() => ModalUtilsImpl.afterOpenEvent);
  }

  static beforeClose(): Observable<ModalEvent> {
    return ModalUtilsImpl.toObservable(() => ModalUtilsImpl.beforeCloseEvent);
  }

  static afterClose(): Observable<ModalEvent> {
    return ModalUtilsImpl.toObservable(() => ModalUtilsImpl.afterCloseEvent);
  }

  static reducing(): Observable<{reducing?: boolean, placement: number}> {
    return ModalUtilsImpl.toObservable(() => ModalUtilsImpl.reduceEvent);
  }

  static prepareListener(): BehaviorSubject<ModalListener | undefined> {
    return new BehaviorSubject<ModalListener | undefined>(undefined);
  }

  /**
   * enable modal by id
   * @param id id filter
   * @param modalController controller enable or disable
   */
  static addEnableModal(id: () => string | undefined, modalController: ModalController | SubscriptionDestroyer): void {
    const controller = modalController as ModalController;
    (modalController as SubscriptionDestroyer).addObservable(ModalUtilsImpl.modalEnable(), value => {
      if (value.id === id()) {
        if (value.isOpen) {
          setTimeout(() => value.receiptListener().next(controller.openWithListener(value.context)));
        } else {
          controller.close();
        }
      }
    })
  }

  static handlePropertyBoolean(property: boolean | 'true' | 'false'): boolean {
    return typeof property === 'string' ? property === 'true' : property;
  }

  static transformStringToTimeoutUnit(unit: 'second' | 'millisecond' | 'minute'): ModalTimeoutUnit {
    switch (unit) {
      case 'second': return ModalTimeoutUnit.SECOND;
      case 'minute': return ModalTimeoutUnit.MINUTE;
      case 'millisecond':
      default: return ModalTimeoutUnit.MILLISECOND;
    }
  }

  static selectColor(color: 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow'): ColorWait {
    switch (color) {
      case 'blue': return ColorWait.BLUE;
      case 'black': return ColorWait.BLACK;
      case 'darkBlue': return ColorWait.DARK_BLUE;
      case 'green': return ColorWait.GREEN;
      case 'red': return ColorWait.RED;
      case 'grey': return ColorWait.GREY;
      case 'white': return ColorWait.WHITE;
      case 'yellow': return ColorWait.YELLOW;
      default: return ColorWait.DARK_BLUE;
    }
  }

  /**
   * create current context in this session (merge default context with context establish to session)
   * @param context context created to session
   * @param defaultContext default context to modal
   */
  static prepareOpen(context: ModalContext | undefined, defaultContext: ModalContext): ModalContext {
    if (context) {
      const contextModal: ModalContext = {
        content: {},
        timeout: context.timeout
      };
      contextModal.content!.title = context.content?.title ? context.content.title : defaultContext.content?.title;
      contextModal.content!.buttonCloseName = context.content?.buttonCloseName ? context.content.buttonCloseName
                                                                               : defaultContext.content?.buttonCloseName;
      this.insertActions('open', context, () => contextModal, defaultContext);
      this.insertActions('close', context, () => contextModal, defaultContext);
      this.updateDisables(() => contextModal, context, defaultContext.disables!);
      return contextModal;
    }
    return defaultContext;
  }

  static updateDisables(contextModal: () => ModalContext, context: ModalContext, defaultDisables: ModalDisable): void {
    const disables = context.disables;
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

  static prepareContextWithEmitters(context: () => ModalContext, beforeOpen: () => EventEmitter<() => BehaviorSubject<boolean>>,
                                    afterOpen: () => EventEmitter<void>, beforeClose: () => EventEmitter<() => BehaviorSubject<boolean>>,
                                    afterClose: () => EventEmitter<void>):void {
    ModalUtilsImpl.prepareContextWithEmitter(action => {
      if (action) {
        context().open = action;
      }
      return context().open!;
    }, () => beforeOpen(), () => afterOpen());
    ModalUtilsImpl.prepareContextWithEmitter(action => {
      if (action) {
        context().close = action;
      }
      return context().close!;
    }, () => beforeClose(), () => afterClose());
  }

  private static insertActions(keyContext: 'open' | 'close', context: ModalContext, contextModal: () => ModalContext,
                               defaultContext: ModalContext): void {
    const actions = context[keyContext];
    if (actions) {
      contextModal()[keyContext] = {
        before: actions.before ? actions.before : defaultContext[keyContext]?.before,
        after: actions.after ? actions.after : defaultContext[keyContext]?.after
      };
    }
  }

  private static prepareContextWithEmitter(actions: (action?: ModalAction) => ModalAction,
                                   before: () => EventEmitter<() => BehaviorSubject<boolean>>,
                                   after: () => EventEmitter<void>): void {
    const action = actions();
    if (before().observers.length > 0) {
      action.before = () => {
        const observer = new BehaviorSubject<boolean>(false);
        setTimeout( () => before().next(() => observer),2);
        return ModalUtilsImpl.toObservable(() => observer);
      }
    }
    if (after().observers.length > 0) {
      action.after = () => {
        after().next();
      }
    }
    actions(action);
  }

  private static toObservable(emitter: () => BehaviorSubject<any>): Observable<any> {
    return emitter().pipe(skip(1));
  }
}
