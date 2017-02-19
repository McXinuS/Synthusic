import {Injectable} from '@angular/core';
import {NoteService} from "../note/note.service";
import {CONSTANTS} from "./config.constants";
import {INSTRUMENTS} from './instrument.mock';
import {InstrumentService} from "../instrument/instrument.service";
import {SoundService} from "../sound/sound.service";
import {WebSocketService} from "../websocket/websocket.service";
import {PopupService} from "../popup/popup.service";

@Injectable()
export class LoaderService{
  settings;
  readonly WebSocketTimeout = 10000;

  constructor(private wsService: WebSocketService,
              private noteService: NoteService,
              private instrumentService: InstrumentService,
              private soundService: SoundService,
              private popupService: PopupService) {
  }

  init(progressChange, onDone) {
    // TODO rewrite with promise
    progressChange('Establishing server connection');
    if (!this.establishWebSocketConnection()) {
      this.popupService.show(
        'Unable to connect',
        'The remote server is not responding, going offline mode. Try to reload the page to go online.');
      this.settings = this.loadLocalSettings();
    } else {
      progressChange('Parsing response');
      this.settings = this.loadSettings();
    }
    progressChange('Loading notes');
    this.initNotes();
    progressChange('Loading instruments');
    this.initInstruments();
    progressChange('Initializing sound module');
    this.initSoundModule();
    onDone();
  }

  private establishWebSocketConnection(): boolean {
    this.wsService.init(location.origin.replace(/^http/, 'ws'));
    let now = Date.now();
    while (!this.wsService.isSocketReady) {
      if (Date.now() - now > this.WebSocketTimeout) return false;
    }
    return true;
  }

  private loadSettings() {
    // TODO init from websocket here
    let set = Object.assign({}, CONSTANTS.noteConstants, {instruments: INSTRUMENTS});
    set['scale'] = set.SCALE_SHARP;
    return set;
  }

  private loadLocalSettings() {
    let set = Object.assign({}, CONSTANTS.noteConstants, {instruments: INSTRUMENTS});
    set['scale'] = set.SCALE_SHARP;
    return set;
  }

  private initNotes() {
    this.noteService.init(this.settings);
  }

  private initInstruments() {
    this.instrumentService.init(this.settings.instruments);
  }

  private initSoundModule() {
    this.soundService.init(this.settings.MASTER_GAIN_MAX / 2);
  }
}
