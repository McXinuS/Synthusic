import insObj from './instruments.js'

// TODO load config from server (may be with emitting event 'onConfigLoaded' or smth)

module.exports = new function () {
    // TODO Assign different envelopes to every instrument
    this.envelope = {
        attack: 150,
        decay: 250,
        sustain: 0.7,
        release: 550
    };

    this.instruments = insObj.instruments;
    this.instrument = undefined;

    this.bpm = 60;

    this.mode = __constants.MODES.pentatonicMajor;

    this.scale = __constants.SCALES.sharp.scale;
};