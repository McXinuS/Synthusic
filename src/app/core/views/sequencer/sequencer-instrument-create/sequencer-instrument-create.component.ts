import { Component, OnInit } from '@angular/core';
import {InstrumentService, PopupService} from "@core/services";
import {Instrument} from "@core/models";

@Component({
  selector: 'div[app-sequencer-instrument-create]',
  templateUrl: './sequencer-instrument-create.component.html',
  styleUrls: ['./sequencer-instrument-create.component.css']
})
export class SequencerInstrumentCreateComponent implements OnInit {

  waitingForInstrument: boolean = false;  // TODO: use this

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
