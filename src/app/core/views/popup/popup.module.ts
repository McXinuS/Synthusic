import { NgModule } from '@angular/core';
import {PopupComponent} from '@core/views/popup/popup.component';
import {SharedModule} from '@shared/shared.module';
import {InstrumentSettingsModule} from '@core/views/instrument-settings';
import { TextPopupComponent } from './text-popup/text-popup.component';
import { InstrumentPopupComponent } from './instrument-popup/instrument-popup.component';
import { LoadingPopupComponent } from './loading-popup/loading-popup.component';
import { ErrorPopupComponent } from './error-popup/error-popup.component';
import { RoomsPopupComponent } from './rooms-popup/rooms-popup.component';
import {routing} from 'app/core/views/popup/popup.routing';
import { PopupWindowWrapperComponent } from './popup-window-wrapper/popup-window-wrapper.component';
import { RoutedPopupWindowWrapperComponent } from './popup-window-wrapper/routed-popup-window-wrapper/routed-popup-window-wrapper.component';

@NgModule({
  imports: [
    SharedModule,
    InstrumentSettingsModule,
    routing
  ],
  declarations: [
    PopupComponent,
    TextPopupComponent,
    InstrumentPopupComponent,
    LoadingPopupComponent,
    ErrorPopupComponent,
    RoomsPopupComponent,
    PopupWindowWrapperComponent,
    RoutedPopupWindowWrapperComponent
  ],
  exports: [
    PopupComponent
  ]
})
export class PopupModule { }
