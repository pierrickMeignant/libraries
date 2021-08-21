import {TemplateRef} from '@angular/core';

export interface AccordionItem {
  header: string;
  body?: TemplateRef<any>;
  text?: string;
  isExpand?: boolean;
}
