import {BrowserModule} from '@angular/platform-browser';
import {SharedModule} from '@shared/index';
import {CoreModule} from '@core/index';
import {AppComponent} from './app.component';
import {ErrorHandler, NgModule} from '@angular/core';
import {MyErrorHandler} from '@core/utilities';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from "@angular/router";
import {ROUTES} from "./app.routes";

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, {useHash: true}),
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    CoreModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    {provide: ErrorHandler, useClass: MyErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
