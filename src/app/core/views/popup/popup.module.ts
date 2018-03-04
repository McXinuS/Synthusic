import { NgModule } from '@angular/core';
import {PopupComponent} from "@core/views/popup/popup.component";
import {SharedModule} from "@shared/shared.module";
import {InstrumentSettingsModule} from "@core/views/instrument-settings";

@NgModule({
  imports: [
    SharedModule,
    InstrumentSettingsModule
  ],
  declarations: [
    PopupComponent
  ],
  exports: [
    PopupComponent
  ]
})
export class PopupModule { }
