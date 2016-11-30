module.exports = new function () {
    if (typeof(location) !== 'undefined') {
        this.WEB_SOCKET_HOST = location.origin.replace(/^http/, 'ws');
    }

    this.WEB_SOCKET_MESSAGE_TYPE = {
        play_note: 0,
        stop_note: 1,
        stop: 5,
        change_instrument: 10,
        get_state: 20
    };

    this.MASTER_GAIN_MAX = 0.5;
    this.ANALYZER_FFT_SIZE = 2048;

    this.WAVE_FUNCTION = function (funcName) {
        switch (funcName) {
            case 'sine':
                return Math.sin;
            case 'square':
                return function (t) {
                    return t == 0 ? 0 : (Math.sin(t) > 0) ? 1 : -1
                };
            case 'sawtooth':
                return function (t) {
                    if (t > 0) return 2 * ((t / 2 / Math.PI) % 1) - 1;
                    else return 2 * ((t / 2 / Math.PI) % 1) + 1;
                };
            case 'triangle':
                return function (t) {
                    if (t > 0) return 4 * Math.abs((t / 2 / Math.PI) % 1 - 0.5) - 1;
                    else return 4 * Math.abs((t / 2 / Math.PI) % 1 + 0.5) - 1;
                };
            default:
                return Math.sin;
        }
    };

    this.MODES = {
        minor: {
            name: 'Minor',
            intervals: [2, 1, 2, 2, 1, 2, 2]
        },
        major: {
            name: 'Major',
            intervals: [2, 2, 1, 2, 2, 2, 1]
        },
        pentatonicMinor: {
            name: 'Pentatonic minor',
            intervals: [3, 2, 3, 2, 2]
        },
        pentatonicMajor: {
            name: 'Pentatonic major',
            intervals: [2, 3, 2, 2, 3]
        }
    };

    this.SCALES = {
        natural: {
            name: 'Natural',
            scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        },
        sharp: {
            name: 'Sharp',
            scale: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
        },
        flat: {
            name: 'Flat',
            scale: ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
        }
    };

    this.ENVELOPE_PROPERTIES = ['attack', 'decay', 'sustain', 'release'];

    // will be translated to a Note object during compilation
    this.NOTE_START = ['C', 2];
    this.NOTE_END = ['B', 5];
    this.NOTES_COUNT = 0;
};