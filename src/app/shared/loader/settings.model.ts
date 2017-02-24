import {Scale} from "../note/scale.model";
import {Instrument} from "../instrument/instrument.model";

export class Settings {
  scale: Scale;
  firstNote: {name: string, octave: number};
  lastNote: {name: string, octave: number};
  instruments: Instrument[];
  masterGainMax: number;
  bpm: number;
}
