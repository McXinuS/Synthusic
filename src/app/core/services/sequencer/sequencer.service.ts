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
    this.webSocketService.registerHandler(WebSocketMessageType.note_update, this.onNoteReceived.bind(this, 'update'));
    this.webSocketService.registerHandler(WebSocketMessageType.note_delete, this.onNoteReceived.bind(this, 'delete'));
    this.webSocketService.registerHandler(WebSocketMessageType.bpm_changed, this.onBpmChanged.bind(this));

    this.soundService.setBpmObservable(this.bpm$.asObservable());

  }

  /**
   * Called when a new note is received from a server.
   */
  private onNoteReceived(type: string, note: SequencerNote | number) {
    switch (type) {
      case 'add':
        this.addNote(<SequencerNote>note, false);
        break;
      case 'update':
        this.updateNote(<SequencerNote>note, false);
        break;
      case 'delete':
        this.removeNote(<number>note, false);
        break;
    }
  }

  private onBpmChanged(bpm: number) {
    this.bpm$.next(bpm);
  }

  init(settings: Settings) {
    let notes = settings.room.notes;

    // Apply notes received from server
    for (let note of notes) {
      this.insertNote(note);
    }
    this.updateNotesObservable();

    this.onBpmChanged(settings.room.bpm);
  }

  private insertNote(note: SequencerNote) {

    // Restore missing methods.
    let populatedNote = this.sequencerNoteService.createSequencerNote(
      note.id,
      note.baseNoteId,
      note.instrumentId,
      note.isRest,
      note.duration,
      note.position
    );

    this._notes.push(populatedNote);
  }

  private deleteNote(id: number) {
    let index = this._notes.findIndex(ns => ns.id === id);
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
          this.updateNotesObservable();
        });
    } else {
      this.insertNote(note);
      this.updateNotesObservable();
    }
  }

  updateNote(note: SequencerNote, broadcast = true) {
    if (note == null) return;

    if (this.hasNote(note)) {
      this.deleteNote(note.id);
    }

    this.insertNote(note);
    this.updateNotesObservable();

    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_update, note);
    }
  }

  removeNote(id: number, broadcast = true) {
    if (id == null) return;

    this.deleteNote(id);
    this.updateNotesObservable();

    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_delete, id);
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

  private updateNotesObservable() {
    this.notes$.next(this._notes);
    this.sequencerNoteService.setNotes(this._notes);
  }
}
