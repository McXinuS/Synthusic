import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { NavbarComponent } from './navbar/navbar.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { KeyComponent } from './keyboard/key/key.component';
import { LoaderService } from "./shared/loader-service/loader.service";
import { NoteService } from "./shared/note/note.service";
import { InstrumentService } from "./shared/instrument/instrument.service";
import { SequencerService } from "./shared/sequencer/sequencer.service";
import { BroadcasterService } from "./shared/broadcaster/broadcaster.service";
import { SoundService } from "./shared/sound/sound.service";
import {SequencerNoteService} from "./shared/sequencer/sequencernote.service";
import { InstrumentSettingsComponent } from './instrument-settings/instrument-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    NavbarComponent,
    KeyboardComponent,
    KeyComponent,
    InstrumentSettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    LoaderService,
    InstrumentService,
    NoteService,
    SequencerService,
    SequencerNoteService,
    BroadcasterService,
    SoundService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
