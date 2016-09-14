var WEB_SOCKET_HOST = location.origin.replace(/^http/, 'ws');

var WEB_SOCKET_MESSAGE_TYPE = {
	play_note: 0,
	stop_note: 1,
	stop: 5,
	change_instrument: 10,
	get_state: 20
};

var NOTE_START = ['C', 2];
var NOTE_END = ['B', 5];

var MASTER_GAIN_MAX = 0.5;

function GetWaveFunction(funcName) {
	switch (funcName) {
		case 'sine':
			return Math.sin;
		case 'square':
			return function (val) {
				return (Math.sin(val) > 0) ? 1 : -1
			};
		default:
			return Math.sin;
	}
}

var INSTRUMENTS = {
	piano: {
		name: 'Piano',
		osc_count: 7,
		osc_type: ['sine', 'sine', 'sine', 'sine', 'sine', 'sine', 'sine'],
		osc_freq: [1, 2, 3, 4, 5, 6, 7],
		osc_gain: [1, 0.7, 0.65, 0.5, 0.4, 0.4, 0.3]
	},
	test_instr: {
		name: 'Test',
		osc_count: 2,
		osc_type: ['sine', 'sine'],
		osc_freq: [1, 2],
		osc_gain: [1, 0.4]
	}
};

var ACCIDENTALS = {
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

var SCALES = {
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