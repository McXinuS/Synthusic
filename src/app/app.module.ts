import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import { MyErrorHandler } from '@core/utilities';
import {SharedModule} from '@shared/index';
import {CoreModule} from '@core/index';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
    CoreModule
  ],
  declarations: [
    AppComponent,
    /*
    KeyboardComponent,
    KeyComponent,
    PopupComponent,
    SequencerComponent,
    SequencerInstrumentComponent,
    SequencerInstrumentCreateComponent,
    SequencerFooterComponent,
    */
  ],
  providers: [
    {provide: ErrorHandler, useClass: MyErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
