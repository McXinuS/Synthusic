import {Component, OnInit} from '@angular/core';
import {NavbarService} from '@core/services';
import {ChatMessage} from '@core/models';
import {Observable} from 'rxjs/Observable';
import {User} from '@shared-global/models';
import {fadeCornerAnimation} from "@shared/animations";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [fadeCornerAnimation],
})
export class NavbarComponent implements OnInit {

  newChatMessages: boolean;

  isOffline$: Observable<boolean>;
  currentUser: User;

  constructor(private navbarService: NavbarService) {
    this.isOffline$ = this.navbarService.isOffline$;

    this.navbarService.currentUser$.subscribe(cu => this.currentUser = cu);
    this.navbarService.messages$.subscribe(messages => {
      this.onMessagesUpdated(messages);
    });
  }

  ngOnInit() {
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

  getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

  reloadPage() {
    location.reload();
  }

  onClickOutside() {
    this.navbarService.hideAll();
  }
}
