import { Component, OnInit } from '@angular/core';
import {PopupService} from '@core/services';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

  constructor(public popupService: PopupService) { }

  ngOnInit() {
  }

  close() {
    this.popupService.close();
  }
}
