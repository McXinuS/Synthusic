export class Instrument {
  id: number;
  name: string;
  oscillators: Oscillator[];
  envelope: Envelope;
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

export const Types = ['sine', 'square', 'sawtooth', 'triangle'];
