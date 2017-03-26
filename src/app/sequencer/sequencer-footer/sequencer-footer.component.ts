import { Component, OnInit } from '@angular/core';
import {SequencerService} from "../../shared/sequencer/sequencer.service";

@Component({
  selector: 'div[app-sequencer-footer]',
  templateUrl: './sequencer-footer.component.html',
  styleUrls: ['./sequencer-footer.component.css']
})
export class SequencerFooterComponent implements OnInit {

  collapsed: boolean = false;

  constructor(private sequencerService: SequencerService) { }

  ngOnInit() {
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  play() {

  }

  pause() {

  }

  stop() {

  }

  goPrevPage() {
    this.sequencerService.goPrevStaffPage();
  }

  goNextPage() {
    this.sequencerService.goNextStaffPage();
  }

}
