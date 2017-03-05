import {Injectable} from '@angular/core';
import {Instrument} from '../instrument/instrument.model';
import {SequencerNote} from './sequencernote.model';
import {Observable} from 'rxjs';
import {InstrumentService} from '../instrument/instrument.service';
import {SequencerNoteService} from './sequencernote.service';

@Injectable()
export class SequencerService {

  constructor(private sequencerNoteService: SequencerNoteService) {
  }

  /**
   * Array of all notes in sequencer.
   */
  notes: SequencerNote[] = [];

  addNote(note: SequencerNote) {
    this.notes[note.id] = note;
  }

  removeNote(note: SequencerNote) {
    this.notes[note.id] = note;
  }

  /**
   * Array of notes that playing at the moment.
   */
  playing: number[] = [];

  playNote(note: SequencerNote) {
    if (this.isPlaying(note)) return;
    this.playing.push(note.id);
  }

  stopNote(note: SequencerNote) {
    if (!this.isPlaying(note)) return;
    let nsInd = this.playing.indexOf(note.id);
    if (nsInd != -1) {
      this.playing.splice(nsInd, 1);
    }
  }

  hasNote(note: SequencerNote) {
    return this.notes.findIndex(n => note.id == n.id) >= 0;
  }

  isPlaying(note: SequencerNote) {
    return this.playing.indexOf(note.id) >= 0;
  }
}
