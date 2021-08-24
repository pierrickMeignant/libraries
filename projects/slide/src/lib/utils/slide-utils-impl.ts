import {BehaviorSubject, Observable} from "rxjs";
import {SlideEvent} from "../models/slide-event";
import {skip} from "rxjs/operators";
import {SlideColor} from "../types/slide-color";

export class SlideUtilsImpl {
  static handlePropertyBoolean(property: boolean | 'true' | 'false'): boolean {
    return typeof property === 'string' ? property === 'true' : property;
  }

  static slideEventEmitter = new BehaviorSubject<SlideEvent>({move: 'next', index: 0, item: {
    item: {}
    }});

  static slideEvent(): Observable<SlideEvent> {
    return SlideUtilsImpl.slideEventEmitter.pipe(skip(1));
  }

  static selectColor(color: 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
    | 'green' | 'red' | 'yellow' | string): SlideColor | undefined {
    switch (color) {
      case 'blue': return SlideColor.BLUE;
      case 'black': return SlideColor.BLACK;
      case 'darkBlue': return SlideColor.DARK_BLUE;
      case 'green': return SlideColor.GREEN;
      case 'red': return SlideColor.RED;
      case 'grey': return SlideColor.GREY;
      case 'white': return SlideColor.WHITE;
      case 'yellow': return SlideColor.YELLOW;
      default: return undefined;
    }
  }
}
