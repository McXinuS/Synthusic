import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {InstrumentService, SequencerNoteService, SequencerService, SoundService, StaffService} from '@core/services';
import {Instrument, SequencerNoteSettingsState} from '@core/models';
import {Point, SequencerNote} from "@shared-global/models";

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('staff') private staffContainer: ElementRef;

  collapsed: boolean[] = [];

  noteSettingsState$: Observable<SequencerNoteSettingsState>;

  instruments$: Observable<Array<Instrument>>;
  notationSVG$: Observable<Array<string>>;

  // Save references to remove event handlers when dom changes
  notes: NodeListOf<Element>;
  rests: NodeListOf<Element>;

  playingNotes: Element[] = [];
  readonly PlayingNoteClass = 'playing';

  constructor(private instrumentService: InstrumentService,
              private staffService: StaffService,
              private sequencerService: SequencerService,
              private sequencerNoteService: SequencerNoteService,
              private soundService: SoundService) {
    this.staffService.playing$.subscribe(this.onPlayingChanged.bind(this));
  }

  ngOnInit() {
    this.notationSVG$ = this.staffService.notation$;
    this.noteSettingsState$ = this.sequencerService.noteSettingsState$;
    this.instruments$ = this.instrumentService.instruments$;
  }

  ngAfterViewInit() {
    this.onResize();
  }

  ngAfterViewChecked() {
    this.updateStaffEventListeners();
  }

  // Update highlight of playing notes.
  onPlayingChanged(notes: SequencerNote[]) {

    // Remove previous highlight
    for (let el of this.playingNotes) {
      el.classList.remove(this.PlayingNoteClass);
    }

    this.playingNotes = [];

    // Add new highlight
    for (let note of notes) {
      let el = this.getNote(note.id);
      el.classList.add(this.PlayingNoteClass);
      this.playingNotes.push(el);
    }
  }

  onResize() {
    if (this.staffContainer) {
      this.staffService.onResize(this.staffContainer.nativeElement.clientWidth);
    }
  }

  /* Events */

  getNote(id: number): Element {
    return document.getElementById(id.toString());
  }

  getNotes(): NodeListOf<Element> {
    return document.querySelectorAll('g.note');
  }

  getRests(): NodeListOf<Element> {
    return document.querySelectorAll('g.rest');
  }

  onNoteClicked(id: string, e: MouseEvent) {
    let note = this.getSequencerNote(id);

    // this.playNote(note);
    this.showNoteSettings(e, note);
  }

  onRestClicked(id: string) {
    let note = this.getSequencerNote(id);
    this.addNote(note);
  }

  setNoteEventListeners(notes) {
    if (!notes) return;
    for (let i = 0; i < notes.length; i++) {
      notes[i].onclick = this.onNoteClicked.bind(this, notes[i].id);
    }
  }

  removeNoteEventListeners(notes) {
    if (!notes) return;
    for (let i = 0; i < notes.length; i++) {
      notes[i].onclick = null;
    }
  }

  setRestEventListeners(rests) {
    if (!rests) return;
    for (let i = 0; i < rests.length; i++) {
      rests[i].onclick = this.onRestClicked.bind(this, rests[i].id);
    }
  }

  removeRestEventListeners(rests) {
    if (!rests) return;
    for (let i = 0; i < rests.length; i++) {
      rests[i].onclick = null;
    }
  }

  updateStaffEventListeners() {
    this.removeNoteEventListeners(this.notes);
    this.removeRestEventListeners(this.rests);
    this.notes = this.getNotes();
    this.rests = this.getRests();
    this.setNoteEventListeners(this.notes);
    this.setRestEventListeners(this.rests);
  }

  /* Actions */

  playNote(note: SequencerNote) {
    this.soundService.playNote(note);
  }

  addNote(note: SequencerNote) {
    this.sequencerService.addNote(note);
  }

  getSequencerNote(svgId: string): SequencerNote {
    return this.sequencerNoteService.getNoteById(svgId);
  }

  /* Note settings */

  showNoteSettings(e: MouseEvent, note: SequencerNote) {

    let mouseLoc = new Point();
    mouseLoc.x  = e.clientX + 20;
    mouseLoc.y  = e.clientY - 30;

    this.sequencerService.showNoteSettings(note, mouseLoc);
  }

  hideNoteSettings(target: HTMLElement) {
    // Don't hide settings window if staff element has been clicked
    const insideStaff = this.staffContainer.nativeElement.contains(target),
      parentIsStaffElement = target.parentElement.tagName === 'g';

    if (!(insideStaff && parentIsStaffElement)) {
      this.sequencerService.hideNoteSettings();
    }
  }
}
