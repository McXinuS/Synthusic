import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Room} from '@shared-global/models';
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
import {Observable} from 'rxjs/Observable';

// TODO: refactor constants

@Injectable()
export class LoaderService {
  private readonly WebSocketTimeout = 10000;

  private popupHeader = 'Application is loading...';
  private popupId: number;
  private roomListPopupId: number;

  private isOffline: Subject<boolean> = new BehaviorSubject<boolean>(false);
  isOffline$: Observable<boolean> = this.isOffline.asObservable();

  private hasEnteredRoom: Subject<boolean> = new BehaviorSubject<boolean>(false);
  hasEnteredRoom$: Observable<boolean> = this.hasEnteredRoom.asObservable();

  constructor(private sequencerService: SequencerService,
              private wsService: WebSocketService,
              private noteService: NoteService,
              private instrumentService: InstrumentService,
              private soundService: SoundService,
              private popupService: PopupService,
              private roomService: RoomService) {

    this.init();
    this.wsService.registerHandler(WebSocketMessageType.enter_room, this.onRoomChanged.bind(this));
    this.wsService.registerHandler(WebSocketMessageType.leave_room, this.leaveRoom.bind(this));

  }

  private init() {

    this.hasEnteredRoom.next(false);

    // Show loading popup
    this.popupId = this.popupService.showLoader(this.popupHeader, 'Please wait');
    this.onLoadingProgressChange('Establishing server connection...');

    // Establich web socket connection. Load offline room settings if failed.
    this.establishWebSocketConnection()
      .then(() => {
        this.goOnline();
        this.wsService.setOnDisconnect(this.goOffline.bind(this));
        this.onLoadingDone(true);
      })
      .catch (() => {
        // Go offline mode and load mock room.
        // Currently it isn't possible to save changes in this mode.
        this.goOffline();
        this.wsService.disconnect();

        let settings = this.loadLocalSettings();
        this.loadRoom(settings);
        this.onLoadingDone(false);
      })
  }

  showRoomList() {
    this.wsService.sendAsync(WebSocketMessageType.get_available_rooms)
      .then((rooms: Room[]) => {
        this.roomListPopupId = this.popupService.showRoomList(rooms, this.onRoomSelected.bind(this))
      });
  }

  goOnline() {
    this.isOffline.next(false);

    // window.onbeforeunload = null;
  }

  goOffline() {
    this.isOffline.next(true);
    this.popupService.showError(
      'We lost connection to server',
      'The remote server is not responding, going offline mode.\n' +
      'In offline mode you are unable to share your creativity with other people.' +
      ' Also, all your data will be lost when the page is closed.\n' +
      'Reloading the page is the way to get complete web site functionality.');

    // window.onbeforeunload = function (e) {
    //   return true;
    // };
  }

  private onLoadingProgressChange(message: string) {
    this.popupService.update(this.popupId, this.popupHeader, message);
  }

  /**
   * @param {boolean} ok Was loading done.
   */
  private onLoadingDone(ok: boolean) {
    this.popupService.close(this.popupId);
    if (ok) {
      this.goOnline();
    } else {
      this.goOffline();
    }
  }

  /**
   * Send request to enter room.
   * @param {number} roomId Id of the room to enter. If not set, request creating a new room.
   */
  private onRoomSelected(roomId?: number) {

    if (this.roomListPopupId) {
      this.popupService.close(this.roomListPopupId);
    }

    this.popupId = this.popupService.showLoader(this.popupHeader, 'Please wait');

    // Send message to server and wait for server to approve it.
    // The server will send message back and the app will handle that message.
    if (typeof roomId == 'undefined') {
      this.wsService.send(WebSocketMessageType.enter_new_room, roomId);
    } else {
      this.wsService.send(WebSocketMessageType.enter_room, roomId);
    }
  }

  private leaveRoom() {
    this.hasEnteredRoom.next(true);
    this.showRoomList();
  }

  /**
   * Wait for web socket client to establish connection with web socket server.
   * @returns {Promise<any>} Promise resolves when web socket is ready to use.
   * Rejects on timeout if no connection if established.
   */
  private establishWebSocketConnection(): Promise<any> {
    return new Promise((resolve, reject) => {

      this.wsService.init(location.origin.replace(/^http/, 'ws'));

      let tId, intId;

      // Disconnect if web socket doesn't establish connection within few seconds
      tId = setTimeout(() => {
          clearTimeout(tId);
          clearInterval(intId);
          reject();
        }, this.WebSocketTimeout
      );

      // Wait for web socket to establish connection
      intId = setInterval(() => {
          if (this.wsService.isSocketReady) {
            resolve();
            clearTimeout(tId);
            clearInterval(intId);
          }
        }, 50
      );
    });
  }

  /**
   * Get settings from server.
   * @returns {Promise<Settings>}
   */
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

  /**
   * Get fallback settings.
   */
  private loadLocalSettings(): Settings {
    return SETTINGS_OFFLINE;
  }

  private onRoomChanged() {
    this.loadSettings()
      .then(this.loadRoom.bind(this))
      .catch(this.showInitializationError.bind(this));
  }

  /**
   * Initialize score workspace with room settings.
   * @param {Settings} settings Room settings.
   */
  private loadRoom(settings: Settings) {
    try {

      this.onLoadingProgressChange('Initializing room...');
      this.initRoom(settings);

      // Move to init method.
      this.onLoadingProgressChange('Loading notes...');
      this.initNotes(settings);

      this.onLoadingProgressChange('Loading instruments...');
      this.initInstruments(settings);
      this.onLoadingProgressChange('Initializing sound module...');
      this.initSoundModule(settings);
      this.onLoadingProgressChange('Initializing sequencer...');
      this.initSequencer(settings);

      this.hasEnteredRoom.next(true);
      this.onLoadingDone(true);

    } catch (e) {

      this.onLoadingDone(false);
      this.showInitializationError();

    }
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



  private showInitializationError() {
    this.popupService.showError(
      'Unable to initialize app',
      'Something went wrong during loading. Try to reload the page.'
    );
  }
}
