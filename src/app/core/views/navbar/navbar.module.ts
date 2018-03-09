import { NgModule } from '@angular/core';
import {NavbarComponent} from './navbar.component';
import {NavbarContentHolderComponent} from './navbar-content-holder';
import {AboutComponent} from './about';
import {RoomComponent} from './room';
import {SettingsComponent} from './settings';
import {SharedModule} from '@shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    NavbarComponent,
    NavbarContentHolderComponent,
    AboutComponent,
    RoomComponent,
    SettingsComponent
  ],
  exports: [
    NavbarComponent
  ]
})
export class NavbarModule { }
