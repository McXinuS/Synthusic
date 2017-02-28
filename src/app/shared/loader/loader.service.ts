import {Injectable} from '@angular/core';
import {NoteService} from '../note/note.service';
import {InstrumentService} from '../instrument/instrument.service';
import {SoundService} from '../sound/sound.service';
import {WebSocketService} from '../websocket/websocket.service';
import {PopupService} from '../popup/popup.service';
import {Settings} from './settings.model';
import {SETTINGS_OFFLINE} from './settings.mock';
import {CONSTANTS} from "./config.constants";

@Injectable()
export class LoaderService {
  readonly WebSocketTimeout = 10000;

  offlineMode: boolean;

  constructor(private wsService: WebSocketService,
              private noteService: NoteService,
              private instrumentService: InstrumentService,
              private soundService: SoundService,
              private popupService: PopupService) {
  }

  init(progressChange, onDone) {
    progressChange('Establishing server connection');
    this.establishWebSocketConnection()
      .then(() => {
        this.offlineMode = false;
        progressChange('Parsing response');
        return this.loadSettings();
      })
      .catch (() => {
        this.offlineMode = true;
        this.popupService.show(
          'Unable to connect',
          'The remote server is not responding, going offline mode. Try to reload the page to go online.');
        return this.loadLocalSettings();
      })
      .then((settings: Settings) => {
        progressChange('Loading notes');
        this.initNotes(settings);
        progressChange('Loading instruments');
        this.initInstruments(settings);
        progressChange('Initializing sound module');
        this.initSoundModule(settings);
        // DEBUG
        //setTimeout(onDone, 1800000);
        onDone();
      }, () => {
        this.popupService.show(
          'Unable to initialize app',
          'Something went wrong during the loading if the application. Try to reload the page.');
        onDone();
      });
  }

  private establishWebSocketConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.wsService.init(location.origin.replace(/^http/, 'ws'));
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

  private async loadSettings() {
      try {
        let state = await this.wsService.requestProgramState();
        if (!state)
          return null;
        return Object.assign({}, state, CONSTANTS);
      }
      catch (e) {
        return null;
      }

    //DEBUG
    //return this.loadLocalSettings();
  }

  private loadLocalSettings(): Settings {
    return SETTINGS_OFFLINE;
  }

  private initNotes(settings: Settings) {
    this.noteService.init(settings);
  }

  private initInstruments(settings: Settings) {
    this.instrumentService.init(settings.instruments);
  }

  private initSoundModule(settings: Settings) {
    this.soundService.init(settings.masterGainMax / 2);
  }
}
