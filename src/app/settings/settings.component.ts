import {Component, OnInit, Input} from '@angular/core';
import {SequencerService} from "../shared/sequencer/sequencer.service";
import {SoundService} from "../shared/sound/sound.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  constructor(private sequencerService: SequencerService,
              private soundService: SoundService) { }

  ngOnInit() {
  }

}
