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
  instrument: Instrument;

  constructor(private instrumentService: InstrumentService,
              private popupService: PopupService) { }

  ngOnInit() {
  }

  async openCreateDialog() {
    try {
      this.waitingForInstrument = true;
      this.instrument = await this.instrumentService.createInstrument();
      this.popupService.showInstrument(this.instrument);
    } catch (e) {

    } finally {
      this.waitingForInstrument = false;
    }
  }
}
