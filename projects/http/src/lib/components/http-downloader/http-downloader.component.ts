import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {SubscriptionDestroyer} from 'subscription-destroyer';
import {HttpListenerImpl} from '../../utils/http-listener-impl';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DownloadItem} from '../../models/download-item';
import {ModalOpenClose} from 'modal-viewer';

@Component({
  selector: 'http-downloader',
  templateUrl: './http-downloader.component.html',
  styleUrls: ['./http-downloader.component.css']
})
export class HttpDownloaderComponent extends SubscriptionDestroyer implements OnInit {
  downloads = new Map<string, DownloadItem>();

  @Output()
  afterOpen = new EventEmitter<void>();
  @Output()
  afterClose = new EventEmitter<void>();
  @Output()
  fileDownload = new EventEmitter<Blob>();

  saveAllEnable = false;

  private enable = true;
  private keysShow: string[] = [];
  private numberFileDownload = 0;

  constructor(private sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit(): void {

  }

  get keys(): string[] {
    if (this.downloads.size !== this.keysShow.length) {
      this.keysShow = [];
      this.downloads.forEach((value, key) => this.keysShow.push(key));
    }
    return this.keysShow;
  }

  get percents(): number {
    let percents = 0;
    let numberDownload = 0;
    this.downloads.forEach(value => {
     if (value.isEnable) {
       numberDownload++;
       percents += value.percent;
     }
    });
    return percents/numberDownload;
  }

  signals(signals: ModalOpenClose): void {
    this.addObservable(HttpListenerImpl.download(),value => {
      switch (value.type) {
        case 'start': {
          setTimeout(() => HttpListenerImpl.enableWaitEmitter.next(false),2);
          this.numberFileDownload++;
          const id = this.insertDownloadItem(value.endpoint);
          value.subscription!().subscribe(subscription => this.downloads.get(id)!.subscription = () => subscription());
          if (this.enable) {
            signals.open();
          }
          setTimeout(() => value.id!().next(id), 2);
          break;
        }
        case 'percent':
          this.downloads.get(value.endpoint)!.percent = value.data as number;
          break;
        case 'data': {
          this.downloads.get(value.endpoint)!.file = value.data as Blob;
          this.fileDownload.next(value.data as Blob);
          break;
        }
        case 'error': {
          const download = this.downloads.get(value.endpoint);
          if (download) {
            download.isEnable = false;
          }
          break;
        }
        case 'end': this.finishDownload();
      }
    });
  }

  private insertDownloadItem(endpoint: string): string {
    let id = 0;
    let identify = endpoint;
    while (this.downloads.has(identify)) {
      identify = `${endpoint}(${++id})`;
    }
    setTimeout(() => {
      this.downloads.set(identify, {percent: 0, isEnable: true, name: identify});
      this.isAllDownload();
    }, 2);
    return identify;
  }

  afterOpenModal(): void {
    this.afterOpen.next();
  }

  afterCloseModal(): void {
    if (this.enable) {
      this.clearDownloads();
      this.afterClose.next();
      HttpListenerImpl.enableWaitEmitter.next(true);
    }
  }

  createUrl(name: string, file: Blob | undefined): SafeResourceUrl {
    if (file) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  stopDownload(download: DownloadItem): void {
    download.isEnable = false;
    download.subscription!().unsubscribe();
    this.isAllDownload();
  }

  private finishDownload(): void {
    this.numberFileDownload--;
    if (!this.enable && this.numberFileDownload === 0) {
      this.clearDownloads();
    }
    this.isAllDownload();
  }

  private clearDownloads(): void {
    this.downloads.forEach(value => value.subscription!().unsubscribe());
    this.downloads.clear();
    this.saveAllEnable = false;
  }

  saveAll(): void {
    this.downloads.forEach((value, key) => {
      if (value.isEnable) {
        document.getElementById(key)?.click();
      }
    });
  }

  private isAllDownload(): void {
    const downloadItems = this.downloads.values();
    let downloadItem = downloadItems.next();
    let isCouldSave = true;
    while (isCouldSave && !downloadItem.done) {
      isCouldSave = !downloadItem.value.isEnable || (downloadItem.value.file !== undefined);
      downloadItem = downloadItems.next();
    }
    this.saveAllEnable = isCouldSave;
  }
}
