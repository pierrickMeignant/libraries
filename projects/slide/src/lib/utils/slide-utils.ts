import {Observable} from "rxjs";
import {SlideEvent} from "../models/slide-event";
import {SlideUtilsImpl} from "./slide-utils-impl";

export class SlideUtils {
  static slideEvent(): Observable<SlideEvent> {
    return SlideUtilsImpl.slideEvent();
  }
}
