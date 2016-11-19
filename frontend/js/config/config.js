import instruments from './instruments.js'

module.exports = new function () {
	this.envelope = {
		attack: 150,
		decay: 250,
		sustain: 0.7,
		release: 550
	};

	this.instruments = instruments; // TODO allow to add/remove instruments
	this.instrument = instruments.sine;

	this.bpm = 60;

	this.mode = __constants.MODES.pentatonicMajor;

	this.scale = __constants.SCALES.sharp.scale;
};