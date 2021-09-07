// noinspection JSSuspiciousNameCombination

import {Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {TooltipPosition} from '../../models/tooltip-position';

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent implements OnInit {

  position = TooltipPosition.TOP;
  isShow = false;

  top = '0px';
  left = '0px';

  @Output()
  open = new EventEmitter();
  @Output()
  close = new EventEmitter();

  @ViewChild('tooltip') private tooltip?: ElementRef<HTMLDivElement>;

  constructor() { }

  ngOnInit(): void {
  }

  @Input('position')
  set setPosition(position: TooltipPosition | 'top' | 'left' | 'right' | 'bottom') {
    if (typeof position === 'string') {
      switch (position) {
        case 'top': this.position = TooltipPosition.TOP; break;
        case 'left': this.position = TooltipPosition.LEFT; break;
        case 'right': this.position = TooltipPosition.RIGHT; break;
        case 'bottom': this.position = TooltipPosition.BOTTOM; break;
      }
    } else {
      this.position = position;
    }
  }

  @Input()
  set html(template: TemplateRef<any> | HTMLElement) {
    const html = template instanceof TemplateRef ? template.elementRef.nativeElement as HTMLElement : template;
    html.addEventListener('mouseover', () => {
      if (!this.isShow) {
        this.open.next();
      }
      this.isShow = true;
    });
    html.addEventListener('mouseleave', () => {
      if (this.isShow) {
        this.close.next();
      }
      this.isShow = false;
    });
    setTimeout(() => this.findPosition(html));
  }

  private findPosition(html: HTMLElement): void {
    let top = html.offsetTop;
    let left = html.offsetLeft;
    switch (this.position) {
      // @ts-ignored
      case TooltipPosition.BOTTOM: top += html.clientHeight + 3; left += (html.clientWidth / 2); break;
      // tslint:disable-next-line:no-switch-case-fall-through
      case TooltipPosition.TOP: top -= (this.tooltip!.nativeElement.clientHeight - 3); left += (html.clientWidth / 2); break;
      // @ts-ignored
      case TooltipPosition.RIGHT: left += html.clientWidth + this.tooltip!.nativeElement.clientWidth;
      // tslint:disable-next-line:no-switch-case-fall-through
      case TooltipPosition.LEFT: top += html.clientHeight / 2; left -= this.tooltip!.nativeElement.clientWidth;
    }
    this.top = `${top}px`;
    this.left = `${left}px`;
    const topValid = top > 0;
    const bottomValid = top + this.tooltip!.nativeElement.clientHeight < window.innerHeight;
    const leftValid = left > 0;
    const rightValid = left + this.tooltip!.nativeElement.clientWidth < window.innerWidth;
    switch (this.position) {
      case TooltipPosition.TOP: {
        this.checkPosition(html, topValid, leftValid, rightValid, bottomValid,
          TooltipPosition.TOP, TooltipPosition.LEFT, TooltipPosition.RIGHT, TooltipPosition.BOTTOM);
        break;
      }
      case TooltipPosition.LEFT: {
        this.checkPosition(html, leftValid, topValid, rightValid, bottomValid,
          TooltipPosition.LEFT, TooltipPosition.TOP, TooltipPosition.RIGHT, TooltipPosition.BOTTOM);
        break;
      }
      case TooltipPosition.RIGHT: {
        this.checkPosition(html, rightValid, topValid, leftValid, bottomValid,
          TooltipPosition.RIGHT, TooltipPosition.TOP, TooltipPosition.LEFT, TooltipPosition.BOTTOM);
        break;
      }
      case TooltipPosition.BOTTOM: {
        this.checkPosition(html, bottomValid, topValid, leftValid, rightValid,
          TooltipPosition.BOTTOM, TooltipPosition.TOP, TooltipPosition.LEFT, TooltipPosition.RIGHT);
        break;
      }
    }
  }

  private checkPosition(html: HTMLElement, topValid: boolean, leftValid: boolean,
                        rightValid: boolean, bottomValid: boolean, ...checks: TooltipPosition[]): void {
    if (this.position === checks[0] && !topValid) {
      if (rightValid) {
        this.position = checks[1];
      } else if (leftValid) {
        this.position = checks[2];
      } else if (bottomValid) {
        this.position = checks[3];
      }
      if (this.position !== checks[0]) {
        this.findPosition(html);
      } else {
        html.removeEventListener('mouseover', () => {});
        html.removeEventListener('mouseleave', () => {});
      }
    }
  }
}


