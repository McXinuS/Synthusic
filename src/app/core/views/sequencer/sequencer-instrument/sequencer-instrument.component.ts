import {Component, OnInit, Input} from '@angular/core';
import {Instrument} from "@core/models";
import {PopupService} from "@core/services";

@Component({
  selector: 'div[app-sequencer-instrument]',
  templateUrl: './sequencer-instrument.component.html',
  styleUrls: ['./sequencer-instrument.component.css']
})
export class SequencerInstrumentComponent implements OnInit {
  @Input() instrument: Instrument;
  @Input() collapsed: boolean[];

  constructor(private popupService: PopupService) { }

  ngOnInit() {
  }

  toggleCollapse() {
    this.collapsed[this.instrument.id] = !this.collapsed[this.instrument.id];
  }

  openSettings() {
    this.popupService.showInstrument(this.instrument);
  }
}
