import { Component, OnInit } from '@angular/core';
import {InstrumentService} from '../shared/instrument/instrument.service';

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit {

  constructor(private instrumentService: InstrumentService) { }

  ngOnInit() {
  }

}
