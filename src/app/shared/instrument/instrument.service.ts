import {Injectable} from '@angular/core';
import {Instrument, Oscillator, PannerConfig} from "./instrument.model";
import {Subject, Observable, BehaviorSubject} from 'rxjs';
import {WebSocketService} from "../websocket/websocket.service";
import {WebSocketMessageType} from "../../../../shared/web-socket-message-types";
import {SoundService} from "../sound/sound.service";

@Injectable()
export class InstrumentService {
  private _instruments: Instrument[] = [];
  private instrumentsSource: Subject<Array<Instrument>> = new BehaviorSubject(this._instruments);
  instruments$: Observable<Array<Instrument>>;

  constructor(private webSocketService: WebSocketService,
              private soundService: SoundService) {
    this.instruments$ = this.instrumentsSource.asObservable();
    this.soundService.setInstrumentObservable(this.instruments$);
    this.webSocketService.registerHandler(WebSocketMessageType.instrument_add, this.addInstrument.bind(this));
    this.webSocketService.registerHandler(WebSocketMessageType.instrument_update, this.deleteInstrument.bind(this));
    this.webSocketService.registerHandler(WebSocketMessageType.instrument_delete, this.deleteInstrument.bind(this));
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

  private getInstrumentIndex(id: number): number {
    return this._instruments.findIndex(ins => {
      return ins.id == id;
    });
  }

  async createInstrument(): Promise<Instrument> {
    try {
      let instrument = await this.webSocketService.sendAsync<Instrument>(WebSocketMessageType.instrument_add);
      if (instrument == null) return null;
      return instrument;
    } catch (e) {
      throw e;
    }
  }

  private addInstrument(instrument: Instrument) {
    this._instruments.push(instrument);
    this.instrumentsSource.next(this._instruments);
  }

  // TODO: notify popup
  updateInstrument(instrument: Instrument) {
    let index = this.getInstrumentIndex(instrument.id);
    if (index >= 0) {
      this._instruments[index] = instrument;
      this.instrumentsSource.next(this._instruments);
      this.soundService.onInstrumentUpdate(instrument.id);
    }
  }

  deleteInstrument(id: number) {
    let index = this.getInstrumentIndex(id);
    if (index >= 0) {
      this.soundService.stop(id);
      this._instruments.splice(index, 1);
      this.instrumentsSource.next(this._instruments);
    }
  }

  updateEnvelope(id: number, type: string, value: number) {
    this.getInstrument(id).envelope[type] = value;
    this.soundService.onEnveloperUpdate(id, this.getInstrument(id).envelope);
  }

  updatePanner(id: number, panner: PannerConfig) {
    this.getInstrument(id).panner = panner;
    this.soundService.onPannerUpdate(id, this.getInstrument(id).panner);
  }

  private findOscillatorIndex(instrument: Instrument, osc: Oscillator) {
    return instrument.oscillators.findIndex(cur => {
      return cur.freq === osc.freq && cur.gain === osc.gain && cur.type === osc.type;
    });
  }

  addOscillator(id: number, oscillator: Oscillator) {
    this.getInstrument(id).oscillators.push(oscillator);
    this.soundService.onOscillatorsUpdate(id);
  }

  updateOscillator(id: number, oscillator: Oscillator, type: string, value: number | string) {
    let instrument = this.getInstrument(id),
      index = this.findOscillatorIndex(instrument, oscillator);
    if (index >= 0) {
      let old = Object.assign({}, instrument.oscillators[index]);
      instrument.oscillators[index][type] = value;
      this.soundService.onOscillatorsUpdate(id, instrument.oscillators[index], old);
    }
  }

  deleteOscillator(id: number, oscillator: Oscillator) {
    let ind, instrument = this.getInstrument(id);
    while ((ind = this.findOscillatorIndex(instrument, oscillator)) != -1) {
      instrument.oscillators.splice(ind, 1);
    }
    this.soundService.onOscillatorsUpdate(id);
  }
}
