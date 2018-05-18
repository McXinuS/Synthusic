import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {PopupService} from "@core/services";
import {PopupData} from "@core/models";

@Component({
  selector: 'app-routed-popup-window-wrapper',
  templateUrl: './routed-popup-window-wrapper.component.html',
  styleUrls: ['./routed-popup-window-wrapper.component.css']
})
export class RoutedPopupWindowWrapperComponent implements OnInit {

  data: PopupData;

  constructor(public popupService: PopupService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.data.subscribe(data => this.data = data.popupData);
  }

}
