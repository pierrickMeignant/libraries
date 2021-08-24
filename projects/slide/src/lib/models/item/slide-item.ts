import {TemplateRef} from "@angular/core";
import {SlideColor} from "../../types/slide-color";
import {SlideColorRGB} from "../../types/slide-color-rgb";

export interface SlideItem {
  item: any;
  itemViewer?: TemplateRef<any>;
  caption?: any;
  captionViewer?: TemplateRef<any>;
  isActive?: boolean;
  colorIndicator?: SlideColor | SlideColorRGB | string;
  colorArrow?: SlideColor | SlideColorRGB | string;
  colorArrowPrev?: SlideColor | SlideColorRGB | string;
  colorArrowNext?: SlideColor | SlideColorRGB | string;
}
