import {Injectable} from '@angular/core';
import {Instrument, Oscillator} from "./instrument.model";
import {Subject} from 'rxjs';

@Injectable()
export class InstrumentService {
  private _instruments: Instrument[] = [];
  instruments$: Subject<Array<Instrument>> = new Subject();

  constructor() {
  }

  getInstrument(id): Instrument {
    return this._instruments.find(ins => {
      return ins.id == id;
    });
  }

  getInstrumentIndex(id): number {
    return this._instruments.findIndex(ins => {
      return ins.id == id;
    });
  }

  init(settings: Instrument[]) {
    this._instruments = settings;
    this.instruments$.next(this._instruments);
  }

  addInstrument(instrument: Instrument) {
    this._instruments.push(instrument);
    this.instruments$.next(this._instruments);
  }

  updateInstrument(instrument: Instrument) {
    let index = this.getInstrumentIndex(instrument.id);
    if (index >= 0) {
      this._instruments[index] = instrument;
      this.instruments$.next(this._instruments);
    }
  }

  deleteInstrument(id: number) {
    let index = this.getInstrumentIndex(id);
    if (index >= 0) {
      this._instruments.splice(index, 1);
      this.instruments$.next(this._instruments);
    }
  }

  updateEnvelope(id: number, type: string, value: number) {
    this.getInstrument(id).envelope[type] = value;
  }

  addOscillator(id: number, oscillator: Oscillator) {
    this.getInstrument(id).oscillators.push(oscillator);
  }

  updateOscillator(id: number, oscillator: Oscillator, type: string, value: number | number) {
    let instrument = this.getInstrument(id),
      index = this.findOscillatorIndex(instrument, oscillator);
    if (index >= 0) {
      instrument.oscillators[index][type] = value;
    }
  }

  deleteOscillator(id: number, oscillator: Oscillator) {
    let ind, instrument = this.getInstrument(id);
    while ((ind = this.findOscillatorIndex(instrument, oscillator)) != -1) {
      instrument.oscillators.splice(ind, 1);
    }
  }

  private findOscillatorIndex(instrument: Instrument, osc: Oscillator) {
    return instrument.oscillators.findIndex((cur: Oscillator) => {
      return cur.freq === osc.freq && cur.gain === osc.gain && cur.type === osc.type;
    });
  }
}
