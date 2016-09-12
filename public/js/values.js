var NOTE_START = ['C', 2];
var NOTE_END = ['B', 5];

var MAX_GAIN = 0.5;

var WEB_SOCKET_HOST = location.origin.replace(/^http/, 'ws');

var INSTRUMENTS = {
	piano: {
		name: 'Piano',
		osc_count: 4,
		osc_type: ['sine', 'sine', 'square', 'sine'],
		osc_freq: [1, 2, 0.5, 1.66],
		osc_gain: [1, 0.4, 0.1, 0.2]
	},
	test_instr: {
		name: 'Test',
		osc_count: 2,
		osc_type: ['sine', 'sine'],
		osc_freq: [1, 2],
		osc_gain: [1, 0.4]
	}
};

var WEB_SOCKET_MESSAGE_TYPE = {
	play_note: 0,
	stop_note: 1,
	stop: 5,
	change_instrument: 10
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