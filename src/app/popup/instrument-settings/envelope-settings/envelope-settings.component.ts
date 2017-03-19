import {Component, Input} from '@angular/core';
import {InstrumentService} from "../../../shared/instrument/instrument.service";
import {Instrument} from "../../../shared/instrument/instrument.model";

// TODO: visualize envelope

@Component({
  selector: 'app-envelope-settings',
  templateUrl: './envelope-settings.component.html',
  styleUrls: ['./envelope-settings.component.css']
})
export class EnvelopeSettingsComponent {
  @Input() instrument: Instrument;
  @Input() popupScrollTop: number;

  constructor(private instrumentService: InstrumentService) {
  }

  updateEnvelopeConfig(type: string, value: number) {
    this.instrumentService.updateEnvelope(this.instrument.id, type, value);
  }
}
