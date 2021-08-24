import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef} from '@angular/core';
import {SlideUtilsImpl} from '../../utils/slide-utils-impl';
import {SlideItem} from '../../models/item/slide-item';
import {SlideItemTemplate} from '../../models/item/slide-item-template';
import {BehaviorSubject, Subscription} from 'rxjs';
import {skip, take} from 'rxjs/operators';
import {SlideTimeout} from '../../models/timeout/slide-timeout';
import {SlideTimeoutUnit} from '../../types/slide-timeout-unit';
import {SlideMove} from '../../types/slide-move';
import {SlideEvent} from '../../models/slide-event';
import {SlideContext} from '../../models/slide-context';
import {SlideColor} from '../../types/slide-color';
import {SlideColorRGB} from '../../types/slide-color-rgb';

@Component({
  selector: 'slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.css']
})
export class SlideComponent implements OnInit, OnDestroy {
  slideItems: SlideItemTemplate[] = [];
  @Output()
  slideEvent = new EventEmitter<SlideEvent>();
  @Output()
  slideMovecontroller = new EventEmitter<() => BehaviorSubject<SlideMove>>();

  get isFade(): boolean {
    return this.slideContext.fade!;
  }

  get isVertical(): boolean {
    return !!this.slideContext.vertical;
  }

  get enableIndicators(): boolean {
    return !!this.slideContext.indicators;
  }

  get indexActive(): number {
    return this.slideContext.active!;
  }

  get captionView(): TemplateRef<any> | undefined {
    return this.slideContext.captionViewer;
  }

  get itemView(): TemplateRef<any> | undefined {
    return this.slideContext.itemViewer;
  }

  get isControlArrowPrev(): boolean {
    return this.slideContext.controlArrowPrev!;
  }

  get isControlArrowNext(): boolean {
    return this.slideContext.controlArrowNext!;
  }

  get defaultColorArrowPrev(): SlideColor | SlideColorRGB | string {
    return this.slideContext.colorArrowPrev!;
  }

  get defaultColorArrowNext(): SlideColor | SlideColorRGB | string {
    return this.slideContext.colorArrowNext!;
  }

  get defaultColorIndicators(): SlideColor | SlideColorRGB | string {
    return this.slideContext.colorIndicators!;
  }

  get itemActive(): SlideItem {
    return this.item;
  }

  private slideContext: SlideContext = {
    items: [],
    fade: true,
    active: -1,
    autoSwitch: true,
    timeout: {timeout: 5, unit: SlideTimeoutUnit.SECONDS},
    circle: true,
    directIndicators: true,
    controlArrowNext: true,
    controlArrowPrev: true,
    colorArrowPrev: SlideColor.WHITE,
    colorArrowNext: SlideColor.WHITE,
    colorIndicators: SlideColor.WHITE
  }

  private maxIndex = -1;
  private slideIntervalSwitch?: any;
  private hasControlArrow = {
    next: true,
    prev: true
  };
  private firstTouch?: Touch;
  private slideMoveControllerEmitter = new BehaviorSubject<SlideMove>(SlideMove.NEXT);
  private listener?: Subscription;
  private item: SlideItem = {item: {}};


  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    if (this.slideContext.autoSwitch) {
      this.autoSlide();
    }
    if (!this.slideContext.circle) {
      this.closeCircle();
    }

    this.item = this.slideItems[this.slideContext.active!];

