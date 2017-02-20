import {Component, OnInit, Input} from '@angular/core';
import {Instrument} from '../../shared/instrument/instrument.model';
import {InstrumentService} from '../../shared/instrument/instrument.service';

@Component({
  selector: 'app-instrument-settings',
  templateUrl: './instrument-settings.component.html',
  styleUrls: ['./instrument-settings.component.css']
})
export class InstrumentSettingsComponent implements OnInit {
  @Input() instrument: Instrument;

  constructor(private instrumentService: InstrumentService) { }

  ngOnInit() {
  }

  updateEnvelopeConfig(type: string, value: number) {
    this.instrumentService.updateEnvelope(this.instrument.id, type, value);
  }
}
