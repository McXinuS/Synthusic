export default {
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
	test1: {
		name: 'Sine bass + triangle',
		osc_count: 4,
		osc_type: ['sine', 'triangle', 'triangle', 'triangle'],
		osc_freq: [0.5, 1, 3, 4],
		osc_gain: [1, 1, 0.6, 0.4]
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
	},
	triangle: {
		name: 'Triangle',
		osc_count: 1,
		osc_type: ['triangle'],
		osc_freq: [1],
		osc_gain: [1]
	}
};