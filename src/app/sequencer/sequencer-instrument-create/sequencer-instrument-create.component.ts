import { Component, OnInit } from '@angular/core';
import {InstrumentService} from "../../shared/instrument/instrument.service";
import {Instrument} from "../../shared/instrument/instrument.model";
import {PopupService} from "../../shared/popup/popup.service";

@Component({
  selector: 'app-sequencer-instrument-create',
  templateUrl: './sequencer-instrument-create.component.html',
  styleUrls: ['./sequencer-instrument-create.component.css']
})
export class SequencerInstrumentCreateComponent implements OnInit {

  newInstrument: Instrument;

  constructor(private instrumentService: InstrumentService,
              private popupService: PopupService) { }

  ngOnInit() {
  }

  openCreateDialog() {
    // TODO
    this.newInstrument = new Instrument();
    this.popupService.show(this.newInstrument);
  }

  addInstrument() {
    this.instrumentService.addInstrument(this.newInstrument);
  }
}
