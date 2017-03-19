import {Component, Input} from '@angular/core';
import {Instrument} from '../../shared/instrument/instrument.model';

@Component({
  selector: 'app-instrument-settings',
  templateUrl: './instrument-settings.component.html',
  styleUrls: ['./instrument-settings.component.css']
})
export class InstrumentSettingsComponent {
  @Input() instrument: Instrument;
  @Input() popupScrollTop: number;
}
