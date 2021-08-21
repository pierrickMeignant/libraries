import {AccordionItem} from '../models/accordion-item';

export interface AccordionEvent {
  isExpand: boolean;
  item: AccordionItem;
  revert: () => void;
  index: number;
  id?: string;
}
