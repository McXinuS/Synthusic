import {Component, Input, OnInit} from '@angular/core';
import {PopupType, TextPopupData} from '@core/models';

@Component({
  selector: 'app-text-popup',
  templateUrl: './text-popup.component.html',
  styleUrls: ['./text-popup.component.css']
})
export class TextPopupComponent implements OnInit {

  @Input() data: TextPopupData;

  get isError() {
    return this.data.type === PopupType.error;
  }

  constructor() { }

  ngOnInit() {
  }

}
