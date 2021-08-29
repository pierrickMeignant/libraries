import {BehaviorSubject, Observable} from 'rxjs';
import {ModalListener} from '../models/modal-listener';
import {ModalContext} from '../models/modal-context';
import {ModalUtilsImpl} from './modal-utils-impl';
import {skip, take} from 'rxjs/operators';
import {ModalEvent} from '../models/modal-event';
import {ModalEnableRequest} from '../models/modal-enable-request';
import {TimeoutUnit} from 'commonlibraries';

export class ModalUtils {
  /**
   * open modal by id or open all modal without id if not id
   * @param context context temporary to open modal
   * @param id id filter
   * @param timeout timeout suggest open modal
   * @param unit unit timeout default: millisecond
   */
  static openModal(context?: ModalContext, id?: string, timeout?: number,
                   unit?: TimeoutUnit): Promise<ModalListener | undefined> {
    return ModalUtils.open(ModalUtilsImpl.modalEmitter, context, id, timeout, unit);
  }

  static closeModal(id?: string): void {
    ModalUtilsImpl.modalEmitter.next({id, receiptListener: () => ModalUtilsImpl.prepareListener(), isOpen: false});
  }

  private static open(emitter: BehaviorSubject<ModalEnableRequest>,
                      context?: ModalContext, id?: string,
                      timeout?: number, unit?: TimeoutUnit,
                      ): Promise<ModalListener | undefined> {
    const copyContext = this.prepareContext(context, timeout, unit);
    const idTarget = context?.id ? context.id : id

    const listener = ModalUtilsImpl.prepareListener();
    emitter.next({id: idTarget, context: copyContext, receiptListener: () => listener, isOpen: true});
    return listener.pipe(skip(1), take(1)).toPromise();
  }

  static beforeOpen(): Observable<ModalEvent> {
    return ModalUtilsImpl.beforeOpen();
  }

  static afterOpen(): Observable<ModalEvent> {
    return ModalUtilsImpl.afterOpen();
  }

  static beforeClose(): Observable<ModalEvent> {
    return ModalUtilsImpl.beforeClose();
  }

  static afterClose(): Observable<ModalEvent> {
    return ModalUtilsImpl.afterClose();
  }

  private static prepareContext(context: ModalContext | undefined, timeout: number | undefined,
                                unit: TimeoutUnit | undefined): ModalContext | undefined {
    let copyContext: ModalContext | undefined = undefined;
    if (context) {
      copyContext = {
        timeout: context!.timeout ? context.timeout : {
          time: timeout ? timeout : 5,
          unit: unit
        },
        open: context?.open,
        content: context?.content,
        close: context?.close,
        disables: context?.disables
      };
    } else if (timeout){
      copyContext = {
        timeout: {
          time: timeout,
          unit
        }
      }
    }
    return copyContext;
  }
}
