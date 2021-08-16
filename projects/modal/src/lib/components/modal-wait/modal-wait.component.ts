import {AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ShapeWait} from '../../models/shape-wait.enum';
import {ColorWait} from '../../models/color-wait.enum';
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
  selector: 'modal-wait',
  templateUrl: './modal-wait.component.html',
  styleUrls: ['./modal-wait.component.css']
})
export class ModalWaitComponent extends SubscriptionDestroyer implements OnInit, ModalController, AfterViewInit {

  idWait?: string;
  @Input()
  bodyWAIT?: TemplateRef<any>;

  @Input()
  textWait?: string;

  private shapeWait: ShapeWait = ShapeWait.ROUND;
  private colorWait: ColorWait = ColorWait.DARK_BLUE;
  private colorTextWait: ColorWait = ColorWait.DARK_BLUE;
  private modalContext: ModalContext = {
    disables: {}
  };

  @ViewChild('modalWait') private modal?: ModalComponent;

  readonly isReducible = false;

  private idWaitModal?: string;


  constructor() {
    super();
  }

  ngOnInit(): void {
    ModalUtilsImpl.addEnableModal(() => this.idWaitModal, this);
  }

  ngAfterViewInit(): void {
    this.modal!.typeModal = ModalType.WAIT;
    setTimeout(() => this.modal!.context = this.modalContext);
  }

  @Input()
  set id(id: string) {
    this.idWait = id + '_wait';
    this.idWaitModal = id;
  }

  @Input('shape')
  set shapeModal(shape: ShapeWait | 'round' | 'circle') {
    if (typeof shape === 'string') {
      this.shapeWait = shape === 'round' ? ShapeWait.ROUND : ShapeWait.CIRCLE;
    } else {
      this.shapeWait = shape;
    }
  }

  @Input('color')
  set colorModal(color: ColorWait | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
  | 'green' | 'red' | 'yellow') {
    if (typeof color === 'string') {
      this.colorWait = ModalUtilsImpl.selectColor(color);
    } else {
      this.colorWait = color;
    }
  }

  @Input('colorText')
  set colorTextModal(colorText: ColorWait | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow') {
    if (typeof colorText === 'string') {
      this.colorTextWait = ModalUtilsImpl.selectColor(colorText);
    } else {
      this.colorTextWait = colorText;
    }
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
  set blackOverrideDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.blackOverride = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set centerDisable(disable: boolean | 'true' | 'false') {
    this.modalContext.disables!.center = ModalUtilsImpl.handlePropertyBoolean(disable);
  }

  @Input()
  set active(isActive: boolean | 'true' | 'false') {
     if (ModalUtilsImpl.handlePropertyBoolean(isActive)) {
       this.open();
     }
  }

  get shape(): ShapeWait {
    return this.shapeWait;
  }

  get color(): ColorWait {
    return this.colorWait;
  }

  get colorText(): ColorWait {
    return this.colorTextWait;
  }

  get isRound(): boolean {
    return this.shape === undefined || ShapeWait.ROUND === this.shape;
  }

  get isCircle(): boolean {
    return ShapeWait.CIRCLE === this.shape;
  }

  get isDarkBlue(): boolean {
    return ColorWait.DARK_BLUE === this.color;
  }

  get isBlue(): boolean {
    return this.color === undefined || ColorWait.BLUE === this.color;
  }

  get isBlack(): boolean {
    return ColorWait.BLACK === this.color;
  }

  get isGreen(): boolean {
    return ColorWait.GREEN === this.color;
  }

  get isGrey(): boolean {
    return ColorWait.GREY === this.color;
  }

  get isRed(): boolean {
    return ColorWait.RED === this.color;
  }

  get isWhite(): boolean {
    return ColorWait.WHITE === this.color;
  }

  get isYellow(): boolean {
    return ColorWait.YELLOW === this.color;
  }

  get isDarkBlueText(): boolean {
    return ColorWait.DARK_BLUE === this.colorText;
  }

  get isBlueText(): boolean {
    return this.colorText === undefined || ColorWait.BLUE === this.colorText;
  }

  get isBlackText(): boolean {
    return ColorWait.BLACK === this.colorText;
  }

  get isGreenText(): boolean {
    return ColorWait.GREEN === this.colorText;
  }

  get isGreyText(): boolean {
    return ColorWait.GREY === this.colorText;
  }

  get isRedText(): boolean {
    return ColorWait.RED === this.colorText;
  }

  get isWhiteText(): boolean {
    return ColorWait.WHITE === this.colorText;
  }

  get isYellowText(): boolean {
    return ColorWait.YELLOW === this.colorText;
  }

  get isEnable(): boolean {
    return !!this.modal?.isEnable;
  }

  close(): void {
    this.modal?.close();
  }

  open(context?: ModalContext): void {
    this.modal?.open();
  }

  openWithListener(context?: ModalContext): ModalListener | undefined {
    return this.modal?.openWithListener();
  }
}
