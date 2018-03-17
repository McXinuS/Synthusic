import {Component, Input, OnInit} from '@angular/core';
import {LoadingPopupData} from '@core/models';

@Component({
  selector: 'app-loading-popup',
  templateUrl: './loading-popup.component.html',
  styleUrls: ['./loading-popup.component.css']
})
export class LoadingPopupComponent implements OnInit {

  @Input() data: LoadingPopupData;

  constructor() { }

  ngOnInit() {
  }

}
