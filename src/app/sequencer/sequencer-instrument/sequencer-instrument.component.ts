import {Component, OnInit, Input} from '@angular/core';
import {Instrument} from "../../shared/instrument/instrument.model";
import {SequencerNote} from "../../shared/sequencer/sequencernote.model";
import {PopupService} from "../../shared/popup/popup.service";

@Component({
  selector: 'app-sequencer-instrument',
  templateUrl: './sequencer-instrument.component.html',
  styleUrls: ['./sequencer-instrument.component.css']
})
export class SequencerInstrumentComponent implements OnInit {
  @Input() instrument: Instrument;
  @Input() notes: SequencerNote[];
  isCollapsed: boolean = false;

  constructor(private popupService: PopupService) { }

  ngOnInit() {

  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  openSettings() {
    this.popupService.show(this.instrument);
  }
}
