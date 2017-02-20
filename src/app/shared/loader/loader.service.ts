import {Injectable} from '@angular/core';
import {NoteService} from "../note/note.service";
import {CONSTANTS} from "./config.constants";
import {INSTRUMENTS} from './instrument.mock';
import {InstrumentService} from "../instrument/instrument.service";
import {SoundService} from "../sound/sound.service";
import {WebSocketService} from "../websocket/websocket.service";
import {PopupService} from "../popup/popup.service";

@Injectable()
export class LoaderService {
  settings;
  readonly WebSocketTimeout = 10000;

  constructor(private wsService: WebSocketService,
              private noteService: NoteService,
              private instrumentService: InstrumentService,
              private soundService: SoundService,
              private popupService: PopupService) {
  }

  init(progressChange, onDone) {
    // TODO: make everything observable
    progressChange('Establishing server connection');
    this.establishWebSocketConnection()
      .then(() => {
        progressChange('Parsing response');
        this.settings = this.loadSettings();
      }, () => {
        this.popupService.show(
          'Unable to connect',
          'The remote server is not responding, going offline mode. Try to reload the page to go online.');
        this.settings = this.loadLocalSettings();
      })
      .catch((err) => {
        this.popupService.show(
          'Unable to connect',
          'The remote server is not responding, going offline mode. Try to reload the page to go online.');
        this.settings = this.loadLocalSettings();
      })
      .then(() => {
        progressChange('Loading notes');
        this.initNotes();
      })
      .then(() => {
        progressChange('Loading instruments');
        this.initInstruments();
      })
      .then(() => {
        progressChange('Initializing sound module');
        this.initSoundModule();
      })
      .then(() => {
        onDone();
      })
      .catch((err) => {
        this.popupService.show(
          'Unable to initialize app',
          'Something went wrong during the loading if the application. Try to reload the page.');
        onDone();
      });
  }

  private establishWebSocketConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.wsService.init(location.origin.replace(/^http/, 'ws'));
      /*
      let now = Date.now();
      while (!this.wsService.isSocketReady) {
       if (Date.now() - now > this.WebSocketTimeout) {
       reject();
       }
      }
       resolve();
       */
      let tId, intId;
      tId = setTimeout(
        () => {
          clearTimeout(tId);
          clearInterval(intId);
          reject();
        },
        this.WebSocketTimeout);
      intId = setInterval(
        () => {
          if (this.wsService.isSocketReady) {
            resolve();
            clearTimeout(tId);
            clearInterval(intId);
          }
        },
        50);
    });
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
