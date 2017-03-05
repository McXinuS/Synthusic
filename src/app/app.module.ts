import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {SettingsComponent} from './navbar/settings/settings.component';
import {NavbarComponent} from './navbar/navbar.component';
import {KeyboardComponent} from './keyboard/keyboard.component';
import {KeyComponent} from './keyboard/key/key.component';
import {LoaderService} from './shared/loader/loader.service';
import {NoteService} from './shared/note/note.service';
import {InstrumentService} from './shared/instrument/instrument.service';
import {SequencerService} from './shared/sequencer/sequencer.service';
import {SoundService} from './shared/sound/sound.service';
import {SequencerNoteService} from './shared/sequencer/sequencernote.service';
import {InstrumentSettingsComponent} from './popup/instrument-settings/instrument-settings.component';
import {PopupService} from './shared/popup/popup.service';
import {PopupComponent} from './popup/popup.component';
import {OscillatorSettingsComponent} from './popup/instrument-settings/oscillator-settings/oscillator-settings.component';
import {TitleCase} from './shared/utils/pipes/titlecase.pipe';
import {SequencerComponent} from './sequencer/sequencer.component';
import {RoomComponent} from './navbar/room/room.component';
import {RoomService} from './shared/room/room.service';
import {WebSocketService} from './shared/websocket/websocket.service';
import {WebSocketHandlerService} from "./shared/websocket/websocketmessagehandler";

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    NavbarComponent,
    KeyboardComponent,
    KeyComponent,
    InstrumentSettingsComponent,
    PopupComponent,
    OscillatorSettingsComponent,
    TitleCase,
    SequencerComponent,
    RoomComponent
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
    SoundService,
    PopupService,
    RoomService,
    WebSocketService,
    WebSocketHandlerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
