import {Injectable, OnInit} from '@angular/core';
import {Note} from '../note/note.model';
import {Instrument} from '../instrument/instrument.model';
import {SequencerNote} from './sequencernote.model';
import {Observable} from 'rxjs';
import {InstrumentService} from '../instrument/instrument.service';
import {BroadcasterService} from '../broadcaster/broadcaster.service';
import {BroadcastTopic} from '../broadcaster/broadcasttopic.enum';
import {SequencerNoteService} from './sequencernote.service';

@Injectable()
export class SequencerService {

  constructor(private broadcaster: BroadcasterService,
              private sequencerNoteService: SequencerNoteService) {
    this.broadcaster.on<SequencerNote>(BroadcastTopic.addNote)
      .subscribe(note => this.addNote(note));
    this.broadcaster.on<SequencerNote>(BroadcastTopic.removeNote)
      .subscribe(note => this.removeNote(note));
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
