import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ShapeWait} from '../../models/shape-wait.enum';
import {ModalController} from '../../models/modal-controller';
import {ModalContext} from '../../models/modal-context';
import {ModalListener} from '../../models/modal-listener';
import {BehaviorSubject} from 'rxjs';
import {ModalUtilsImpl} from '../../utils/modal-utils-impl';
import {ModalComponent} from '../modal/modal.component';
import {ModalType} from '../../models/modal-type';
import {ModalAction} from '../../models/modal-action';
import {ModalOpenClose} from '../../models/modal-open-close';
import {Color, ColorRGB, colorToStyle, Destroyer, isColor, propertyColor, propertyToBoolean} from 'commonlibraries';

@Component({
  selector: 'modal-wait',
  templateUrl: './modal-wait.component.html',
  styleUrls: ['./modal-wait.component.css']
})
export class ModalWaitComponent extends Destroyer implements OnInit, ModalController, AfterViewInit {

  idWait?: string;
  @Input()
  bodyWAIT?: TemplateRef<any>;

  @Input()
  textWait?: string;

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

  private shapeWait: ShapeWait = ShapeWait.ROUND;
  private Color: Color | ColorRGB | string = Color.DARK_BLUE;
  private colorTextWait:  Color | ColorRGB | string = Color.DARK_BLUE;
  private modalContext: ModalContext = {
    disables: {},
    open:{},
    close: {}
  };

  @ViewChild('modalWait') private modal?: ModalComponent;

  readonly isReducible = false;

  private idWaitModal?: string;


  constructor() {
    super();
  }

  ngOnInit(): void {
    ModalUtilsImpl.addEnableModal(() => this.idWaitModal, this);
    ModalUtilsImpl.prepareContextWithEmitters(() => this.modalContext, () => this.beforeOpen,
                                              () => this.afterOpen, () => this.beforeClose,
                                              () => this.afterClose);
    const open = (context?: ModalContext) => this.openWithListener(context);
    const close = () => this.close();
    this.signals.next({open,close});
    this.signalClose.next(close);
    this.signalOpen.next(open);
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
  set colorModal(color: Color | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
  | 'green' | 'red' | 'yellow' | ColorRGB | string) {
    this.Color = propertyColor(color);
  }

  @Input('colorText')
  set colorTextModal(colorText: Color | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' | ColorRGB | string) {
    this.colorTextWait = propertyColor(colorText);
  }

  @Input()
  set openAction(open: ModalAction) {
    this.modalContext.open = open;
  }

  @Input()
  set closeAction(close: ModalAction) {
    this.modalContext.close = close;
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
  set active(isActive: boolean | 'true' | 'false') {
     if (propertyToBoolean(isActive)) {
       this.open();
     }
  }

  get shape(): ShapeWait {
    return this.shapeWait;
  }

  get color():  Color | ColorRGB | string {
    return this.Color;
  }

  get colorText():  Color | ColorRGB | string {
    return this.colorTextWait;
  }

  get isRound(): boolean {
    return this.shape === undefined || ShapeWait.ROUND === this.shape;
  }

  get isCircle(): boolean {
    return ShapeWait.CIRCLE === this.shape;
  }

  get isDarkBlue(): boolean {
    return Color.DARK_BLUE === this.color;
  }

  get isBlue(): boolean {
    return this.color === undefined || Color.BLUE === this.color;
  }

  get isBlack(): boolean {
    return Color.BLACK === this.color;
  }

  get isGreen(): boolean {
    return Color.GREEN === this.color;
  }

  get isGrey(): boolean {
    return Color.GREY === this.color;
  }

  get isRed(): boolean {
    return Color.RED === this.color;
  }

  get isWhite(): boolean {
    return Color.WHITE === this.color;
  }

  get isYellow(): boolean {
    return Color.YELLOW === this.color;
  }

  get isDarkBlueText(): boolean {
    return Color.DARK_BLUE === this.colorText;
  }

  get isBlueText(): boolean {
    return this.colorText === undefined || Color.BLUE === this.colorText;
  }

  get isBlackText(): boolean {
    return Color.BLACK === this.colorText;
  }

  get isGreenText(): boolean {
    return Color.GREEN === this.colorText;
  }

  get isGreyText(): boolean {
    return Color.GREY === this.colorText;
  }

  get isRedText(): boolean {
    return Color.RED === this.colorText;
  }

  get isWhiteText(): boolean {
    return Color.WHITE === this.colorText;
  }

  get isYellowText(): boolean {
    return Color.YELLOW === this.colorText;
  }

  get isEnable(): boolean {
    return !!this.modal?.isEnable;
  }

  close(): void {
    this.modal?.close();
  }

  open(context?: ModalContext): void {
    this.modal?.open(context);
  }

  openWithListener(context?: ModalContext): ModalListener | undefined {
    return this.modal?.openWithListener(context);
  }

  isColor(color: Color | ColorRGB | string): boolean {
    return isColor(color);
  }

  toRGB(color: Color | ColorRGB | string): string {
    return colorToStyle(color as (ColorRGB | string));
  }
}
