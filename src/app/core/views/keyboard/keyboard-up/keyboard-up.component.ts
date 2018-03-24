import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Instrument} from '@core/models';
import {PopupService} from '@core/services';

@Component({
  selector: 'app-keyboard-up',
  templateUrl: './keyboard-up.component.html',
  styleUrls: ['./keyboard-up.component.css']
})
export class KeyboardUpComponent {

  @Input() instruments: Instrument[];  // array of all instruments
  @Input() activeInstrument: Instrument;  // selected instrument
  @Input() keyboardWidth: number;  // selected instrument
  @Output() instrumentChanged = new EventEmitter();

  constructor(private popupService: PopupService) { }

  openSettings() {
    this.popupService.showInstrument(this.activeInstrument);
  }

  onInstrumentChange() {
    this.instrumentChanged.emit(this.activeInstrument);
  }
}
