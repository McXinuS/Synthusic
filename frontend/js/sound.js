exports.Sound = Sound;
import _enveloper from './enveloper';

function Sound(audioContext) {
	this.oscillators = [];

	this.audioContext = audioContext;
	this.masterGainNode = this.audioContext.createGain();
	this.masterGainNode.connect(this.audioContext.destination);

	this.enveloper = new _enveloper(constants.ENVELOPER_OPTIONS, audioContext);
	this.enveloperGainNode = this.enveloper.getGainNode();
	this.enveloperGainNode.connect(this.masterGainNode);

	this._timeoutId = -1;
	this._noteToStop = undefined;
}

Sound.prototype.createOscillators = function (note) {
	var oscillators = [];
	var pitch = note.freq;
	var osc;
	for (var i = 0; i < main.instrument.osc_count; i++) {
		var gainNode = audioContext.createGain();
		gainNode.connect(this.enveloperGainNode);
		gainNode.gain.value = 0;

		osc = audioContext.createOscillator();
		osc.gainNode = gainNode;
		osc.connect(gainNode);
		osc.type = main.instrument.osc_type[i];
		osc.frequency.value = pitch * main.instrument.osc_freq[i];
		osc.start(0);

		oscillators.push(osc);
	}
	return oscillators;
};

Sound.prototype.playNote = function (note, duration) {

	// prevent current note from stopping
	// stop it manually if needed
	clearTimeout(this._timeoutId);

	if (!this.oscillators[note]) {
		this.oscillators[note] = this.createOscillators(note);
		this.setGain(note, 1);

		// check if some note is still waiting for ADSR to release and stop it manually
		if (this._timeoutId != -1) {
			this.stopNoteImmediately(this._noteToStop);
		}

		if (duration) {
			setTimeout(function () {
				// stop it using function from 'main.js'
				main.stopNote({note: note});
			}, duration);
		}
	}
	this.enveloper.start();

	this._timeoutId = -1;

};

Sound.prototype.stopNote = function (note) {

	if (this.oscillators[note]) {
		var stopTime = 0;
		var oscCount = Object.keys(this.oscillators).length;
		// if the only note is stopped, release the enveloper
		if (oscCount == 1){
			this.enveloper.release();
			stopTime = constants.ENVELOPER_OPTIONS.release;
		}

		this._noteToStop = note;
		this._timeoutId = setTimeout(function(){
			this.stopNoteImmediately(note);
		}.bind(this), stopTime);
	}

};

Sound.prototype.stopNoteImmediately = function (note) {

	if (!this.oscillators[note])
		return;
	for (var j = 0; j < main.instrument.osc_count; j++) {
		this.oscillators[note][j].stop(0);
		this.oscillators[note][j].disconnect();
	}
	delete (this.oscillators[note]);

};

Sound.prototype.stop = function () {

	this.enveloper.release();
	for (var name in this.oscillators) {
		if (this.oscillators[name] == null)
			continue;
		for (var j = 0; j < main.instrument.osc_count; j++) {
			this.oscillators[name][j].stop(0);
			this.oscillators[name][j].disconnect();
		}
	}
	this.oscillators = [];

};

// 'note' is actually a name of the note, not an object
Sound.prototype.getGain = function (note) {
	if (!this.oscillators[note])
		return 0;
	return this.oscillators[note][0].gainNode.gain.value / main.instrument.osc_gain[0];
};
Sound.prototype.setGain = function (note, gain) {
	if (this.oscillators[note]) {
		for (var j = 0; j < main.instrument.osc_count; j++) {
			this.oscillators[note][j].gainNode.gain.value = gain * main.instrument.osc_gain[j];
		}
	}
};

Sound.prototype.getMasterGain = function () {
	return this.masterGainNode.gain.value;
};
Sound.prototype.setMasterGain = function (gain) {
	this.masterGainNode.gain.value = gain;
};