import {Injectable} from '@angular/core';
import {Instrument, Oscillator, PannerConfig} from "./instrument.model";
import {Subject, Observable, BehaviorSubject} from 'rxjs';
import {WebSocketService} from "../websocket/websocket.service";
import {WebSocketMessageType} from "../../../../shared/web-socket-message-types";
import {SoundService} from "../sound/sound.service";
import {PopupService} from "../popup/popup.service";

@Injectable()
export class InstrumentService {
  private _instruments: Instrument[] = [];
  private instrumentsSource: Subject<Array<Instrument>> = new BehaviorSubject(this._instruments);
  instruments$: Observable<Array<Instrument>>;

  constructor(private webSocketService: WebSocketService,
              private soundService: SoundService,
              private popupService: PopupService) {
    this.instruments$ = this.instrumentsSource.asObservable();
    this.soundService.setInstrumentObservable(this.instruments$);
    this.webSocketService.registerHandler(WebSocketMessageType.instrument_add, this.addInstrument.bind(this));
    this.webSocketService.registerHandler(WebSocketMessageType.instrument_update, this.updateInstrument.bind(this));
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

  /**
   * Request server to create new instrument.
   * Instrument will be added to application with web socket service handler.
   */
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

  /**
   * Callback for web socket. No need to use it inside of this
   * application due to high load on services and components when resetting instrument
   */
  private updateInstrument(instrument: Instrument) {
    let index = this.getInstrumentIndex(instrument.id);
    if (index >= 0) {
      // copy into existing object to not break references
      Object.assign(this._instruments[index], instrument);
      this.instrumentsSource.next(this._instruments);
      this.soundService.onInstrumentUpdate(instrument.id);
      this.popupService.updateInstrument(this._instruments[index]);
    }
  }

  deleteInstrument(id: number) {
    let index = this.getInstrumentIndex(id);
    if (index >= 0) {
      this.soundService.stop(id);
      this._instruments.splice(index, 1);
      this.instrumentsSource.next(this._instruments);
      this.webSocketService.send(WebSocketMessageType.instrument_delete, id);
    }
  }

  updateEnvelope(id: number, type: string, value: number) {
    this.getInstrument(id).envelope[type] = value;
    this.soundService.onEnveloperUpdate(id, this.getInstrument(id).envelope);
    this.notifyInstrumentUpdated(id);
  }

  updatePanner(id: number, panner: PannerConfig) {
    this.getInstrument(id).panner = panner;
    this.soundService.onPannerUpdate(id, this.getInstrument(id).panner);
    this.notifyInstrumentUpdated(id);
  }

  addOscillator(id: number, oscillator: Oscillator) {
    this.getInstrument(id).oscillators.push(oscillator);
    this.soundService.onOscillatorsUpdate(id);
    this.notifyInstrumentUpdated(id);
  }

  updateOscillator(id: number, oscillator: Oscillator, type: string, value: number | string) {
    let instrument = this.getInstrument(id),
      index = this.findOscillatorIndex(instrument, oscillator);
    if (index >= 0) {
      let old = Object.assign({}, instrument.oscillators[index]);
      instrument.oscillators[index][type] = value;
      this.soundService.onOscillatorsUpdate(id, instrument.oscillators[index], old);
      this.notifyInstrumentUpdated(id);
    }
  }

  deleteOscillator(id: number, oscillator: Oscillator) {
    let ind, instrument = this.getInstrument(id);
    while ((ind = this.findOscillatorIndex(instrument, oscillator)) != -1) {
      instrument.oscillators.splice(ind, 1);
    }
    this.soundService.onOscillatorsUpdate(id);
    this.notifyInstrumentUpdated(id);
  }

  private getInstrumentIndex(id: number): number {
    return this._instruments.findIndex(ins => {
      return ins.id == id;
    });
  }

  private findOscillatorIndex(instrument: Instrument, osc: Oscillator) {
    return instrument.oscillators.findIndex(cur => {
      return cur.freq === osc.freq && cur.gain === osc.gain && cur.type === osc.type;
    });
  }

  private notifyInstrumentUpdated(id: number) {
    this.webSocketService.send(WebSocketMessageType.instrument_update, this.getInstrument(id));
  }
}
