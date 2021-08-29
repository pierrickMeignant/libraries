import {HttpErrorResponse} from '@angular/common/http';

export interface HttpEvent<T> {
  endpoint: string;
  data?: T | HttpErrorResponse | boolean | number;
  type: 'percent' | 'data' | 'error' | 'start' | 'end';
}
