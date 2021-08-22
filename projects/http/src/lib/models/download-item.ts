import {Subscription} from 'rxjs';

export interface DownloadItem {
  file?: Blob;
  percent: number;
  subscription?: () => Subscription;
  isEnable: boolean;
  name: string;
}
