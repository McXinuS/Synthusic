import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";
import {HttpModule} from '@angular/http';
import { UTILITIES } from './utilities'
import { SHARED_COMPONENTS } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    HttpModule,
  ],
  declarations: [
    ...UTILITIES,
    ...SHARED_COMPONENTS
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    ...UTILITIES,
    ...SHARED_COMPONENTS
  ]
})
export class SharedModule { }
