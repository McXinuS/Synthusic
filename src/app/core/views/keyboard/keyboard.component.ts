import {
  AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit,
  ViewChild
} from '@angular/core';
import {BaseNote, Instrument, SequencerNote} from '@core/models';
import {NoteService, SoundService, InstrumentService, SequencerNoteService} from '@core/services';
import {KeyChangeMode} from './key';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit, AfterViewChecked {

  instruments: Instrument[];  // array of all instruments
  activeInstrument: Instrument;  // selected instrument

  notes: BaseNote[];  // array of notes of current instrument
  playingNotes: SequencerNote[]; // array of all playing notes of application

  highlights: boolean[];      // playing notes of active instrument
  selections: boolean[] = []; // is key touched / right-clicked (has user focus on the key)

  miniMode: boolean = false;  // shows if the keyboard has been minimized

  touches: BaseNote[] = []; // note that is pointed by the touch
  touchOff: Boolean[] = []; // if true, the touch got off the key to another

  @ViewChild('keyboardKeys') keyboardKeys: ElementRef;
  keyboardWidth: number;

  constructor(private noteService: NoteService,
              private soundService: SoundService,
              private sequencerNoteService: SequencerNoteService,
              private instrumentService: InstrumentService,
              private zone: NgZone) {
  }

  ngOnInit() {
    this.notes = this.noteService.notes;

    this.soundService.playingNotes$.subscribe(notes => this.onPlayingNotesUpdated(notes));

    this.instrumentService.instruments$.subscribe(instruments => this.onInstrumentsUpdated(instruments));
  }

  /**
   * Pass keyboard scroll width to keyboard-up component.
   */
  ngAfterViewChecked() {
    let newWidth = this.keyboardKeys.nativeElement.scrollWidth;

    if (this.keyboardWidth !== newWidth) {

      // Not possible to use direct assign as Angular
      //  throws 'Expression has changed after checking...' error.
      // We don't want Angular to loop change detection over and over
      //  so use NgZone instead of setTimeout.
      this.zone.runOutsideAngular(() => {
        this.keyboardWidth = newWidth;
      });
    }
  }

  onPlayingNotesUpdated(playingNotes: SequencerNote[]) {
    this.playingNotes = playingNotes;
    this.updateHighlight();
  }

  onInstrumentsUpdated(instruments: Instrument[]) {
    this.instruments = instruments;
    if (this.activeInstrument && this.instrumentService.getInstrument(this.activeInstrument.id) == null) {
      this.activeInstrument = null;
    }
    if (!this.activeInstrument) {
      this.activeInstrument = this.instruments[0];
    }
  }

  updateHighlight() {
    this.highlights = [];
    let playing = this.playingNotes;
    for (let i = 0; i < playing.length; i++) {
      if (playing[i].instrumentId == this.activeInstrument.id) {
        this.highlights[playing[i].baseNoteId] = true;
      }
    }
  }

  onInstrumentChange(instrument: Instrument) {
    this.activeInstrument = instrument;
    this.updateHighlight();
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

  playNote(basenote: BaseNote) {
    if (!this.activeInstrument) return;
    let note = this.sequencerNoteService.getDimSequencerNote(basenote.id, this.activeInstrument.id);
    this.soundService.playNote(note);
  }

  stopNote(basenote: BaseNote) {
    if (!this.activeInstrument) return;
    let note = this.sequencerNoteService.getDimSequencerNote(basenote.id, this.activeInstrument.id);
    this.soundService.stopNote(note);
  }

  onMiniChange(e) {
    if (e.which === 1) this.miniMode = !this.miniMode;
  }

  /* Touch events handlers */

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
        this.selections[note.id] = true;
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
      if (curNote != null) this.selections[curNote.id] = true;
      if (prevNote != null) this.selections[prevNote.id] = false;
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
        this.selections[curNote.id] = false;
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
        this.selections[note.id] = false;
        this.stopNote(note);
        this.touches[touch.identifier] = null;
      }
    }
  }

  getTouchNote(touch: Touch, firstNote = false): BaseNote {
    let target: Element;

    if (firstNote) {
      // 'touch.target' is an element, where touch began
      target = touch.target as Element;
    } else {
      // get current target element
      target = document.elementFromPoint(touch.clientX, touch.clientY);
    }

    let id: number = null;

    while ((isNaN(id) || id == null) && target != null) {
      id = parseInt(target.getAttribute('data-note-id'), 10);
      target = target.parentElement;
    }

    return (isNaN(id) || id == null) ? null : this.notes[id];
  }

  isNotePlaying(note: BaseNote) {
    return this.highlights[note.id];
  }
}
