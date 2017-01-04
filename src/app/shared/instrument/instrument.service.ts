import { Injectable } from '@angular/core';

import { INSTRUMENTS } from './mock-instruments';

@Injectable()
export class InstrumentService {
  getInstruments() {
    return Promise.resolve(INSTRUMENTS);
  }
}
