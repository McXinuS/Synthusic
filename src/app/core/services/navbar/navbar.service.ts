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
    this.router.navigate(['']);
  }

  isVisible(tab: string): boolean {
    return this.router.isActive(tab, true);
  }

  isAnyVisible(): boolean {
    return this.router.isActive('about', true) ||
           this.router.isActive('room', true) ||
           this.router.isActive('settings', true);
  }

}
