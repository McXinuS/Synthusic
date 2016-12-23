import insObj from './instruments.js'

// TODO load config from server (may be with emitting event 'onConfigLoaded' or smth)

module.exports = new function () {
    this.instruments = insObj.instruments;
    this.instrumentId = undefined;

    this.bpm = 60;

    this.mode = __constants.MODES.pentatonicMajor;

    this.scale = __constants.SCALES.sharp.scale;

    this.playing = [];
};