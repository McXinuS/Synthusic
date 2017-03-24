import {Component, Input, OnInit} from '@angular/core';
import {Bar} from "../../../shared/sequencer/bar.model";

@Component({
  selector: 'div[app-bar]',
  templateUrl: './sequencer-bar.component.html',
  styleUrls: ['./sequencer-bar.component.css']
})
export class SequencerBarComponent implements OnInit {
  @Input() state: Bar;
  @Input() notes: Bar;

  constructor() { }

  ngOnInit() {
  }

}
