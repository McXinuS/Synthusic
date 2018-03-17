import { NgModule } from '@angular/core';
import {PopupComponent} from '@core/views/popup/popup.component';
import {SharedModule} from '@shared/shared.module';
import {InstrumentSettingsModule} from '@core/views/instrument-settings';
import { TextPopupComponent } from './text-popup/text-popup.component';
import { InstrumentPopupComponent } from './instrument-popup/instrument-popup.component';
import { LoadingPopupComponent } from './loading-popup/loading-popup.component';
import { ErrorPopupComponent } from './error-popup/error-popup.component';

@NgModule({
  imports: [
    SharedModule,
    InstrumentSettingsModule
  ],
  declarations: [
    PopupComponent,
    TextPopupComponent,
    InstrumentPopupComponent,
    LoadingPopupComponent,
    ErrorPopupComponent
  ],
  exports: [
    PopupComponent
  ]
})
export class PopupModule { }
