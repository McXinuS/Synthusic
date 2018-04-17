import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {SequencerNote, SequencerNoteSettingsState, Settings} from '@core/models';
import {WebSocketService} from '../websocket';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';
import {SequencerNoteService} from './sequencernote.service';
import {SoundService} from "../sound";
import {Point} from "@shared-global/models";
import {Observable} from "rxjs/Observable";

@Injectable()
export class SequencerService {

  /**
   * Array of all notes in sequencer.
   */
  private _notes: SequencerNote[] = [];
  notes$: Subject<SequencerNote[]> = new BehaviorSubject([]);

  bpm$: Subject<number> = new BehaviorSubject(60);

  private noteSettingsState: SequencerNoteSettingsState;
  private noteSettingsStateSource: Subject<SequencerNoteSettingsState> = new BehaviorSubject<SequencerNoteSettingsState>(null);
  noteSettingsState$: Observable<SequencerNoteSettingsState> = this.noteSettingsStateSource.asObservable();

  constructor(private webSocketService: WebSocketService,
              private sequencerNoteService: SequencerNoteService,
              private soundService: SoundService) {

    this.webSocketService.registerHandler(WebSocketMessageType.note_add, this.onNoteReceived.bind(this, 'add'));
    this.webSocketService.registerHandler(WebSocketMessageType.note_delete, this.onNoteReceived.bind(this, 'remove'));
    this.webSocketService.registerHandler(WebSocketMessageType.bpm_changed, this.onBpmChanged.bind(this));

    this.soundService.setBpmObservable(this.bpm$.asObservable());

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
    let notes = settings.room.notes;

    // Apply notes received from server
    for (let note of notes) {

      // Restore missing methods
      let populatedNote = this.sequencerNoteService.getSequencerNote(
        note.baseNoteId,
        note.instrumentId,
        note.isRest,
        note.duration,
        note.position,
        note.id
      );

      this.addNote(populatedNote, false);
    }

    this.onBpmChanged(settings.room.bpm);
  }

  private insertNote(note: SequencerNote) {
    this._notes.push(note);
  }

  private deleteNote(note: SequencerNote) {
    let index = this._notes.findIndex(ns => ns.id === note.id);
    if (index >= 0) {
      this._notes.splice(index, 1);
    }
  }

  addNote(note: SequencerNote, broadcast = true) {
    if (note == null || this.hasNote(note)) return;

    if (broadcast) {
      this.webSocketService.sendAsync(WebSocketMessageType.note_add, note)
        .then((id: number) => {
          // Take note ID from server
          note.id = id;
          this.insertNote(note);
          this.notes$.next(this._notes);
        });
    } else {
      this.insertNote(note);
      this.notes$.next(this._notes);
    }
  }

  updateNote(note: SequencerNote) {
    if (note == null) return;

    if (this.hasNote(note)) {
      this.deleteNote(note);
    }

    this.insertNote(note);
    this.notes$.next(this._notes);

    this.webSocketService.send(WebSocketMessageType.note_update, note);
  }

  removeNote(note: SequencerNote, broadcast = true) {
    if (note == null || !this.hasNote(note)) return;

    this.deleteNote(note);
    this.notes$.next(this._notes);

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

  showNoteSettings(note: SequencerNote, pos: Point) {
    this.noteSettingsState = new SequencerNoteSettingsState(note, pos, true);
    this.noteSettingsStateSource.next(this.noteSettingsState);
  }

  hideNoteSettings() {
    this.noteSettingsState.isShown = false;
    this.noteSettingsStateSource.next(this.noteSettingsState);
  }
}
