import {BehaviorSubject, Observable} from 'rxjs';
import {skip, take} from 'rxjs/operators';
import {ColorRGB} from './types/color-rgb';
import {Color} from './types/color';
import {Timeout} from './models/timeout/timeout';
import {TimeoutUnit} from './types/timeout-unit';

export function toObservable<T>(emitter:() =>  BehaviorSubject<T>): Observable<T> {
  return emitter().pipe(skip(1));
}

export function toLimitObservable<T>(emitter: () => BehaviorSubject<T>, limit: number = 1): Observable<T> {
  return emitter().pipe(skip(1), take(limit));
}

function putDefaultZero(number: number = 0): number {
  return number;
}

export function colorRGBToStyleRGB(colorRGB: ColorRGB): string {
  return `rgb(${putDefaultZero(colorRGB.red)}, ${putDefaultZero(colorRGB.green)}, ${putDefaultZero(colorRGB.blue)})`;
}

export function colorToStyle(color: ColorRGB | string): string {
  return typeof color === 'string' ? color : colorRGBToStyleRGB(color);
}

export function propertyColor(color: 'darkBlue' | 'blue' | 'grey' | 'black' | 'white'
  | 'green' | 'red' | 'yellow' | Color | ColorRGB | string): Color | ColorRGB | string {
  if (typeof color === 'string') {
    switch (color) {
      case 'blue': return Color.BLUE;
      case 'black': return Color.BLACK;
      case 'darkBlue': return Color.DARK_BLUE;
      case 'green': return Color.GREEN;
      case 'red': return Color.RED;
      case 'grey': return Color.GREY;
      case 'white': return Color.WHITE;
      case 'yellow': return Color.YELLOW;
      default: return color;
    }
  }
  return color;
}

export function isColor(color: Color | ColorRGB | string): boolean {
  return typeof color === 'number';
}

export function propertyToBoolean(property: boolean | 'true' | 'false'): boolean {
  return typeof property === 'string' ? property === 'true' : property;
}

export function isBoolean(property: boolean | undefined) {
  return property !== undefined;
}

export function timeoutToMillisecond(timeout: Timeout): number {
  return timeout.time * (timeout.unit ? timeout.unit : TimeoutUnit.SECOND);
}

export function propertyUnitToTimeoutUnit(unit: TimeoutUnit | 'second' | 'minute' | 'millisecond'): TimeoutUnit {
  return typeof unit === 'string' ? labelUnitToTimeoutUnit(unit) : unit;
}

export function labelUnitToTimeoutUnit(unit: 'second' | 'minute' | 'millisecond'): TimeoutUnit {
  switch (unit) {
    case 'millisecond': return TimeoutUnit.MILLISECOND;
    case 'minute': return TimeoutUnit.MINUTE;
    case 'second':
    default: return TimeoutUnit.SECOND;
  }
}

function isNumeric(number: string): boolean {
  const patternValidate = new RegExp("^[0-9]+$");
  return patternValidate.test(number);
}

export function propertyTimeToTimeout(time: Timeout | number | string | {time: number, unit?: TimeoutUnit | 'second' | 'millisecond' | 'minute'}): Timeout | undefined {
  const type = typeof time;
  let timeout: Timeout | undefined = undefined;
  if (type === 'string') {
    if (isNumeric(time as string)) {
      timeout = {
        time: Number(timeout)
      }
    }
  } else if (type === 'number') {
    timeout = {
      time: time as number
    }
  } else {
    const timeCasted = time as Timeout | {time: number, unit?: TimeoutUnit | 'seconds' | 'milliseconds' | 'minutes'};
    timeout = {
      time: timeCasted.time,
      unit: typeof timeCasted.unit === 'string' ?
        labelUnitToTimeoutUnit(timeCasted.unit as ('second' | 'millisecond' | 'minute'))
        : timeCasted.unit
    }
  }
  if (timeout && !timeout.unit) {
    timeout.unit = TimeoutUnit.SECOND;
  }
  return timeout;
}
