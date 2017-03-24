import {Component, OnInit} from '@angular/core';
import {InstrumentService} from '../shared/instrument/instrument.service';
import {SequencerService} from "../shared/sequencer/sequencer.service";
import {NoteDurationEnum, SequencerNote} from "../shared/sequencer/sequencernote.model";
import {Instrument} from "../shared/instrument/instrument.model";
import {Observable} from "rxjs";
import {Bar} from "../shared/sequencer/bar.model";

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit {

  /**
   * map of all notes, split by their instrument
   * array of notes, split by their position
   * @type {Map<any, any>}
   */
  notes: Map<number, Map<number, Array<SequencerNote>>> = new Map();
  instruments: Observable<Array<Instrument>>;
  bars: Array<Bar>;

  readonly InitialBarWidth = 100;
  readonly BarWidthMultiplier = 20; // shows dependency of bar's width from minimal duration of its notes

  constructor(private instrumentService: InstrumentService,
              private sequencerService: SequencerService) {
    this.bars = [];
  }

  ngOnInit() {
    for (let i = 0; i < this.sequencerService.BarCount; i++) {
      this.bars[i] = new Bar(i, this.InitialBarWidth);
    }
    this.bars[0].isFirst = true;
    this.bars[this.sequencerService.BarCount - 1].isLast = true;

    this.instruments = this.instrumentService.instruments$;
    this.instruments.subscribe(instruments => {
      for (let instrument of instruments) {
        if (!(this.notes.has(instrument.id))) {
          this.notes.set(instrument.id, new Map());
        }
      }
    });
    this.sequencerService.notes$.subscribe(this.onNotesUpdated.bind(this));
  }

  // TODO optimize: don't change array if no note is replaced
  onNotesUpdated(notes) {
    this.notes.forEach(insMap => insMap.clear());
    this.notes.clear();
    let insNotes,
      barNotes;
    for (let note of notes) {
      insNotes = this.notes.get(note.instrumentId);
      if (!(insNotes.has(note.position.bar))) {
        insNotes.set(note.position.bar, []);
      }
      barNotes = insNotes.get(note.position.bar);
      barNotes.push(note);
    }
    this.updateBars(notes);
  }

  updateBars(notes: SequencerNote[]) {
    let widthMin = [];
    for (let i = 0; i < this.sequencerService.BarCount; i++) {
      widthMin[i] = NoteDurationEnum.Whole
    }
    for (let note of notes) {
      if (note.duration.baseDuration !== NoteDurationEnum.Infinite
        && widthMin[note.position.bar] > note.duration.baseDuration) {
        widthMin[note.position.bar] = note.duration.baseDuration;
      }
    }

    for (let bar of this.bars) {
      bar.width = this.InitialBarWidth + this.BarWidthMultiplier / widthMin[bar.index];
    }
  }
}
