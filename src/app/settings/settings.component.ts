import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @Input() isVisible:boolean;

  constructor() { }

  ngOnInit() {
  }

}
