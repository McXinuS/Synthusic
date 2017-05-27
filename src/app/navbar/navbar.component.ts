import {Component, OnInit} from '@angular/core';
import {LoaderService} from '../shared/loader/loader.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  visible: Map<string, boolean> = new Map();
  newChatMessages: boolean;

  constructor(public loaderService: LoaderService) {
  }

  ngOnInit() {
  }

  showNav(tab: string) {
    let curState = this.visible.get(tab);
    this.visible.clear();
    this.visible.set(tab, !curState);

    if (tab === 'room') {
      this.newChatMessages = false;
    }
  }

  isVisible(tab: string) {
    return this.visible.get(tab);
  }

  onNewChatMessage() {
    if (!this.isVisible('room')) {
      this.newChatMessages = true;
    }
  }

  reloadPage() {
    location.reload();
  }
}
