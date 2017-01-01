import {Component} from '@angular/core';
import {Instrument} from "../models/instrument";
import {InstrumentService} from '../services/instrument/instrument.service';

@Component({
    selector: 'app-instr',
    templateUrl: './instrument.component.html',
    styleUrls: ['./instrument.component.css']
})
export class InstrumentComponent {
    instruments: Instrument[];


    constructor(private instrumentService: InstrumentService){

    }

    ngOnInit() {
        this.instruments = this.instrumentService.getInstruments();
    }
}
