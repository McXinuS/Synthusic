import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import { UTILITIES } from './utilities'
import { SHARED_COMPONENTS } from './components'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule
  ],
  declarations: [
    ...UTILITIES,
    ...SHARED_COMPONENTS
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpModule,
    ...UTILITIES,
    ...SHARED_COMPONENTS
  ]
})
export class SharedModule { }
