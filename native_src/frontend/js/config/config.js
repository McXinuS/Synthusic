import insObj from './instruments.js'

// TODO load config from server (may be with emitting event 'onConfigLoaded' or smth)

module.exports = new function () {
    this.instruments = insObj.instruments;
    this.instrumentId = undefined;

    this.bpm = 60;

    this.mode = __constants.MODES.pentatonicMajor;

    this.scale = __constants.SCALES.sharp.scale;

    let _playing;
    Object.defineProperty(this, 'playing', {
        get: () => {
            return _playing;
        },
        set: (value) => {
            _playing = value;

            Object.defineProperty(_playing, 'length', {
                get: () => {
                    let count = 0;
                    for (let i in this.playing) {
                        if (this.playing.hasOwnProperty(i) && this.playing[i]) count++;
                    }
                    return count;
                },
                enumerable: false
            });
        }
    });
    this.playing = {};
};