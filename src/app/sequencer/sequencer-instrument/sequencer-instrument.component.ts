import {Component, OnInit, Input} from '@angular/core';
import {Instrument} from "../../shared/instrument/instrument.model";
import {SequencerNote} from "../../shared/sequencer/sequencernote.model";
import {PopupService} from "../../shared/popup/popup.service";
import {Bar} from "../../shared/sequencer/bar.model";
import {Observable} from "rxjs";

@Component({
  selector: 'app-sequencer-instrument',
  templateUrl: './sequencer-instrument.component.html',
  styleUrls: ['./sequencer-instrument.component.css']
})
export class SequencerInstrumentComponent implements OnInit {
  @Input() instrument: Instrument;
  @Input() notes: Map<number, Array<SequencerNote>>;
  @Input() bars: Bar[];
  isCollapsed: boolean = false;

  constructor(private popupService: PopupService) { }

  ngOnInit() {
    let q = 1;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  openSettings() {
    this.popupService.showInstrument(this.instrument);
  }
}
