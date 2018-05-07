import {Injectable} from '@angular/core';
import {WebSocketMessageType} from "@shared-global/web-socket-message-types";
import {InstrumentService} from "../instrument";
import {NoteService} from "../note";
import {SequencerNoteService} from "../sequencer";
import {SoundService} from "../sound";
import {WebSocketService} from "../websocket";
import {BaseNote, Instrument, SequencerNote} from "@core/models";
import {KeyChangeMode} from "@core/views/keyboard/key";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";

@Injectable()
export class KeyboardService {

  private readonly notes: BaseNote[];     // array of all base notes (frequency and name)
  private playingNotes: SequencerNote[];  // array of all playing notes of application
  private activeInstrument: Instrument;

  private miniMode: boolean;

  private selections: boolean[];
  private highlights: boolean[];
  private touches: BaseNote[] = []; // note that is pointed by the touch
  private touchOff: Boolean[] = []; // if true, the touch got off the key to another


  private readonly instrumentsSource: Subject<Instrument[]> = new BehaviorSubject([]);
  /**
   * Array of all instruments
   */
  readonly instruments$: Observable<Instrument[]> = this.instrumentsSource.asObservable();


  private readonly activeInstrumentSource: Subject<Instrument> = new BehaviorSubject(null);
  /**
   * Selected instrument.
   */
  readonly activeInstrument$: Observable<Instrument> = this.activeInstrumentSource.asObservable();


  private readonly notesSource: Subject<BaseNote[]> = new BehaviorSubject([]);
  /**
   * Array of notes of current instrument.
   */
  readonly notes$: Observable<BaseNote[]> = this.notesSource.asObservable();


  private readonly highlightsSource: Subject<boolean[]> = new BehaviorSubject([]);
  /**
   * Playing notes of active instrument.
   */
  readonly highlights$: Observable<boolean[]> = this.highlightsSource.asObservable();


  private readonly selectionsSource: Subject<boolean[]> = new BehaviorSubject([]);
  /**
   * Is key touched / right-clicked (has user focus on the key).
   */
  readonly selections$: Observable<boolean[]> = this.selectionsSource.asObservable();


  private readonly miniModeSource: Subject<boolean> = new BehaviorSubject(false);
  /**
   * Shows if the keyboard has been minimized
   */
  readonly miniMode$: Observable<boolean> = this.miniModeSource.asObservable();


  constructor(private noteService: NoteService,
              private soundService: SoundService,
              private sequencerNoteService: SequencerNoteService,
              private instrumentService: InstrumentService,
              private webSocketService: WebSocketService) {

    this.notes = this.noteService.notes;
    this.notesSource.next(this.noteService.notes);

    this.soundService.playingNotes$.subscribe(this.onPlayingNotesUpdated.bind(this));

    this.instrumentService.instruments$.subscribe(this.onInstrumentsUpdated.bind(this));

    this.webSocketService.registerHandler(WebSocketMessageType.enter_room, this.onRoomChanged.bind(this));

  }

  private updateHighlight() {
    this.highlights = [];

    let playing = this.playingNotes;
    for (let i = 0; i < playing.length; i++) {
      if (playing[i].instrumentId == this.activeInstrument.id) {
        this.highlights[playing[i].baseNoteId] = true;
      }
    }

    this.highlightsSource.next(this.highlights);
  }

  private onPlayingNotesUpdated(playingNotes: SequencerNote[]) {
    this.playingNotes = playingNotes;
    this.updateHighlight();
  }

  private onInstrumentsUpdated(instruments: Instrument[]) {

    // Change active instrument to the first in the list if the previous one isn't available.
    const instrumentRemoved = this.activeInstrument && this.instrumentService.getInstrument(this.activeInstrument.id) == null;
    const instrumentNotSet = !this.activeInstrument;
    if (instrumentNotSet || instrumentRemoved) {
      this.setActiveInstrument(instruments[0]);
    }

    this.instrumentsSource.next(instruments);
  }

  private onRoomChanged() {
    this.activeInstrument = null;
  }

  setActiveInstrument(ai: Instrument) {
    this.activeInstrument = ai;
    this.activeInstrumentSource.next(this.activeInstrument);
    this.updateHighlight();
  }

  onMiniChange(e: MouseEvent) {
    if (e.buttons === 1) this.miniMode = !this.miniMode;
    this.miniModeSource.next(this.miniMode);
  }


