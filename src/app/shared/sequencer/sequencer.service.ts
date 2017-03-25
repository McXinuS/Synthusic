import {Injectable} from '@angular/core';
import {SequencerNote} from './sequencernote.model';
import {SequencerNoteService} from './sequencernote.service';
import {SoundService} from '../sound/sound.service';
import {WebSocketService} from '../websocket/websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {WebSocketMessage} from '../websocket/websocketmessage.model';
import {Subject} from "rxjs";

@Injectable()
export class SequencerService {
  /**
   * Array of all notes in sequencer.
   */
  _notes: SequencerNote[] = [];
  notes$: Subject<SequencerNote[]> = new Subject();

  /**
   * Array of notes that playing at the moment.
   */
  _playing: number[] = [];
  playing$: Subject<number[]>;

  readonly BarCount = 20;

  constructor(private sequencerNoteService: SequencerNoteService,
              private soundService: SoundService,
              private webSocketService: WebSocketService) {
    this.webSocketService.registerHandler(WebSocketMessageType.note_add, this.onNoteReceived.bind(this, 'add'));
    this.webSocketService.registerHandler(WebSocketMessageType.note_remove, this.onNoteReceived.bind(this, 'remove'));
  }

  /**
   * Called when a note is received by Web Socket
   */
  private onNoteReceived(type: string, note: SequencerNote) {
    if (type === 'add') {
      this.addNote(note, false);
    } else if (type === 'remove') {
      this.removeNote(note, false);
    }
  }

  init(notes: SequencerNote[]) {
    for (let note of notes) {
      this.addNote(note, false);
    }
  }

  addNote(note: SequencerNote, broadcast = true) {
    if (this.hasNote(note)) return;
    this._notes.push(note);
    this.notes$.next(this._notes);
    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_add, note);
    }
  }

  removeNote(note: SequencerNote, broadcast = true) {
    if (!this.hasNote(note)) return;
    let nsInd = this._notes.findIndex(ns => ns.id === note.id);
    if (nsInd != -1) {
      this._notes.splice(nsInd, 1);
      this.notes$.next(this._notes);
    }
    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_remove, note);
    }
  }

  hasNote(note: SequencerNote) {
    return this._notes.findIndex(n => note.id == n.id) >= 0;
  }

  playNote(note: SequencerNote) {
    if (this.isPlaying(note)) return;
    this._playing.push(note.id);
    this.soundService.playNote(note);
  }

  stopNote(note: SequencerNote) {
    if (!this.isPlaying(note)) return;
    let nsInd = this._playing.indexOf(note.id);
    if (nsInd != -1) {
      this._playing.splice(nsInd, 1);
    }
    this.soundService.stopNote(note);
  }

  isPlaying(note: SequencerNote) {
    return this._playing.indexOf(note.id) >= 0;
  }
}
