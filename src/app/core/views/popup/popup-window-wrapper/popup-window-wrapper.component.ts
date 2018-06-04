import {Component, Input, OnInit} from '@angular/core';
import {PopupData, PopupType} from "@core/models";
import {PopupService} from "@core/services";
import {slideToBottomAnimation} from "@shared/animations";

@Component({
  selector: 'app-popup-window-wrapper',
  templateUrl: './popup-window-wrapper.component.html',
  styleUrls: ['./popup-window-wrapper.component.css'],
  animations: [slideToBottomAnimation],
})
export class PopupWindowWrapperComponent implements OnInit {

  @Input() data: PopupData;

  readonly PopupType = PopupType;

  constructor(public popupService: PopupService) { }

  ngOnInit() {
  }

  close() {
    this.popupService.onDismiss();
  }

}
