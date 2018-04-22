import {Component, Input, OnInit} from '@angular/core';
import {LoadingPopupData, RoomListPopupData} from '@core/models';

@Component({
  selector: 'app-rooms-popup',
  templateUrl: './rooms-popup.component.html',
  styleUrls: ['./rooms-popup.component.css']
})
export class RoomsPopupComponent implements OnInit {

  @Input() data: RoomListPopupData;

  constructor() { }

  ngOnInit() {
  }

}
