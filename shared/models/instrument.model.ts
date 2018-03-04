import {EnvelopeConfig, PannerConfig} from "./sound-effects.model";

export class Instrument {
  id: number;
  name: string;
  oscillators: Oscillator[];
  envelope: EnvelopeConfig;
  panner: PannerConfig;
}

export class Oscillator {
  freq: number;
  gain: number;
  type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom';
}

export const OscillatorType = ['sine', 'square', 'sawtooth', 'triangle'];

