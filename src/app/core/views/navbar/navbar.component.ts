import {Component, OnInit} from '@angular/core';
import {NavbarService} from '@core/services';
import {ChatMessage} from '@core/models';
import {Observable} from 'rxjs/Observable';
import {User} from '@shared-global/models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {

  newChatMessages: boolean;

  isOffline$: Observable<boolean>;
  currentUser: User;
  anyTabVisible$: Observable<boolean>;

  constructor(private navbarService: NavbarService) {
    this.isOffline$ = this.navbarService.isOffline$;
    this.anyTabVisible$ = this.navbarService.anyTabVisible$;

    this.navbarService.currentUser$.subscribe(cu => this.currentUser = cu);
    this.navbarService.messages$.subscribe(messages => {
      this.onMessagesUpdated(messages);
    });
  }

  ngOnInit() {
  }

  showNav(tab: string) {
    this.navbarService.showNav(tab);
    if (tab === 'room') {
      this.newChatMessages = false;
    }
  }

  isVisible(tab: string) {
    return this.navbarService.isVisible(tab);
  }

  /**
   * Show the user new chat message indicator if the last message wasn't sent by him.
   */
  onMessagesUpdated(messages: ChatMessage[]) {
    if (!messages || messages.length === 0) return;

    let lastMsgSender = messages[messages.length - 1].sender;

    // Tell user about new message
    if (lastMsgSender !== this.currentUser.id
        && !this.isVisible('room')) {
      this.newChatMessages = true;
    }

  }

  reloadPage() {
    location.reload();
  }
}
