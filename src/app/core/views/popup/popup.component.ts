import { Component, OnInit } from '@angular/core';
import {PopupService} from '@core/services';
import {PopupData, PopupType} from '@core/models';
import {fadeInOutAnimation} from "@shared/animations";

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
  animations: [fadeInOutAnimation],
})
export class PopupComponent implements OnInit {

  // Use of observable directly from template
  // with async pipe doesn't work for some reason.
  popupData: PopupData[];

  constructor(public popupService: PopupService) {
    this.popupService.popupData$.subscribe(popupData => this.popupData = popupData);
  }

  ngOnInit() {
  }

  /**
   * Check if the type is NOT being handled by the rouer.
   * If it is, we shouldn't invoke component manually
   * because router will do it for us.
   */
  isNotRouting(type: PopupType) {
    return type !== PopupType.instrument;
  }
}
