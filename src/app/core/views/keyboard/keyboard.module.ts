import { NgModule } from '@angular/core';
import {SharedModule} from '@shared/shared.module';
import {KeyComponent} from '@core/views/keyboard/key';
import {KeyboardComponent} from '@core/views/keyboard/keyboard.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    KeyComponent,
    KeyboardComponent
  ],
  exports: [
    KeyboardComponent
  ]
})
export class KeyboardModule { }
