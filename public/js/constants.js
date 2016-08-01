/* Instruments */
var instruments = {
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

// interval of each note from 'A' note
var interval = [];
interval["C"] = -9;
interval["D"] = -7;
interval["E"] = -5;
interval["F"] = -4;
interval["G"] = -2;
interval["A"] = 0;
interval["B"] = 2;

var scales = {
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

var actual_scales = {
	minor: {
		name: 'Minor',
		intervals: [2, 1, 2, 2, 1, 2, 2]
	},
	major: {
		name: 'Major',
		intervals: [2, 2, 1, 2, 2, 2, 1]
	},
	pentaMinor: {
		name: 'Pentatonic minor',
		intervals: [3, 2, 3, 2, 2]
	},
	pentaMajor: {
		name: 'Pentatonic major',
		intervals: [2, 3, 2, 2, 3]
	}
};