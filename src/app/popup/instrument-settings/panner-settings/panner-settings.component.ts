import {Component, OnInit, Input} from '@angular/core';
import {Instrument} from "../../../shared/instrument/instrument.model";

@Component({
  selector: 'app-panner-settings',
  templateUrl: 'panner-settings.component.html',
  styleUrls: ['panner-settings.component.css']
})
export class PannerSettingsComponent implements OnInit {
  @Input() instrument: Instrument;

  constructor() { }

  ngOnInit() {
  }

}
