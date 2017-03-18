import { Component, OnInit } from '@angular/core';
import {InstrumentService} from '../shared/instrument/instrument.service';
import {SequencerService} from "../shared/sequencer/sequencer.service";
import {SequencerNote} from "../shared/sequencer/sequencernote.model";
import {Instrument} from "../shared/instrument/instrument.model";
import {Observable} from "rxjs";

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit {
  notes: Array<Array<SequencerNote>> = [];
  instruments: Observable<Array<Instrument>>;

  constructor(private instrumentService: InstrumentService,
              private sequencerService: SequencerService) { }

  ngOnInit() {
    this.instruments = this.instrumentService.instruments$;
    this.sequencerService.notes$.subscribe((notes: SequencerNote[]) => {
      this.notes.length = 0; // clear source
      for (let note of notes) {
        if (!(this.notes[note.instrumentId] instanceof Array)) {
          this.notes[note.instrumentId] = [];
        }
        this.notes[note.instrumentId].push(note);
      }
    });
  }
}
