import {Component, OnInit, Input} from '@angular/core';
import {Instrument} from "../../shared/instrument/instrument.model";

@Component({
  selector: 'app-instrument-settings',
  templateUrl: './instrument-settings.component.html',
  styleUrls: ['./instrument-settings.component.css']
})
export class InstrumentSettingsComponent implements OnInit {
  @Input() instrument: Instrument;

  constructor() { }

  ngOnInit() {
  }

  updateEnveloper() {

  }
}
