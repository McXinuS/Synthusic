import {Injectable} from '@angular/core';
import {Instrument, Oscillator, PannerConfig} from '@core/models';
import {Subject, Observable, BehaviorSubject} from 'rxjs';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';
import {WebSocketService} from '../websocket';
import {SoundService} from '../sound';
import {PopupService} from '../popup';
import {StaffService} from '../sequencer';

@Injectable()
export class InstrumentService {
  private _instruments: Instrument[] = [];
  private instrumentsSource: Subject<Array<Instrument>> = new BehaviorSubject(this._instruments);
  instruments$: Observable<Array<Instrument>>;

  getInstrument(id): Instrument {
    return this._instruments.find(ins => ins.id === id);
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

  constructor(private webSocketService: WebSocketService,
              private soundService: SoundService,
              private popupService: PopupService,
              private staffService: StaffService) {

    this.instruments$ = this.instrumentsSource.asObservable();

    this.soundService.setInstrumentObservable(this.instruments$);
    this.staffService.setInstrumentObservable(this.instruments$);

    this.webSocketService.registerHandler(WebSocketMessageType.instrument_add, this.onInstrumentAdded.bind(this));
    this.webSocketService.registerHandler(WebSocketMessageType.instrument_update, this.onInstrumentUpdated.bind(this));
    this.webSocketService.registerHandler(WebSocketMessageType.instrument_delete, this.deleteInstrument.bind(this));

  }

  init(settings: Instrument[]) {
    this._instruments = settings;
    this.instrumentsSource.next(this._instruments);
  }

  private onInstrumentAdded(instrument: Instrument) {
    this._instruments.push(instrument);
    this.instrumentsSource.next(this._instruments);
  }

  /**
   * Callback for web socket. No need to use it inside of this application
   * due to high CPU usage when resetting instrument.
   */
  private onInstrumentUpdated(instrument: Instrument) {
    let index = this.getInstrumentIndex(instrument.id);
    if (index >= 0) {
      // copy into existing object to not break references
      Object.assign(this._instruments[index], instrument);
      this.instrumentsSource.next(this._instruments);
      this.soundService.onInstrumentUpdate(instrument.id);
    } else {
      this.onInstrumentAdded(instrument);
    }
  }

  private onInstrumentDeleted(id: number) {
    let index = this.getInstrumentIndex(id);
    if (index >= 0) {
      this.soundService.stopInstrument(id);
      this._instruments.splice(index, 1);
      this.instrumentsSource.next(this._instruments);
    }
  }

  private notifyInstrumentUpdated(id: number) {
    this.webSocketService.send(WebSocketMessageType.instrument_update, this.getInstrument(id));
  }

  /**
   * Request server to create new instrument.
   * Instrument will be added to application with web socket service handler.
   */
  createInstrument(): Promise<Instrument> {
    return new Promise((resolve, reject) => {
      this.webSocketService.sendAsync<Instrument>(WebSocketMessageType.instrument_add)
        .then((instrument) => {
          if (!instrument) {
            reject();
          }
          resolve(instrument);
        }, reject)
    });
  }

  // TODO: use it
  deleteInstrument(id: number) {
    this.webSocketService.send(WebSocketMessageType.instrument_delete, id);
    this.onInstrumentDeleted(id);
  }

  // TODO: move change notification to another function to let DOM-events handle it

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
}
