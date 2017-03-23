let ins = require('./../models/instrument');
const instrument = new ins(
  -1,
  'Instrument',
  [ { type: 'sine', freq: 1, gain: 1 } ],
  { attack: 100, decay: 100, sustain: 0.7, release: 100 },
  { x: 0, y: 0.2 }
);
module.exports = instrument;
