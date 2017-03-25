import { Component, OnInit } from '@angular/core';
import {InstrumentService} from "../../shared/instrument/instrument.service";
import {Instrument} from "../../shared/instrument/instrument.model";
import {PopupService} from "../../shared/popup/popup.service";

@Component({
  selector: 'div[app-sequencer-instrument-create]',
  templateUrl: './sequencer-instrument-create.component.html',
  styleUrls: ['./sequencer-instrument-create.component.css']
})
export class SequencerInstrumentCreateComponent implements OnInit {

  waitingForInstrument: boolean = false;

  constructor(private instrumentService: InstrumentService,
              private popupService: PopupService) { }

  ngOnInit() {
  }

  openCreateDialog() {
    this.waitingForInstrument = true;
    this.instrumentService.createInstrument()
      .then((instrument) => {
        if (instrument) {
          this.popupService.showInstrument(instrument);
        }
      });
    this.waitingForInstrument = false;
  }
}
