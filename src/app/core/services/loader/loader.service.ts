import {Injectable} from '@angular/core';
import {Settings} from '@core/models';
import {SETTINGS_OFFLINE} from '@shared-global/mock/settings.mock';
import {CONSTANTS} from './config.constants';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';

import {NoteService} from '../note';
import {InstrumentService} from '../instrument';
import {SoundService} from '../sound';
import {WebSocketService} from '../websocket';
import {PopupService} from '../popup';
import {SequencerService} from '../sequencer';
import {RoomService} from '../room';

// TODO: refactor constants

@Injectable()
export class LoaderService {
  readonly WebSocketTimeout = 10000;

  offlineMode: boolean;

  constructor(private sequencerService: SequencerService,
              private wsService: WebSocketService,
              private noteService: NoteService,
              private instrumentService: InstrumentService,
              private soundService: SoundService,
              private popupService: PopupService,
              private roomService: RoomService) {
  }

  init(progressChange, onDone) {
    progressChange('Establishing server connection...');
    this.establishWebSocketConnection()
      .then(() => {
        this.goOnline();
        this.wsService.setOnDisconnect(this.goOffline.bind(this));
        progressChange('Parsing response...');
        return this.loadSettings();
      })
      .catch (() => {
        this.goOffline();
        this.wsService.disconnect();
        return this.loadLocalSettings();
      })
      .then((settings: Settings) => {
        progressChange('Initializing room...');
        this.initRoom(settings);
        progressChange('Loading notes...');
        this.initNotes(settings);
        progressChange('Loading instruments...');
        this.initInstruments(settings);
        progressChange('Initializing sound module...');
        this.initSoundModule(settings);
        progressChange('Initializing sequencer...');
        this.initSequencer(settings);
        onDone();
      }, () => {
        this.popupService.showMessage(
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

  private loadSettings(): Promise<Settings> {
    return new Promise((resolve, reject) => {
      this.wsService.sendAsync<Settings>(WebSocketMessageType.get_state)
        .then((state) => {
          if (!state) {
            reject();
          }
          resolve(Object.assign({}, CONSTANTS, state));
        }, reject)
    });
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

  private initSequencer(settings: Settings) {
    this.sequencerService.init(settings);
  }

  private initRoom(settings: Settings) {
    this.roomService.init(settings.room, settings.currentUser);
  }

  goOnline() {
    this.offlineMode = false;
    window.onbeforeunload = null;
  }

  goOffline() {
    this.offlineMode = true;
    this.popupService.showMessage(
      'We lost connection to server',
      'The remote server is not responding, going offline mode.\n' +
      'In offline mode you are unable to share your creativity with other people.' +
      ' Also, all your data will be lost when the page is closed.\n' +
      'Reloading the page is the way to get complete web site functionality.');
    window.onbeforeunload = function(e) {
      return true;
    };
  }
}
