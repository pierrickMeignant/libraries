import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef} from '@angular/core';
import {SlideUtilsImpl} from "../../utils/slide-utils-impl";
import {SlideItem} from "../../models/item/slide-item";
import {SlideItemTemplate} from "../../models/item/slide-item-template";
import {BehaviorSubject} from "rxjs";
import {skip, take} from "rxjs/operators";
import {SlideTimeout} from "../../models/timeout/slide-timeout";
import {SlideTimeoutUnit} from "../../types/slide-timeout-unit";
import {SlideMove} from "../../types/slide-move";
import {SlideEvent} from "../../models/slide-event";

@Component({
  selector: 'slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.css']
})
export class SlideComponent implements OnInit, OnDestroy {
  isFade = true;
  slideItems: SlideItemTemplate[] = [];
  @Input()
  itemViewer?: TemplateRef<any>;
  @Input()
  captionViewer?: TemplateRef<any>;
  @Output()
  slideEvent = new EventEmitter<SlideEvent>();

  hasControlArrowPrev = true;
  hasControlArrowNext = true;
  hasIndicator = false;
  indexActive = -1;
  isVertical = false;

  private slideTimeout: SlideTimeout = {timeout: 5, unit: SlideTimeoutUnit.SECONDS};
  private autoSwitchSlideActive = true;
  private maxIndex = -1;
  private slideIntervalSwitch?: any;
  private isCircle = true;
  private hasControlArrow = {
    next: true,
    prev: true
  };
  private firstTouch?: Touch;


  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    if (this.autoSwitchSlideActive) {
      this.autoSlide();
    }
    if (!this.isCircle) {
      this.closeCircle();
    }
  }

  ngOnDestroy(): void {
    if (this.slideIntervalSwitch) {
      clearInterval(this.slideIntervalSwitch);
    }
  }

  @Input()
  set fade(fade: boolean | 'true' | 'false') {
    this.isFade = SlideUtilsImpl.handlePropertyBoolean(fade);
  }

  @Input()
  set controlArrow(controlArrow: boolean | 'true' | 'false') {
    const hasControlArrow = SlideUtilsImpl.handlePropertyBoolean(controlArrow);
    this.controlArrowNext = hasControlArrow;
    this.controlArrowPrev = hasControlArrow;
  }

  @Input()
  set controlArrowPrev(controlArrowPrev: boolean | 'true' | 'false') {
    this.hasControlArrowPrev = SlideUtilsImpl.handlePropertyBoolean(controlArrowPrev);
    this.hasControlArrow.prev = this.hasControlArrowPrev;
  }

  @Input()
  set controlArrowNext(controlArrowNext: boolean | 'true' | 'false') {
    this.hasControlArrowNext = SlideUtilsImpl.handlePropertyBoolean(controlArrowNext);
    this.hasControlArrow.next = this.hasControlArrowNext;
  }

  @Input()
  set indicators(indicators: boolean | 'true' | 'false') {
    this.hasIndicator = SlideUtilsImpl.handlePropertyBoolean(indicators);
  }

  @Input()
  active(active: number) {
    this.indexActive = active - 1;
  }

  @Input()
  set items(items: SlideItem[] | {item: any, itemViewer?: TemplateRef<any>,
    caption?: any, captionViewer?: TemplateRef<any>}[] | any[]) {
    const firstItem = items[0];
    if (firstItem.hasOwnProperty('item') && firstItem.hasOwnProperty('itemViewer') &&
      firstItem.hasOwnProperty('caption') && firstItem.hasOwnProperty('captionViewer')) {
      let indexActive = 0;
      items.forEach(value => {
        this.slideItems.push({
          item: value.item,
          caption: value.caption,
          itemViewer: value.itemViewer,
          captionViewer: value.captionViewer
        });
        this.maxIndex++;
        if (value.isActive && this.indexActive === -1) {
          this.indexActive = indexActive;
        }
        indexActive++;
      })
      if (this.indexActive === -1) {
        this.indexActive = 0;
      }
    } else {
      items.forEach(value => {
        this.slideItems.push(
          {item: value}
        );
        this.maxIndex++;
      });
      this.indexActive = 0;
    }
  }

  @Input()
  set timeout(seconds: SlideTimeout | {timeout: number, unit?: SlideTimeoutUnit | 'second' | 'millisecond' | 'minute'} | number) {
    if (typeof seconds === 'number') {
      this.slideTimeout = {timeout: seconds};
    } else {
      this.slideTimeout.timeout = seconds.timeout;
      if (seconds.unit) {
        this.unit = seconds.unit;
      }
    }
    if (!this.slideTimeout.unit) {
      this.slideTimeout.unit = SlideTimeoutUnit.SECONDS;
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
    this.slideTimeout.unit = slideTimeoutUnit;
  }

  @Input()
  set autoSwitchSlide(autoSwitchSlide: boolean | 'true' | 'false') {
    this.autoSwitchSlideActive = SlideUtilsImpl.handlePropertyBoolean(autoSwitchSlide);
  }

  @Input()
  set vertical(isVertical: boolean | 'true' | 'false') {
    this.isVertical = SlideUtilsImpl.handlePropertyBoolean(isVertical);
  }

  @Input()
  set circle(isCircle: boolean | 'true' | 'false') {
    this.isCircle = SlideUtilsImpl.handlePropertyBoolean(isCircle);
  }

  switchSlide(switcher: SlideMove): void {
    this.startSwitch(switcher).finally();
  }

  insertTemplateOnItem(item: SlideItemTemplate, itemTemplate: HTMLDivElement): boolean {
    item.template = itemTemplate;
    return true;
  }

  switchSlideInto(index: number): void {
    let switcher = SlideMove.PREVIOUS;
    if (this.isNext(index)) {
      switcher = SlideMove.NEXT;
    }
    this.switchSlideByIndex(index, switcher);
  }

  carouselMouseEnter(): void {
    if (this.autoSwitchSlideActive) {
      clearInterval(this.slideIntervalSwitch);
    }
  }

  carouselMouseLeave(): void {
    if (this.autoSwitchSlideActive) {
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

  private startSwitch(switcher: SlideMove): Promise<void> {
    if (this.indexActive === -1) {
      this.indexActive = 0;
    }
    const lastItemActive = this.slideItems![this.indexActive];
    let nextActive = this.indexActive + switcher;
    if (nextActive === -1) {
      nextActive = this.maxIndex;
    } else if (nextActive > this.maxIndex) {
      nextActive = 0;
    }
    const nextItemActive = this.slideItems![nextActive];
    const event: SlideEvent = {item: nextItemActive, index: nextActive,
      move: switcher === SlideMove.NEXT ? 'next' : 'previous'};
    SlideUtilsImpl.slideEventEmitter.next(event);
    this.slideEvent.next(event);
    let classTransition = 'carousel-item-next';
    let classStarter = 'carousel-item-start';
    if(switcher === SlideMove.PREVIOUS) {
      classTransition = 'carousel-item-prev';
      classStarter = 'carousel-item-end';
    }
    return this.switchItemActive(lastItemActive.template!, nextItemActive.template!,
      classTransition, classStarter, nextActive);
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
      this.indexActive = nextActive;
      if (!this.isCircle) {
        this.closeCircle();
      }
      setTimeout(() => translationFinish.next(), 700);
    }, 600);
    return translationFinish.pipe(skip(1), take(1)).toPromise();
  }

  private closeCircle(): void {
    if (this.indexActive === 0 && this.hasControlArrowPrev) {
      this.hasControlArrowPrev = false;
      if (this.hasControlArrow.next) {
        this.hasControlArrowNext = true;
      }
    } else if (this.indexActive === this.maxIndex && this.hasControlArrowNext) {
      this.hasControlArrowNext = false;
      if (this.hasControlArrow.prev) {
        this.hasControlArrowPrev = true;
      }
    } else {
      if (this.hasControlArrow.prev) {
        this.hasControlArrowPrev = true;
      }
      if (this.hasControlArrow.next) {
        this.hasControlArrowNext = true;
      }
    }
  }

  private switchSlideByIndex(index: number, switcher: SlideMove): void {
    if (index !== this.indexActive) {
      this.startSwitch(switcher).then(() => this.switchSlideByIndex(index, switcher));
    }
  }

  private isNext(index: number): boolean {
    let indexIsMoreThanActive = index - this.indexActive;
    if (indexIsMoreThanActive > 0) {
      const circleDifferential = (this.maxIndex + 1) - index + this.indexActive;
      return circleDifferential >= indexIsMoreThanActive;
    } else {
      const circleDifferential = this.maxIndex - this.indexActive + index;
      return circleDifferential < (indexIsMoreThanActive * -1);
    }
  }

  private autoSlide(): void {
    let timeout = this.slideTimeout.timeout * (this.slideTimeout.unit === SlideTimeoutUnit.SECONDS
      ? 1000
      : this.slideTimeout.unit === SlideTimeoutUnit.MINUTES ? 60000 : 1);
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
      if (this.isVertical) {
        compare = this.firstTouch.pageY - secondTouch.pageY;
      } else {
        compare = this.firstTouch!.pageX - secondTouch.pageX;
      }
    }

    if (compare > 2 && (this.isCircle || this.indexActive !== this.maxIndex)) {
      this.startSwitch(SlideMove.NEXT).finally();
    } else if (compare < -2 && (this.isCircle || this.indexActive > 0)) {
      this.startSwitch(SlideMove.PREVIOUS).finally();
    }
    this.firstTouch = undefined;
  }
}
