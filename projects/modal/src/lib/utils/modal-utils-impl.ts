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

  private static toObservable(emitter: () => BehaviorSubject<any>): Observable<any> {
    return emitter().pipe(skip(1));
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
}
