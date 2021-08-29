import {SlideItem} from './item/slide-item';
import {TemplateRef} from '@angular/core';
import {Color, ColorRGB, Timeout} from 'commonlibraries';

export interface SlideContext {
  fade?: boolean;
  items: SlideItem[];
  itemViewer?: TemplateRef<any>;
  captionViewer?: TemplateRef<any>;
  controlArrow?: boolean;
  controlArrowPrev?: boolean;
  controlArrowNext?: boolean;
  indicators?: boolean;
  directIndicators?: boolean;
  active?: number;
  vertical?: boolean;
  timeout?: Timeout;
  autoSwitch?: boolean;
  circle?: boolean;
  colorArrow?: Color | ColorRGB | string;
  colorArrowNext?: Color | ColorRGB | string;
  colorArrowPrev?: Color | ColorRGB | string;
  colorIndicators?: Color | ColorRGB | string;
}
