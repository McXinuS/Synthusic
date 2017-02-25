import { Injectable } from '@angular/core';

import {Instrument, Oscillator} from "./instrument.model";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class InstrumentService {
  public instruments: BehaviorSubject<Array<Instrument>> = new BehaviorSubject([]);

  constructor(broadcaster: BroadcasterService) {
  }

  getInstrument(id): Instrument {
    return this.instruments.getValue().find(ins => {
      return ins.id == id;
    });
  }

  init(settings: Instrument[]) {
    this.instruments.next(settings);
  }

  updateEnvelope(instrumentId: number, type: string, value: number) {
    this.getInstrument(instrumentId).envelope[type] = value;
  }

  addOscillator(instrumentId: number, oscillator: Oscillator) {
    this.getInstrument(instrumentId).oscillators.push(oscillator);
  }

  updateOscillator(instrumentId: number, oscillator: Oscillator, type: string, value: number | number) {
    let instrument = this.getInstrument(instrumentId),
      index = this.findOscillatorIndex(instrument, oscillator);
    instrument.oscillators[index][type] = value;
  }

  deleteOscillator(instrumentId: number, oscillator: Oscillator) {
    let ind, instrument = this.getInstrument(instrumentId);
    while ((ind = this.findOscillatorIndex(instrument, oscillator)) != -1) {
      instrument.oscillators.splice(ind, 1);
    }
  }

  private findOscillatorIndex(instrument: Instrument, osc: Oscillator) {
    return instrument.oscillators.findIndex((cur: Oscillator)=> {
      return cur.freq === osc.freq && cur.gain === osc.gain && cur.type === osc.type;
    });
  }
}
