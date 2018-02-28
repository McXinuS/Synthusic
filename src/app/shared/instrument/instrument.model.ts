export class Instrument {
  id: number;
  name: string;
  oscillators: Oscillator[];
  envelope: EnvelopeConfig;
  panner: PannerConfig;
}

export class EnvelopeConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class Oscillator {
  freq: number;
  gain: number;
  type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom';
}

export const OscillatorType = ['sine', 'square', 'sawtooth', 'triangle'];

export class PannerConfig {
  // -1 < x < 1
  x: number;
  // 0 < y < 1
  y: number;
}
