import {INSTRUMENTS} from "./mocks";
import {Injectable} from '@angular/core';

@Injectable()
export class InstrumentService{
    getInstruments() {
        return INSTRUMENTS;
    }
}