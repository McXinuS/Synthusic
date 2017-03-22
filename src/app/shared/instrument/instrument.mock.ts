import {Instrument, EnvelopeConfig, PannerConfig} from "./instrument.model";

// TODO: move to shared

const envelopeDefaults: EnvelopeConfig = {
  attack: 150,
  decay: 250,
  sustain: 0.7,
  release: 550
};
const pannerDefaults: PannerConfig = {
  x: 0,
  y: 0.3
};

export const INSTRUMENTS: Instrument[] = [
  {
    id: 0,
    name: 'Organ',
    oscillators: [
      {type: 'sine', freq: 1, gain: 1},
      {type: 'sine', freq: 2, gain: 0.7},
      {type: 'sine', freq: 3, gain: 0.65},
      {type: 'sine', freq: 4, gain: 0.5},
      {type: 'sine', freq: 5, gain: 0.4},
      {type: 'sine', freq: 6, gain: 0.4},
      {type: 'sine', freq: 7, gain: 0.3}
    ],
    envelope: {
      attack: 150,
      decay: 550,
      sustain: 0.7,
      release: 550
    },
    panner: {
      x: 0.2,
      y: 0.3
    }
  },
  {
    id: 1,
    name: 'Sine bass + triangle',
    oscillators: [
      {type: 'sine', freq: 0.5, gain: 1},
      {type: 'triangle', freq: 1, gain: 1},
      {type: 'triangle', freq: 3, gain: 0.6},
      {type: 'triangle', freq: 4, gain: 0.4}
    ],
    envelope: {
      attack: 150,
      decay: 150,
      sustain: 0.7,
      release: 150
    },
    panner: {
      x: -0.2,
      y: 0.3
    }
  }
];
