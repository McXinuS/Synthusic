// make it in frontend variable naming style
let constants = new Constants();
export default constants;
module.exports = constants;
//module.exports.Constants = Constants;

function Constants() {
	if (typeof(location) !== 'undefined') {
		this.WEB_SOCKET_HOST = location.origin.replace(/^http/, 'ws');
	}

	this.ENVELOPER_OPTIONS = {
		attack: 150,
		decay: 250,
		sustain: 0.7,
		release: 2350
	};

	this.WEB_SOCKET_MESSAGE_TYPE = {
		play_note: 0,
		stop_note: 1,
		stop: 5,
		change_instrument: 10,
		get_state: 20
	};

	this.NOTE_START = ['C', 2];
	this.NOTE_END = ['B', 5];

	this.MASTER_GAIN_MAX = 0.5;

	this.WAVE_FUNCTION = function (funcName) {
		switch (funcName) {
			case 'sine':
				return Math.sin;
			case 'square':
				return function (t) {
					return (Math.sin(t) > 0) ? 1 : -1
				};
			case 'sawtooth':
				return function (t) {
					return t > 0 ? 2 * (t % 1) - 1 : 2 * (t % 1) + 1;
				};
			default:
				return Math.sin;
		}
	};

	this.INSTRUMENTS = {
		piano: {
			name: 'Organ',
			osc_count: 7,
			osc_type: ['sine', 'sine', 'sine', 'sine', 'sine', 'sine', 'sine'],
			osc_freq: [1, 2, 3, 4, 5, 6, 7],
			osc_gain: [1, 0.7, 0.65, 0.5, 0.4, 0.4, 0.3]
		},
		sine: {
			name: 'Sine',
			osc_count: 1,
			osc_type: ['sine'],
			osc_freq: [1],
			osc_gain: [1]
		},
		square: {
			name: 'Square',
			osc_count: 1,
			osc_type: ['square'],
			osc_freq: [1],
			osc_gain: [1]
		},
		sawtooth: {
			name: 'Sawtooth',
			osc_count: 1,
			osc_type: ['sawtooth'],
			osc_freq: [1],
			osc_gain: [1]
		}
	};

	this.ACCIDENTALS = {
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

	this.SCALES = {
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
}