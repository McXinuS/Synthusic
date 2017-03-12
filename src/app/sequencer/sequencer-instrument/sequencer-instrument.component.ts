import {Component, OnInit, Input} from '@angular/core';
import {Instrument} from "../../shared/instrument/instrument.model";
import {SequencerNote} from "../../shared/sequencer/sequencernote.model";

@Component({
  selector: 'app-sequencer-instrument',
  templateUrl: './sequencer-instrument.component.html',
  styleUrls: ['./sequencer-instrument.component.css']
})
export class SequencerInstrumentComponent implements OnInit {
  @Input() instrument: Instrument;
  notes: SequencerNote[] = [];

  constructor() { }

  ngOnInit() {

  }

}
