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
export class SequencerService implements OnInit {

  constructor(private broadcaster: BroadcasterService,
              private sequencerNoteService: SequencerNoteService) {
    this.broadcaster.on<SequencerNote>(BroadcastTopic.addNote)
      .subscribe(note => this.playNote(note));
    this.broadcaster.on<SequencerNote>(BroadcastTopic.removeNote)
      .subscribe(note => this.stopNote(note));
  }

  ngOnInit() {
  }


  /**
   * Array of all notes.
   */
  notes: SequencerNote[] = [];

  addNote(note: SequencerNote) {
    this.notes[note.id] = note;
  }

  removeNote(note: SequencerNote) {
    this.notes[note.id] = note;
  }


  /**
   * Array of playing at the moment notes.
   */
  playing: number[] = [];

  playNote(note: SequencerNote) {
    if (this.isPlaying(note)) return;
    this.playing.push(note.id);
    this.broadcaster.broadcast(BroadcastTopic.playNote, note.note);
    //this.addPlayingNote(note.note);
  }

  stopNote(note: SequencerNote) {
    /*
    if (!this.isPlaying(note)) return;
    let nsInd = this.playing.indexOf(note.id);
    this.playing.splice(nsInd,1);
    */
    this.broadcaster.broadcast(BroadcastTopic.stopNote, note.note);
    //this.removePlayingNote(note.note);
  }

  isPlaying(note: SequencerNote) {
    return this.playing.indexOf(note.id) >= 0;
  }


  /**
   * Array of playing at the moment notes (no regards to instrument's notes).
   */
  // TODO observable + move to 'sound'
  playingNotes: boolean[] = [];

  /**
   * A number of playing notes out of a total number of notes
   */
  playingCount: number = 0;

  private addPlayingNote(note: Note) {
    this.playingNotes[note.index] = true;
    this.playingCount++;
  }

  private removePlayingNote(note: Note) {
    for (let id of this.playing) {
      if (this.sequencerNoteService.getSequencerNote(id).note.index == note.index) return;
    }

    this.playingNotes[note.index] = false;
    this.playingCount--;
  }
}
