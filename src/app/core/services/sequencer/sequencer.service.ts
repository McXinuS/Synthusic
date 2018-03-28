import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {SequencerNote, Settings} from '@core/models';
import {WebSocketService} from '../websocket';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';
import {SequencerNoteService} from './sequencernote.service';

@Injectable()
export class SequencerService {

  /**
   * Array of all notes in sequencer.
   */
  private _notes: SequencerNote[] = [];
  notes$: Subject<SequencerNote[]> = new BehaviorSubject([]);

  bpm$: Subject<number> = new BehaviorSubject(60);

  constructor(private webSocketService: WebSocketService,
              private sequencerNoteService: SequencerNoteService) {

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

    // Apply notes received from server
    for (let note of notes) {

      // Restore missing methods
      let populatedNote = this.sequencerNoteService.getSequencerNote(
        note.baseNoteId,
        note.instrumentId,
        note.duration,
        note.position,
        note.id
      );

      this.addNote(populatedNote, false);
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
