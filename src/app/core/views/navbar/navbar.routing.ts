import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import {AboutComponent} from './about';
import {RoomComponent} from './room';
import {SettingsComponent} from './settings';

export const NavbarRouting: ModuleWithProviders = RouterModule.forChild([
  { path: 'about', component: AboutComponent, outlet: 'navbar' },
  { path: 'room', component: RoomComponent, outlet: 'navbar' },
  { path: 'settings', component: SettingsComponent, outlet: 'navbar' }
]);
