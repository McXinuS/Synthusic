import { Component, OnInit } from '@angular/core';
import {InstrumentService} from '../shared/instrument/instrument.service';
import {SequencerService} from "../shared/sequencer/sequencer.service";
import {SequencerNote} from "../shared/sequencer/sequencernote.model";

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit {
  notes: SequencerNote[] = [];
  instrumentCollapsed: boolean[] = [];

  constructor(private instrumentService: InstrumentService,
              private sequencerService: SequencerService) { }

  ngOnInit() {
    this.notes = this.sequencerService.notes$;
  }

  onInstrumentCollapse(id: number) {
    this.instrumentCollapsed[id] = true;
  }
}
