import instruments from './instruments.js'
import waveFunction from './wave_function.js'

// TODO try export default new function Config(){}(); instead
// TODO split into constants and config
let constants = new Constants();
export default constants;
module.exports = constants;

function Constants() {
	if (typeof(location) !== 'undefined') {
		this.WEB_SOCKET_HOST = location.origin.replace(/^http/, 'ws');
	}

	this.envelope = {
		attack: 150,
		decay: 250,
		sustain: 0.7,
		release: 550
	};

	this.WEB_SOCKET_MESSAGE_TYPE = {
		play_note: 0,
		stop_note: 1,
		stop: 5,
		change_instrument: 10,
		get_state: 20
	};

	this.MASTER_GAIN_MAX = 0.5;

	this.WAVE_FUNCTION = waveFunction;

	this.INSTRUMENTS = instruments;

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

	this.MODE = this.MODES.pentatonicMajor;

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

	this.SCALE = this.SCALES.sharp.scale;

	// will be translated to a Note object during compilation
	this.NOTE_START = ['C', 2];
	this.NOTE_END = ['B', 5];

	this.NOTES_COUNT = (this.NOTE_END[1] - this.NOTE_START[1]) * this.SCALE.length
		- this.SCALE.indexOf(this.NOTE_START[0]) + this.SCALE.indexOf(this.NOTE_END[0]) + 1;
}