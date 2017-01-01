import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
//import { StoreDevtoolsModule } from '@ngrx/store-devtools';
//import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';

import {AppComponent} from './app.component';
import {InstrumentComponent} from './instrument/instrument.component';
//import { routing } from './app.routing';
//import { store, effects } from './store';
//import { SharedModule } from './shared/shared.module';

import {InstrumentService} from './services/instrument/instrument.service';

@NgModule({
    declarations: [
        AppComponent,
        InstrumentComponent
    ],
    imports: [
        BrowserModule,
        //routing,
        //SharedModule,
        //store,
        //...effects,
        FormsModule,
        /*
         StoreDevtoolsModule.instrumentStore({
         monitor: useLogMonitor({
         visible: true,
         position: 'right'
         })
         }),
         StoreLogMonitorModule,
         */
        HttpModule
    ],
    providers: [InstrumentService],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}