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
        return this.loadSettings();
      }, () => {
        this.popupService.show(
          'Unable to connect',
          'The remote server is not responding, going offline mode. Try to reload the page to go online.');
        return this.loadLocalSettings();
      })
      .then((settings) => {
        progressChange('Loading notes');
        this.initNotes(settings);
        progressChange('Loading instruments');
        this.initInstruments(settings);
        progressChange('Initializing sound module');
        this.initSoundModule(settings);
        setTimeout(onDone, 2000);

        //onDone();
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
    return this.loadLocalSettings();
  }

  private loadLocalSettings() {
    let set = Object.assign({}, CONSTANTS.noteConstants, {instruments: INSTRUMENTS});
    set['scale'] = set.SCALE_SHARP;
    return set;
  }

  private initNotes(settings) {
    this.noteService.init(settings);
  }

  private initInstruments(settings) {
    this.instrumentService.init(settings.instruments);
  }

  private initSoundModule(settings) {
    this.soundService.init(settings.MASTER_GAIN_MAX / 2);
  }
}
