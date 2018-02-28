import {Injectable} from '@angular/core';
import {SequencerNote} from './sequencernote.model';
import {SoundService} from '../sound/sound.service';
import {WebSocketService} from '../websocket/websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {BehaviorSubject, Subject} from "rxjs";
import {Settings} from "../loader/settings.model";

@Injectable()
export class SequencerService {

  /**
   * Array of all notes in sequencer.
   */
  private _notes: SequencerNote[] = [];
  notes$: Subject<SequencerNote[]> = new BehaviorSubject([]);

  bpm$: Subject<number> = new BehaviorSubject(60);

  constructor(private webSocketService: WebSocketService) {

    this.webSocketService.registerHandler(WebSocketMessageType.note_add, this.onNoteReceived.bind(this, 'add'));
    this.webSocketService.registerHandler(WebSocketMessageType.note_delete, this.onNoteReceived.bind(this, 'remove'));
    this.webSocketService.registerHandler(WebSocketMessageType.bpm_changed, this.onBpmChanged.bind(this));

  }

  /**
   * Called when a new note is received from a server.
   */
  private onNoteReceived(type: string, note: SequencerNote) {
    if (type === 'add') {
      this.addNote(note, false);
    } else if (type === 'remove') {
      this.removeNote(note, false);
    }
  }

  private onBpmChanged(bpm: number) {
    this.bpm$.next(bpm);
  }

  init(settings: Settings) {
    let notes = settings.notes;
    for (let note of notes) {
      this.addNote(note, false);
    }

    this.onBpmChanged(settings.bpm);
  }

  addNote(note: SequencerNote, broadcast = true) {
    if (note == null || this.hasNote(note)) return;

    this._notes.push(note);
    this.notes$.next(this._notes);

    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_add, note);
    }
  }

  removeNote(note: SequencerNote, broadcast = true) {
    if (note == null || !this.hasNote(note)) return;

    let nsInd = this._notes.findIndex(ns => ns.id === note.id);
    if (nsInd != -1) {
      this._notes.splice(nsInd, 1);
      this.notes$.next(this._notes);
    }

    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_delete, note);
    }
  }

  hasNote(note: SequencerNote) {
    if (note == null) return false;
    return this._notes.findIndex(n => note.id == n.id) >= 0;
  }

  setBpm(bpm: number) {
    this.onBpmChanged(bpm);
    this.webSocketService.send(WebSocketMessageType.bpm_changed, bpm);
  }
}