    this.listener = this.slideMoveControllerEmitter.pipe(skip(1)).subscribe(value => this.startSwitch(value));
    this.slideMovecontroller.next(() => this.slideMoveControllerEmitter);
  }

  ngOnDestroy(): void {
    if (this.slideIntervalSwitch) {
      clearInterval(this.slideIntervalSwitch);
    }
    this.listener?.unsubscribe();
    this.listener = undefined;
  }

  @Input()
  set context(context: SlideContext) {
    if (context.fade !== undefined){
      this.fade = context.fade;
    }
    if (context.timeout !== undefined) {
      this.timeout = context.timeout;
    }
    if (context.controlArrow !== undefined) {
      this.controlArrow = context.controlArrow;
    } else {
      if(context.controlArrowPrev !== undefined) {
        this.controlArrowPrev = context.controlArrowPrev;
      }
      if (context.controlArrowNext !== undefined) {
        this.controlArrowNext = context.controlArrowNext;
      }
    }

    if (context.circle !== undefined) {
      this.circle= context.circle;
    }
    if (context.autoSwitch !== undefined) {
      this.autoSwitch = context.autoSwitch;
    }
    if (context.active !== undefined) {
      this.active = context.active;
    }

    if (context.directIndicators !== undefined) {
      this.slideContext.directIndicators = context.directIndicators;
    }
    if (context.colorIndicators !== undefined) {
      this.slideContext.colorIndicators = context.colorIndicators;
    }
    if (context.colorArrow !== undefined) {
      this.colorArrow = context.colorArrow;
    } else {
      if (context.colorArrowPrev !== undefined) {
        this.colorArrowPrev = context.colorArrowPrev;
      }
      if (context.colorArrowNext !== undefined) {
        this.colorArrowNext = context.colorArrowNext;
      }
    }
    this.slideContext.captionViewer = context.captionViewer;
    this.slideContext.itemViewer = context.itemViewer;
    this.slideContext.indicators = context.indicators;
    this.slideContext.vertical = context.vertical;
    this.items = context.items;
  }

  @Input()
  set itemViewer(itemViewer: TemplateRef<any>) {
    this.slideContext.itemViewer = itemViewer;
  }

  @Input()
  set captionViewer(captionViewer: TemplateRef<any>) {
    this.slideContext.captionViewer = captionViewer;
  }

  @Input()
  set fade(fade: boolean | 'true' | 'false') {
    this.slideContext.fade = SlideUtilsImpl.handlePropertyBoolean(fade);
  }

  @Input()
  set controlArrow(controlArrow: boolean | 'true' | 'false') {
    const hasControlArrow = SlideUtilsImpl.handlePropertyBoolean(controlArrow);
    this.controlArrowNext = hasControlArrow;
    this.controlArrowPrev = hasControlArrow;
  }

  @Input()
  set controlArrowPrev(controlArrowPrev: boolean | 'true' | 'false') {
    this.slideContext.controlArrowPrev = SlideUtilsImpl.handlePropertyBoolean(controlArrowPrev);
    this.hasControlArrow.prev = this.slideContext.controlArrowPrev;
  }

  @Input()
  set controlArrowNext(controlArrowNext: boolean | 'true' | 'false') {
    this.slideContext.controlArrowNext = SlideUtilsImpl.handlePropertyBoolean(controlArrowNext);
    this.hasControlArrow.next = this.slideContext.controlArrowNext;
  }

  @Input()
  set indicators(indicators: boolean | 'true' | 'false') {
    this.slideContext.indicators = SlideUtilsImpl.handlePropertyBoolean(indicators);
  }

  @Input()
  set active(active: number) {
    this.slideContext.active = active - 1;
  }

  @Input()
  set items(items: SlideItem[] | {item: any, itemViewer?: TemplateRef<any>,
    caption?: any, captionViewer?: TemplateRef<any>, colorArrow?: SlideColor, colorIndicator?: SlideColor}[] | any[]) {
    const keys = Object.keys(items[0]);
    if (SlideComponent.hasKeys(keys, 'item', 'itemViewer', 'caption', 'captionViewer', 'colorArrow', 'colorIndicator')) {
      let indexActive = 0;
      items.forEach(value => {
        this.slideItems.push({
          item: value.item,
          caption: value.caption,
          itemViewer: value.itemViewer,
          captionViewer: value.captionViewer,
          colorArrow: value.colorArrow,
          colorIndicator: value.colorIndicator
        });
        this.maxIndex++;
        if (value.isActive && this.slideContext.active === -1) {
          this.slideContext.active = indexActive;
        }
        indexActive++;
      })
    } else {
      items.forEach(value => {
        this.slideItems.push(
          {item: value}
        );
        this.maxIndex++;
      });
    }
    if (this.slideContext.active === -1) {
      this.slideContext.active = 0;
    }
  }

  @Input()
  set timeout(seconds: SlideTimeout | {timeout: number, unit?: SlideTimeoutUnit | 'second' | 'millisecond' | 'minute'} | number) {
    if (typeof seconds === 'number') {
      this.slideContext.timeout = {timeout: seconds};
    } else {
      this.slideContext.timeout!.timeout = seconds.timeout;
      if (seconds.unit) {
        this.unit = seconds.unit;
      }
    }
    if (!this.slideContext.timeout!.unit) {
      this.slideContext.timeout!.unit = SlideTimeoutUnit.SECONDS;
    }
  }

  @Input()
  set unit(unit: SlideTimeoutUnit | 'second' | 'millisecond' | 'minute') {
    let slideTimeoutUnit: SlideTimeoutUnit;
    if (typeof unit === 'string') {
      switch (unit) {
        case "millisecond": slideTimeoutUnit = SlideTimeoutUnit.MILLISECONDS; break;
        case "minute": slideTimeoutUnit = SlideTimeoutUnit.MINUTES; break;
        case "second":
        default: slideTimeoutUnit = SlideTimeoutUnit.SECONDS;
      }
    } else {
      slideTimeoutUnit = unit;
    }
    this.slideContext.timeout!.unit = slideTimeoutUnit;
  }

  @Input()
  set autoSwitch(autoSwitchSlide: boolean | 'true' | 'false') {
    this.slideContext.autoSwitch = SlideUtilsImpl.handlePropertyBoolean(autoSwitchSlide);
  }

  @Input()
  set vertical(isVertical: boolean | 'true' | 'false') {
    this.slideContext.vertical = SlideUtilsImpl.handlePropertyBoolean(isVertical);
  }

  @Input()
  set circle(isCircle: boolean | 'true' | 'false') {
    this.slideContext.circle = SlideUtilsImpl.handlePropertyBoolean(isCircle);
  }

  @Input()
  set directIndicators(isDirectIndicators: boolean | 'true' | 'false') {
    this.slideContext.directIndicators = SlideUtilsImpl.handlePropertyBoolean(isDirectIndicators);
  }

  @Input()
  set colorArrow(colorArrow: SlideColor | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' | SlideColorRGB | string) {
    this.colorArrowNext = colorArrow;
    this.colorArrowPrev = colorArrow;
  }

  @Input()
  set colorArrowPrev(colorArrow: SlideColor | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' | SlideColorRGB | string) {
    if (typeof colorArrow === 'string') {
      this.slideContext.colorArrowPrev = SlideUtilsImpl.selectColor(colorArrow);
      if (!this.slideContext.colorArrowPrev) {
        this.slideContext.colorArrowPrev = colorArrow;
      }
    } else {
      this.slideContext.colorArrowPrev = colorArrow;
    }
  }

  @Input()
  set colorArrowNext(colorArrow: SlideColor | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' | SlideColorRGB | string) {
    if (typeof colorArrow === 'string') {
      this.slideContext.colorArrowNext = SlideUtilsImpl.selectColor(colorArrow);
      if (!this.slideContext.colorArrowNext) {
        this.slideContext.colorArrowNext = colorArrow;
      }
    } else {
      this.slideContext.colorArrowNext = colorArrow;
    }
  }

  @Input()
  set colorIndicators(colorIndicators: SlideColor | 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' | SlideColorRGB | string) {
    if (typeof colorIndicators === 'string') {
      this.slideContext.colorIndicators = SlideUtilsImpl.selectColor(colorIndicators);
      if (!this.slideContext.colorIndicators) {
        this.slideContext.colorIndicators = colorIndicators;
      }
    } else {
      this.slideContext.colorIndicators = colorIndicators;
    }
  }

  switchSlide(switcher: SlideMove): void {
    this.startSwitch(switcher).finally();
  }

  insertTemplateOnItem(item: SlideItemTemplate, itemTemplate: HTMLDivElement): boolean {
    item.template = itemTemplate;
    return true;
  }

  switchSlideInto(index: number): void {
    if (this.slideContext.directIndicators) {
      this.prepareAndSwitchItem(index).finally();
    } else {
      let switcher = SlideMove.PREVIOUS;
      if (this.isNext(index)) {
        switcher = SlideMove.NEXT;
      }
      this.switchSlideByIndex(index, switcher);
    }
  }

  carouselMouseEnter(): void {
    if (this.slideContext.autoSwitch) {
      clearInterval(this.slideIntervalSwitch);
    }
  }

  carouselMouseLeave(): void {
    if (this.slideContext.autoSwitch) {
      this.autoSlide();
    }
  }

  androidEventMove(touchEvent: TouchEvent, isStart: boolean): void {
    const touch = touchEvent.touches.item(0)!;
    if (isStart) {
      this.firstTouch = touch;
    } else {
      this.switchSlideByAndroid(touch);
    }
  }

  isDarkBlue(color: SlideColor): boolean {
    return color === SlideColor.DARK_BLUE;
  }

  isGrey(color: SlideColor): boolean {
    return color === SlideColor.GREY;
  }

  isGreen(color: SlideColor): boolean {
    return color === SlideColor.GREEN;
  }

  isRed(color: SlideColor): boolean {
    return color === SlideColor.RED;
  }

  isYellow(color: SlideColor): boolean {
    return color === SlideColor.YELLOW;
  }

  isBlue(color: SlideColor): boolean {
    return color === SlideColor.BLUE;
  }

  isWhite(color: SlideColor): boolean {
    return color === SlideColor.WHITE;
  }

  isBlack(color: SlideColor): boolean {
    return color === SlideColor.BLACK;
  }

  isColor(color: SlideColor | SlideColorRGB | string): boolean {
    return typeof color === 'number';
  }

  toRGB(colorRGB: SlideColorRGB | string): string {
    if (typeof colorRGB === 'string') {
      return colorRGB;
    }
    return `rgb(${colorRGB.red}, ${colorRGB.green}, ${colorRGB.blue})`;
  }

  private startSwitch(switcher: SlideMove): Promise<void> {
    if (this.slideContext.active === -1) {
      this.slideContext.active = 0;
    }
    let nextActive = this.slideContext.active! + switcher;
    if (nextActive === -1) {
      nextActive = this.maxIndex;
    } else if (nextActive > this.maxIndex) {
      nextActive = 0;
    }
    return this.prepareAndSwitchItem(nextActive, switcher);
  }

  private prepareAndSwitchItem(indexTarget: number, switcher?: SlideMove) {
    const itemStart = this.slideItems[this.slideContext.active!];
    const itemEnd = this.slideItems[indexTarget];
    let isNext = switcher === SlideMove.NEXT;
    if (!switcher) {
      isNext = this.isNext(indexTarget);
    }
    const event: SlideEvent = {item: itemEnd, index: indexTarget,
      move: isNext ? 'next' : 'previous'};
    SlideUtilsImpl.slideEventEmitter.next(event);
    this.slideEvent.next(event);
    let classTransition = 'carousel-item-prev';
    let classStarter = 'carousel-item-end';
    if(isNext) {
      classTransition = 'carousel-item-next';
      classStarter = 'carousel-item-start';
    }
    return this.switchItemActive(itemStart.template!, itemEnd.template!, classTransition, classStarter, indexTarget);
  }

  private switchItemActive(itemStart: HTMLDivElement, itemEnd: HTMLDivElement, classTransition: string,
                           classStarter: string, nextActive: number): Promise<void> {
    const translationFinish = new BehaviorSubject<void>(undefined);
    this.renderer.addClass(itemEnd, classTransition);
    this.renderer.addClass(itemEnd, 'active');
    setTimeout(() => this.renderer.removeClass(itemEnd, classTransition));
    this.renderer.addClass(itemStart, classStarter);
    this.renderer.addClass(itemStart, classTransition);
    setTimeout(() => {
      this.renderer.removeClass(itemStart, classStarter);
      this.renderer.removeClass(itemStart, classTransition);
      this.renderer.removeClass(itemStart, 'active');
      this.slideContext.active = nextActive;
      this.item = this.slideItems[nextActive];
      if (!this.slideContext.circle) {
        this.closeCircle();
      }
      setTimeout(() => translationFinish.next(), 700);
    }, 600);
    return translationFinish.pipe(skip(1), take(1)).toPromise();
  }

  private closeCircle(): void {
    if (this.slideContext.active === 0 && this.slideContext.controlArrowPrev) {
      this.slideContext.controlArrowPrev = false;
      if (this.hasControlArrow.next) {
        this.slideContext.controlArrowNext = true;
      }
    } else if (this.slideContext.active === this.maxIndex && this.slideContext.controlArrowNext) {
      this.slideContext.controlArrowNext = false;
      if (this.hasControlArrow.prev) {
        this.slideContext.controlArrowPrev = true;
      }
    } else {
      if (this.hasControlArrow.prev) {
        this.slideContext.controlArrowPrev = true;
      }
      if (this.hasControlArrow.next) {
        this.slideContext.controlArrowNext = true;
      }
    }
  }

  private switchSlideByIndex(index: number, switcher: SlideMove): void {
    if (index !== this.slideContext.active) {
      this.startSwitch(switcher).then(() => this.switchSlideByIndex(index, switcher));
    }
  }

  private isNext(index: number): boolean {
    if (!this.slideContext.circle) {
      return index > this.slideContext.active!;
    }
    let indexIsMoreThanActive = index - this.slideContext.active!;
    if (indexIsMoreThanActive > 0) {
      const circleDifferential = (this.maxIndex + 1) - index + this.slideContext.active!;
      return circleDifferential >= indexIsMoreThanActive;
    } else {
      const circleDifferential = this.maxIndex - this.slideContext.active! + index;
      return circleDifferential < (indexIsMoreThanActive * -1);
    }
  }

  private autoSlide(): void {
    let timeout = this.slideContext.timeout!.timeout * (this.slideContext.timeout!.unit === SlideTimeoutUnit.SECONDS
      ? 1000
      : this.slideContext.timeout!.unit === SlideTimeoutUnit.MINUTES ? 60000 : 1);
    if (timeout < 600) {
      timeout = 1400;
    }
    this.slideIntervalSwitch = setInterval(() => {
      this.startSwitch(SlideMove.NEXT).finally();
    }, timeout);
  }

  private switchSlideByAndroid(secondTouch: Touch): void {
    let compare = 0;
    if (this.firstTouch) {
      if (this.slideContext.vertical) {
        compare = this.firstTouch.pageY - secondTouch.pageY;
      } else {
        compare = this.firstTouch!.pageX - secondTouch.pageX;
      }
    }

    if (compare > 2 && (this.slideContext.circle || this.slideContext.active !== this.maxIndex)) {
      this.startSwitch(SlideMove.NEXT).finally();
    } else if (compare < -2 && (this.slideContext.circle || this.slideContext.active! > 0)) {
      this.startSwitch(SlideMove.PREVIOUS).finally();
    }
    this.firstTouch = undefined;
  }

  private static hasKeys(keys: string[], ...key: string[]): boolean {
    let hasKey = true;
    let maxKey = key.length;

    while (hasKey && maxKey-- > 0) {
      hasKey = keys.indexOf(key[maxKey]) > -1;
    }
    return hasKey;
  }
}
