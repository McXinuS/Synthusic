import {Component, OnInit} from '@angular/core';
import {SequencerService, SoundService} from '@core/services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../navbar.theme.css']
})
export class SettingsComponent implements OnInit {

  masterGainBeforeMute: number = 0;

  constructor(public sequencerService: SequencerService,
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

  setBpm(bpm: number) {
    this.sequencerService.setBpm(bpm);
  }

}
