import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {InstrumentService, SequencerService, StaffService} from '@core/services';
import {Instrument} from '@core/models';

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('staff') private staffContainer: ElementRef;

  collapsed: boolean[] = [];

  instruments$: Observable<Array<Instrument>>;
  notationSVG$: Observable<Array<string>>;

  notes: NodeListOf<Element>;
  rests: NodeListOf<Element>;

  constructor(private instrumentService: InstrumentService,
              private staffService: StaffService,
              private sequencerService: SequencerService) {
  }

  ngOnInit() {
    this.notationSVG$ = this.staffService.notation$;
    this.instruments$ = this.instrumentService.instruments$;
  }

  ngAfterViewInit() {
    this.onResize();
  }

  ngAfterViewChecked() {
    this.updateStaffEventListeners();
  }

  onResize() {
    if (this.staffContainer) {
      this.staffService.onResize(this.staffContainer.nativeElement.clientWidth);
    }
  }

  getNotes() {
    return document.querySelectorAll('g.note');
  }

  getRests() {
    return document.querySelectorAll('g.rest');
  }

  onNoteClicked(id: string) {
    alert('Note is clicked');
  }

  onRestClicked(id: string) {
    // this.sequencerService.addNote()
  }

  setNoteEventListeners(notes) {
    if (!notes) return;
    for (let i = 0; i < notes.length; i++) {
      notes[i].addEventListener('click', this.onNoteClicked.bind(this, notes[i].id));
    }
  }

  removeNoteEventListeners(notes) {
    if (!notes) return;
    for (let i = 0; i < notes.length; i++) {
      notes[i].removeEventListener('click');
    }
  }

  setRestEventListeners(rests) {
    if (!rests) return;
    for (let i = 0; i < rests.length; i++) {
      rests[i].addEventListener('click', this.onRestClicked.bind(this, rests[i].id));
    }
  }

  removeRestEventListeners(rests) {
    if (!rests) return;
    for (let i = 0; i < rests.length; i++) {
      rests[i].removeEventListener('click');
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
}
