import { NgModule } from '@angular/core';
import {SharedModule} from "@shared/shared.module";
import {InstrumentSettingsComponent} from "./instrument-settings.component";
import {EnvelopeSettingsComponent} from "./envelope-settings";
import {OscillatorSettingsComponent} from "./oscillator-settings";
import {OscilloscopeComponent} from "./oscilloscope";
import {PannerSettingsComponent} from "./panner-settings";

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    InstrumentSettingsComponent,
    EnvelopeSettingsComponent,
    OscillatorSettingsComponent,
    OscilloscopeComponent,
    PannerSettingsComponent
  ],
  exports: [
    InstrumentSettingsComponent
  ]
})
export class InstrumentSettingsModule { }
