import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import {AboutComponent} from './about';
import {RoomComponent} from './room';
import {SettingsComponent} from './settings';

export const routing: ModuleWithProviders = RouterModule.forChild([
  { path: 'about', component: AboutComponent },
  { path: 'room', component: RoomComponent },
  { path: 'settings', component: SettingsComponent }
]);
