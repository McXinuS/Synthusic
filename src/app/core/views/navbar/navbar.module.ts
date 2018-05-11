import { NgModule } from '@angular/core';
import {NavbarComponent} from './navbar.component';
import {AboutComponent} from './about';
import {RoomComponent} from './room';
import {SettingsComponent} from './settings';
import {SharedModule} from '@shared/shared.module';
import {routing} from "@core/views/navbar/navbar.routing";

@NgModule({
  imports: [
    SharedModule,
    routing
  ],
  declarations: [
    NavbarComponent,
    AboutComponent,
    RoomComponent,
    SettingsComponent
  ],
  exports: [
    NavbarComponent
  ]
})
export class NavbarModule { }
