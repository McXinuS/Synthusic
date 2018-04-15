import {Component, Input, OnInit} from '@angular/core';
import {ErrorPopupData} from '@core/models';

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.css']
})
export class ErrorPopupComponent implements OnInit {

  // TODO insert exclamation mark or error sign

  @Input() data: ErrorPopupData;

  constructor() { }

  ngOnInit() {
  }

}
