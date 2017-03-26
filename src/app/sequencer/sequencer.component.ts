import {Component, OnInit} from '@angular/core';
import {InstrumentService} from '../shared/instrument/instrument.service';
import {SequencerService} from "../shared/sequencer/sequencer.service";
import {Instrument} from "../shared/instrument/instrument.model";
import {Observable} from "rxjs";

@Component({
  selector: 'div[app-sequencer]',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit {

  collapsed: boolean[] = [];

  instruments$: Observable<Array<Instrument>>;
  notationSVG: Array<string>;

  constructor(private instrumentService: InstrumentService,
              private sequencerService: SequencerService) {
  }

  ngOnInit() {
    this.notationSVG = this.sequencerService.notation;
    this.instruments$ = this.instrumentService.instruments$;
  }

  onResize(event) {
    this.sequencerService.onStaffResize(event.target.innerWidth);
  }
}
