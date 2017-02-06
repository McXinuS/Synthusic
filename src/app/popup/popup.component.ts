import { Component, OnInit } from '@angular/core';
import {PopupService} from "../shared/popup/popup.service";

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

  constructor(private popupService: PopupService) { }

  ngOnInit() {
  }

  close(event?: Event) {
    console.log(event);
    this.popupService.close();
  }
}
