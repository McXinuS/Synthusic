import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {LoaderService} from '../loader';
import {RoomService} from '../room';
import {ChatMessage, User} from '@core/models';
import {Subject} from 'rxjs/Subject';
import {Router} from "@angular/router";

@Injectable()
export class NavbarService {

  isOffline$: Observable<boolean>;
  messages$: Observable<ChatMessage[]>;
  currentUser$: Observable<User>;

  constructor(public loaderService: LoaderService,
              private roomService: RoomService,
              private router: Router) {
    this.isOffline$ = this.loaderService.isOffline$;
    this.messages$ = this.roomService.messages$;
    this.currentUser$ = this.roomService.currentUser$;
  }

  hideAll() {
    if (this.isAnyVisible()) {
      this.router.navigate([{ outlets: { navbar: null }}]);
    }
  }

  isVisible(tab: string): boolean {
    return this.router.isActive(tab, true);
  }

  isAnyVisible(): boolean {
    return this.router.isActive('(navbar:about)', false) ||
      this.router.isActive('(navbar:room)', false) ||
      this.router.isActive('(navbar:settings)', false);
  }

}
