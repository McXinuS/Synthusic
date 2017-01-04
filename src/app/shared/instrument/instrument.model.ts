import {Oscillator} from "./oscillator.model";
import {Envelope} from "./envelope.model";

export class Instrument {
  id: number;
  name: string;
  oscillators: Oscillator[];
  envelope: Envelope;
}
