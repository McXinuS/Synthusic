import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  visible: Map<string, boolean> = new Map();

  constructor() {
  }

  ngOnInit() {
  }

  showNav(tab) {
    let curState = this.visible.get(tab);
    this.visible.clear();
    this.visible.set(tab, !curState);
  }
}
