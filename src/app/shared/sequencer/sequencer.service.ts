import {Injectable} from '@angular/core';
import {Instrument} from '../instrument/instrument.model';
import {SequencerNote} from './sequencernote.model';
import {Observable} from 'rxjs';
import {InstrumentService} from '../instrument/instrument.service';
import {SequencerNoteService} from './sequencernote.service';
import {SoundService} from "../sound/sound.service";
import {WebSocketSenderService} from "../websocket/websocketsender";

@Injectable()
export class SequencerService {
  /**
   * Array of all notes in sequencer.
   */
  notes: SequencerNote[] = [];

  /**
   * Array of notes that playing at the moment.
   */
  playing: number[] = [];

  constructor(private sequencerNoteService: SequencerNoteService,
              private soundService: SoundService,) {
  }
  addNote(note: SequencerNote) {
    this.notes[note.id] = note;
  }

  removeNote(note: SequencerNote) {
    this.notes[note.id] = note;
  }

  hasNote(note: SequencerNote) {
    return this.notes.findIndex(n => note.id == n.id) >= 0;
  }

  playNote(note: SequencerNote) {
    if (this.isPlaying(note)) return;
    this.playing.push(note.id);
    this.soundService.playNote(note);
  }

  stopNote(note: SequencerNote) {
    if (!this.isPlaying(note)) return;
    let nsInd = this.playing.indexOf(note.id);
    if (nsInd != -1) {
      this.playing.splice(nsInd, 1);
    }
    this.soundService.stopNote(note);
  }

  isPlaying(note: SequencerNote) {
    return this.playing.indexOf(note.id) >= 0;
  }
}
