import {Component, Input, OnInit} from '@angular/core';
import {InstrumentPopupData} from '@core/models';

@Component({
  selector: 'app-instrument-popup',
  templateUrl: './instrument-popup.component.html',
  styleUrls: ['./instrument-popup.component.css']
})
export class InstrumentPopupComponent implements OnInit {

  @Input() data: InstrumentPopupData;

  constructor() { }

  ngOnInit() {
  }

}
