import { Injectable } from '@angular/core';

import {Instrument} from "./instrument.model";
import {BroadcasterService} from "../broadcaster/broadcaster.service";

@Injectable()
export class InstrumentService {
  _instruments: Instrument[];
  get instruments(): Instrument[] {
    return this._instruments;
  }

  constructor(broadcaster: BroadcasterService) {
  }

  getInstrument(id): Instrument {
    return this._instruments.find(ins => {
      return ins.id == id;
    });
  }

  init(settings: Instrument[]) {
    this._instruments = settings;
  }
}
