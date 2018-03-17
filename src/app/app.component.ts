import {Component, OnInit} from '@angular/core';
import {LoaderService, PopupService} from '@core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  popupHeader = 'Application is loading...';
  popupId: number;

  constructor(private loaderService: LoaderService,
              private popupService: PopupService) {
  }

  ngOnInit() {

    this.popupId = this.popupService.showLoader(this.popupHeader, 'Please wait');

    this.loaderService.init(
      msg => this.onProgressChange(msg),
      () => this.onComponentsLoad());
  }

  onProgressChange(message: string) {
    this.popupService.update(this.popupId, this.popupHeader, message);
  }

  onComponentsLoad() {
    this.popupService.close(this.popupId);
  }
}
