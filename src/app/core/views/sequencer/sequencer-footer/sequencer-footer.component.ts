import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SequencerService, StaffService} from '@core/services';

@Component({
  selector: 'app-sequencer-footer',
  templateUrl: './sequencer-footer.component.html',
  styleUrls: ['./sequencer-footer.component.css']
})
export class SequencerFooterComponent implements OnInit, AfterViewInit {

  collapsed: boolean = false;

  constructor(public staffService: StaffService,
              private sequencerService: SequencerService,
              private changeDetectionRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.changeDetectionRef.detectChanges();
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
    this.staffService.goPrevPage();
  }

  goNextPage() {
    this.staffService.goNextPage();
  }

}
