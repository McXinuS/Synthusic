import { Component, OnInit } from '@angular/core';
import {PopupService} from '@core/services';
import {PopupData, PopupType} from '@core/models';
import {fadeInOutAnimation, slideToBottomAnimation} from '@shared/animations';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
  animations: [slideToBottomAnimation, fadeInOutAnimation],
})
export class PopupComponent implements OnInit {

  // Use of observable directly from template
  // with async pipe doesn't work for some reason.
  popupData: PopupData[];

  readonly PopupType = PopupType;

  constructor(public popupService: PopupService) {
    this.popupService.popupData$.subscribe(popupData => this.popupData = popupData);
  }

  ngOnInit() {
  }

  close() {
    this.popupService.onDismiss();
  }
}
