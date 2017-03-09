import {Injectable} from '@angular/core';
import {SequencerNote} from './sequencernote.model';
import {SequencerNoteService} from './sequencernote.service';
import {SoundService} from '../sound/sound.service';
import {WebSocketService} from '../websocket/websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {WebSocketMessage} from '../websocket/websocketmessage.model';

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
              private soundService: SoundService,
              private webSocketService: WebSocketService) {
    this.webSocketService.registerHandler(WebSocketMessageType.note_add, this.onNoteReceived.bind(this, 'add'));
    this.webSocketService.registerHandler(WebSocketMessageType.note_remove, this.onNoteReceived.bind(this, 'remove'));
  }

  /**
   * Called when a note is received by Web Socket
   */
  private onNoteReceived(type: string, noteId: number) {
    let note = this.sequencerNoteService.getSequencerNote(noteId);
    if (type === 'add') {
      this.addNote(note, false);
    } else if (type === 'remove') {
      this.removeNote(note, false);
    }
  }

  init(noteIds: number[]) {
    let note;
    for (let id of noteIds) {
      note = this.sequencerNoteService.getSequencerNote(id);
      this.addNote(note, false);
    }
  }

  addNote(note: SequencerNote, broadcast = true) {
    if (this.hasNote(note)) return;
    this.notes.push(note);
    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_add, note.id);
    }
  }

  removeNote(note: SequencerNote, broadcast = true) {
    if (!this.hasNote(note)) return;
    let nsInd = this.notes.findIndex(ns => ns.id === note.id);
    if (nsInd != -1) {
      this.notes.splice(nsInd, 1);
    } else {
      return;
    }
    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_remove, note.id);
    }
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
