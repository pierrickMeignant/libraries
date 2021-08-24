import {SlideItem} from "./item/slide-item";

export interface SlideEvent {
  move: 'next' | 'previous';
  item: SlideItem;
  index: number;
}
