// TODO: lazy load

import {Component, Input} from '@angular/core';
import {Instrument} from '@core/models';

@Component({
  selector: 'app-instrument-settings',
  templateUrl: './instrument-settings.component.html',
  styleUrls: ['./instrument-settings.component.css']
})
export class InstrumentSettingsComponent {
  @Input() instrument: Instrument;
  @Input() popupScrollTop: number;
}
