import {Component, OnInit} from '@angular/core';
import {LoaderService, PopupService} from '@core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private loaderService: LoaderService) {
  }

  ngOnInit() {
    this.loaderService.showRoomList();
  }
}
