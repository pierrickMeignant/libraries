import {TemplateRef} from '@angular/core';
import {Color, ColorRGB} from 'commonlibraries';

export interface SlideItem {
  item: any;
  itemViewer?: TemplateRef<any>;
  caption?: any;
  captionViewer?: TemplateRef<any>;
  isActive?: boolean;
  colorIndicator?: Color | ColorRGB | string;
  colorArrow?: Color | ColorRGB | string;
  colorArrowPrev?: Color | ColorRGB | string;
  colorArrowNext?: Color | ColorRGB | string;
}
