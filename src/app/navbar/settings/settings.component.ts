import {Component, OnInit} from '@angular/core';
import {SequencerService} from '../../shared/sequencer/sequencer.service';
import {SoundService} from '../../shared/sound/sound.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  masterGainBeforeMute: number = 0;

  constructor(private sequencerService: SequencerService,
              public soundService: SoundService) {
  }

  ngOnInit() {
  }

  toggleMute() {
    if (this.soundService.masterGain > 0) {
      this.masterGainBeforeMute = this.soundService.masterGain;
      this.soundService.masterGain = 0;
    } else {
      this.soundService.masterGain = this.masterGainBeforeMute;
    }
  };
}
