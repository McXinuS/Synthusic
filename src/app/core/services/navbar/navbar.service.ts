import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {LoaderService} from '../loader';
import {RoomService} from '../room';
import {ChatMessage, User} from '@core/models';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class NavbarService {

  isOffline$: Observable<boolean>;
  messages$: Observable<ChatMessage[]>;
  currentUser$: Observable<User>;

  private tabVisibility: Map<string, boolean> = new Map();
  private anyTabVisibleSource: Subject<boolean> = new Subject<boolean>();
  anyTabVisible$: Observable<boolean> = this.anyTabVisibleSource.asObservable();

  constructor(public loaderService: LoaderService,
              private roomService: RoomService) {
    this.isOffline$ = this.loaderService.isOffline$;
    this.messages$ = this.roomService.messages$;
    this.currentUser$ = this.roomService.currentUser$;
  }

  /**
   * Shows selected navbar tab and hides other. If the selected tab is already shown, hide it, too.
   * @param {string} tab Selected tab.
   */
  showNav(tab: string) {
    let visState = this.tabVisibility.get(tab),
      newVisState = !visState;

    this.tabVisibility.clear();
    this.tabVisibility.set(tab, newVisState);

    this.anyTabVisibleSource.next(newVisState);
  }

  isVisible(tab: string): boolean {
    return this.tabVisibility.get(tab);
  }

}
