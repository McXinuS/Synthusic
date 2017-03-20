export class Instrument {
  id: number;
  name: string;
  oscillators: Oscillator[];
  envelope: Envelope;
  panner: Panner;
}

export class Envelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class Oscillator {
  freq: number;
  gain: number;
  type: string;
}

export const OscillatorType = ['sine', 'square', 'sawtooth', 'triangle'];

export class Panner {
  // -1 < x < 1
  x: number;
  // 0 < y < 1
  y: number;
}
