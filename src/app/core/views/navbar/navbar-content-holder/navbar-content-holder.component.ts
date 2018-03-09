import { Component, OnInit } from '@angular/core';
import {NavbarService} from '@core/services';
import {fadeInAnimation} from '@shared/animations';

@Component({
  selector: 'app-navbar-content-holder',
  templateUrl: './navbar-content-holder.component.html',
  styleUrls: ['./navbar-content-holder.component.css'],
  animations: [fadeInAnimation],
})
export class NavbarContentHolderComponent implements OnInit {

  constructor(private navbarService: NavbarService) { }

  ngOnInit() {
  }

  isVisible(tab: string) {
    return this.navbarService.isVisible(tab);
  }

}
