import {Component, OnInit} from '@angular/core';
import {LoaderService} from './shared/loader/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loaderMessage = 'Loading...';
  loadDone = false;
  title = 'Simple synthesizer';

  constructor(private loaderService: LoaderService) {
  }

  ngOnInit() {
    this.loaderService.init(
      msg => this.onProgressChange(msg),
      () => this.onComponentsLoad());
  }

  onProgressChange(message: string) {
    this.loaderMessage = message;
  }

  onComponentsLoad() {
    this.loadDone = true;
  }
}
