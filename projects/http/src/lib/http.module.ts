import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {HttpLoaderComponent} from './components/http-loader/http-loader.component';
import {HttpDownloaderComponent} from './components/http-downloader/http-downloader.component';
import {FormsModule} from '@angular/forms';
import {HttpErrorMessageComponent} from './components/http-error-message/http-error-message.component';
import {AccordionModule} from 'accordion-viewer';
import {ModalModule} from 'modal-viewer';

@NgModule({
  declarations: [
    HttpLoaderComponent,
    HttpDownloaderComponent,
    HttpErrorMessageComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ModalModule,
    FormsModule,
    AccordionModule
  ],
    exports: [HttpLoaderComponent, HttpDownloaderComponent, HttpErrorMessageComponent]
})
export class HttpModule {
}