  private playNote(basenote: BaseNote) {
    if (!this.activeInstrument) return;
    let note = this.sequencerNoteService.getDimSequencerNote(basenote.id, this.activeInstrument.id);
    this.soundService.playNote(note);
  }

  private stopNote(basenote: BaseNote) {
    if (!this.activeInstrument) return;
    let note = this.sequencerNoteService.getDimSequencerNote(basenote.id, this.activeInstrument.id);
    this.soundService.stopNote(note);
  }

  onKeyStateUpdated(e) {
    switch (e.mode) {
      case KeyChangeMode.play:
        this.playNote(e.note);
        return;
      case KeyChangeMode.stop:
        this.stopNote(e.note);
        return;
    }
  }

  private setSelection(id:number, value: boolean) {
    this.selections[id] = value;
    this.selectionsSource.next(this.selections);
  }

  onTouchStart(e: TouchEvent) {
    let touches = e.changedTouches;
    if (touches.length == 0) return;

    e.preventDefault();
    let touch: Touch,
      note: BaseNote,
      touchId: number;

    for (let i = 0; i < touches.length; i++) {
      touch = touches[i];
      touchId = touch.identifier;
      note = this.getTouchNote(touch);
      if (note != null) {
        this.setSelection(note.id, true);
        this.touches[touchId] = note;
        this.touchOff[touchId] = this.isNotePlaying(note);
        if (!this.isNotePlaying(note)) {
          this.playNote(note);
        }
      }
    }
  }

  onTouchMove(e: TouchEvent) {
    let touches = e.changedTouches;
    if (touches.length == 0) return;

    e.preventDefault();

    let touch: Touch,
      curNote: BaseNote,
      prevNote: BaseNote,
      touchId: number;

    for (let i = 0; i < touches.length; i++) {
      touch = touches[i];
      touchId = touch.identifier;
      curNote = this.getTouchNote(touch);
      prevNote = this.touches[touchId];

      if (curNote != null
        && (prevNote == null
          || (prevNote != null && curNote.id !== prevNote.id))) {

        // touch has moved to another key
        this.stopNote(prevNote);
        this.playNote(curNote);
        this.touchOff[touchId] = true;
        this.touches[touchId] = curNote;

      } else if (curNote == null && prevNote != null) {

        // touch is not on keyboard
        this.stopNote(prevNote);
        this.touchOff[touchId] = true;

      }

      // update keyboard's keys
      if (curNote != null) this.setSelection(curNote.id, true);
      if (prevNote != null) this.setSelection(prevNote.id, false);
    }
  }

  onTouchEnd(e: TouchEvent) {
    let touches = e.changedTouches;
    if (touches.length == 0) return;

    e.preventDefault();

    let touch: Touch,
      firstNote: BaseNote,
      curNote: BaseNote,
      touchId: number;

    for (let i = 0; i < touches.length; i++) {
      touch = touches[i];
      touchId = touch.identifier;
      firstNote = this.getTouchNote(touch, true);
      curNote = this.getTouchNote(touch);

      if (curNote != null) {
        this.setSelection(curNote.id, false);
        if (this.touchOff[touchId]) {
          this.stopNote(curNote);
        }
        this.touches[touch.identifier] = null;
      }
    }
  }

  onTouchCancel(e: TouchEvent) {
    let touches = e.changedTouches;
    if (touches.length == 0) return;

    e.preventDefault();

    let touch: Touch,
      note: BaseNote;

    for (let i = 0; i < touches.length; i++) {
      touch = touches[i];
      note = this.getTouchNote(touch);

      if (typeof note === 'object') {
        this.setSelection(note.id, false);
        this.stopNote(note);
        this.touches[touch.identifier] = null;
      }
    }
  }

  private getTouchNote(touch: Touch, firstNote = false): BaseNote {
    let target: Element;

    if (firstNote) {
      // Get target as 'touch.target' (property contains ref to element, where the touch began)
      target = touch.target as Element;
    } else {
      // Get current target element
      target = document.elementFromPoint(touch.clientX, touch.clientY);
    }

    let id: number = null;

    while ((isNaN(id) || id == null) && target != null) {
      id = parseInt(target.getAttribute('data-note-id'), 10);
      target = target.parentElement;
    }

    return (isNaN(id) || id == null) ? null : this.notes[id];
  }

  private isNotePlaying(note: BaseNote) {
    return this.highlights[note.id];
  }

}
