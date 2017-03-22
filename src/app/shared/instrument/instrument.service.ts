import {Injectable} from '@angular/core';
import {Instrument, Oscillator, PannerConfig} from "./instrument.model";
import {Subject, Observable, BehaviorSubject} from 'rxjs';

@Injectable()
export class InstrumentService {
  private _instruments: Instrument[] = [];
  private instrumentsSource: Subject<Array<Instrument>> = new BehaviorSubject(this._instruments);
  instruments$: Observable<Array<Instrument>>;

  constructor() {
    this.instruments$ = this.instrumentsSource.asObservable();
  }

  getInstrument(id): Instrument {
    return this._instruments.find(ins => {
      return ins.id == id;
    });
  }

  init(settings: Instrument[]) {
    this._instruments = settings;
    this.instrumentsSource.next(this._instruments);
  }

  addInstrument(instrument: Instrument) {
    this._instruments.push(instrument);
    this.instrumentsSource.next(this._instruments);
  }

  updateInstrument(instrument: Instrument) {
    let index = this.getInstrumentIndex(instrument.id);
    if (index >= 0) {
      this._instruments[index] = instrument;
      this.instrumentsSource.next(this._instruments);
    }
  }

  deleteInstrument(id: number) {
    let index = this.getInstrumentIndex(id);
    if (index >= 0) {
      this._instruments.splice(index, 1);
      this.instrumentsSource.next(this._instruments);
    }
  }

  private getInstrumentIndex(id): number {
    return this._instruments.findIndex(ins => {
      return ins.id == id;
    });
  }

  updateEnvelope(id: number, type: string, value: number) {
    this.getInstrument(id).envelope[type] = value;
  }

  updatePanner(id: number, panner: PannerConfig) {
    this.getInstrument(id).panner = panner;
  }

  addOscillator(id: number, oscillator: Oscillator) {
    this.getInstrument(id).oscillators.push(oscillator);
  }

  updateOscillator(id: number, oscillator: Oscillator, type: string, value: number | string) {
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
    return instrument.oscillators.findIndex(cur => {
      return cur.freq === osc.freq && cur.gain === osc.gain && cur.type === osc.type;
    });
  }
}
