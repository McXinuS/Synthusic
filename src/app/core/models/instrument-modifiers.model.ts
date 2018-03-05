import {Enveloper} from '@core/services/sound/enveloper';
import {Panner} from '@core/services/sound/panner';

export class InstrumentModifiers {
  enveloper: Enveloper;
  panner: Panner;

  constructor(enveloper: Enveloper, panner: Panner) {
    this.enveloper = enveloper;
    this.panner = panner;
  }
}
