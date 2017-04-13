import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {InstrumentService} from '../shared/instrument/instrument.service';
import {SequencerService} from "../shared/sequencer/sequencer.service";
import {Instrument} from "../shared/instrument/instrument.model";
import {Observable} from "rxjs";
import {StaffService} from "../shared/sequencer/staff.service";

@Component({
  selector: 'div[app-sequencer]',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})
export class SequencerComponent implements OnInit, AfterViewInit {

  @ViewChild('staff') private staffContainer: ElementRef;

  collapsed: boolean[] = [];

  instruments$: Observable<Array<Instrument>>;
  notationSVG$: Observable<Array<string>>;

  constructor(private instrumentService: InstrumentService,
              private staffService: StaffService,
              private sequencerService: SequencerService) {
  }

  ngOnInit() {
    this.notationSVG$ = this.staffService.notation$;
    this.instruments$ = this.instrumentService.instruments$;
  }

  ngAfterViewInit() {
    this.onResize();
  }

  onResize() {
    if (this.staffContainer) {
      this.staffService.onResize(this.staffContainer.nativeElement.clientWidth);
    }
  }
}
