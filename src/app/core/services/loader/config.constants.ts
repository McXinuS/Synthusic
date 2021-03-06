import {Scale} from '@core/models';

let scaleNatural: Scale = {
  id: 0,
  name: 'Natural',
  notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  accidentalPlaceholder: ' ',
  accidentalSign: ' ',
  accidentalStep: 0
};
let scaleSharp: Scale = {
  id: 1,
  name: 'Sharp',
  notes: ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'],
  accidentalPlaceholder: 's',
  accidentalSign: '♯',
  accidentalStep: +1
};
let scaleFlat: Scale = {
  id: 2,
  name: 'Flat',
  notes: ['C', 'Df', 'D', 'Ef', 'E', 'F', 'Gf', 'G', 'Af', 'A', 'Bf', 'B'],
  accidentalPlaceholder: 'f',
  accidentalSign: '♭',
  accidentalStep: -1
};

export const CONSTANTS = {
  scaleNatural: scaleNatural,
  scaleSharp: scaleSharp,
  scaleFlat: scaleFlat,
  scale: scaleSharp,

  firstNote: {'name': 'C', 'octave': 2},
  lastNote: {'name': 'B', 'octave': 5},

  masterGainMax: 0.5
};
