import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SERVICES } from './services'
import { UTILITIES } from './utilities'
import { VIEWS } from './views'
import { RESOLVERS } from './resolvers';

@NgModule({
  imports: [
    CommonModule,
    ...VIEWS
  ],
  providers: [
    ...SERVICES,
    ...RESOLVERS
  ],
  declarations: [
    ...UTILITIES
  ],
  exports: [
    ...UTILITIES,
    ...VIEWS
  ]
})
export class CoreModule { }
