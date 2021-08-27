import {TimeoutUnit} from '../../types/timeout-unit';

export interface Timeout {
  time: number;
  unit?: TimeoutUnit;
}
