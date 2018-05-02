import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SequencerService, StaffService} from '@core/services';
import {Observable} from "rxjs/Observable";
import {ScoreState} from "@core/models";

@Component({
  selector: 'app-sequencer-footer',
  templateUrl: './sequencer-footer.component.html',
  styleUrls: ['./sequencer-footer.component.css']
})
export class SequencerFooterComponent implements OnInit, AfterViewInit {

  collapsed: boolean = false;

  scoreState$: Observable<ScoreState>;

  constructor(public staffService: StaffService,
              private sequencerService: SequencerService,
              private changeDetectionRef: ChangeDetectorRef) {
    this.scoreState$ = this.staffService.scoreState$;
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.changeDetectionRef.detectChanges();
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  play() {
    this.staffService.play();
  }

  pause() {
    this.staffService.pause();
  }

  stop() {
    this.staffService.stop();
  }

  goPrevPage() {
    this.staffService.goPrevPage();
  }

  goNextPage() {
    this.staffService.goNextPage();
  }

}
