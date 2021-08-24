import {TemplateRef} from "@angular/core";

export interface SlideItem {
  item: any;
  itemViewer?: TemplateRef<any>;
  caption?: any;
  captionViewer?: TemplateRef<any>;
  isActive?: boolean;
}
