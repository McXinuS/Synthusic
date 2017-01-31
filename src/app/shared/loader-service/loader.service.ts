import {Injectable} from '@angular/core';
import {NoteService} from "../note/note.service";
import {CONSTANTS} from "./config.constants";
import {INSTRUMENTS} from './instrument.mock';
import {InstrumentService} from "../instrument/instrument.service";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {SoundService} from "../sound/sound.service";

@Injectable()
export class LoaderService{
  constructor(private noteService: NoteService,
              private instrumentService: InstrumentService,
              private broadcaster: BroadcasterService,
              private soundService: SoundService) {
  }

  init(progressChange, onDone) {
    progressChange('Establishing server connection');
    this.establishWebSocketConnection();
    progressChange('Parsing response');
    let settings = this.loadSettings();
    progressChange('Loading notes');
    this.initNotes(settings);
    progressChange('Loading instruments');
    this.initInstruments(settings.instruments);
    progressChange('Initializing sound module');
    this.initSoundModule(settings);
    onDone();
  }

  private establishWebSocketConnection() {

  }

  private loadSettings() {
    // TODO init from websocket here
    let set = Object.assign({}, CONSTANTS.noteConstants, {instruments: INSTRUMENTS});
    set['scale'] = set.SCALE_SHARP;
    return set;
  }

  private initNotes(settings) {
    this.noteService.init(settings);

    /*
    this.broadcaster.on<Note>('playNote')
      .subscribe(note => this.onPlayNote(note));
    this.broadcaster.on<Note>('stopNote')
      .subscribe(note => this.onStopNote(note));
    */
  }

  private initInstruments(settings) {
    this.instrumentService.init(settings);
  }

  private initSoundModule(settings) {
    this.soundService.init();
    this.soundService.masterGain = settings.MASTER_GAIN_MAX/2;
  }
}
