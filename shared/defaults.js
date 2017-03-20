const envelopeDefaults = {
  attack: 150,
  decay: 250,
  sustain: 0.7,
  release: 550
};
const pannerDefaults = {
  x: 0,
  y: 0.3
};

module.exports = {
  bpm: 60,
  instruments: [
    {
      id: 4,
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
      envelope: envelopeDefaults,
      panner: pannerDefaults
    },
    {
      id: 5,
      name: 'Sine bass + triangle',
      oscillators: [
        {type: 'sine', freq: 0.5, gain: 1},
        {type: 'triangle', freq: 1, gain: 1},
        {type: 'triangle', freq: 3, gain: 0.6},
        {type: 'triangle', freq: 4, gain: 0.4}
      ],
      envelope: envelopeDefaults,
      panner: pannerDefaults
    },
    {
      id: 0,
      name: 'Sine',
      oscillators: [
        {type: 'sine', freq: 1, gain: 1}
      ],
      envelope: envelopeDefaults,
      panner: pannerDefaults
    },
    {
      id: 1,
      name: 'Square',
      oscillators: [
        {type: 'square', freq: 1, gain: 1}
      ],
      envelope: envelopeDefaults,
      panner: pannerDefaults
    },
    {
      id: 2,
      name: 'Sawtooth',
      oscillators: [
        {type: 'sawtooth', freq: 1, gain: 1}
      ],
      envelope: envelopeDefaults,
      panner: pannerDefaults
    },
    {
      id: 3,
      name: 'Triangle',
      oscillators: [
        {type: 'triangle', freq: 1, gain: 1}
      ],
      envelope: envelopeDefaults,
      panner: pannerDefaults
    }
  ]
};
