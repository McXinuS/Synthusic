import { NgModule } from '@angular/core';
import {SharedModule} from '@shared/shared.module';
import {SequencerComponent} from '@core/views/sequencer/sequencer.component';
import {SequencerInstrumentComponent} from '@core/views/sequencer/sequencer-instrument';
import {SequencerFooterComponent} from '@core/views/sequencer/sequencer-footer';
import {SequencerInstrumentCreateComponent} from '@core/views/sequencer/sequencer-instrument-create';
import { NoteSettingsComponent } from './note-settings/note-settings.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    SequencerComponent,
    SequencerInstrumentComponent,
    SequencerFooterComponent,
    SequencerInstrumentCreateComponent,
    NoteSettingsComponent
  ],
  exports: [
    SequencerComponent,
    SequencerFooterComponent
  ]
})
export class SequencerModule { }
