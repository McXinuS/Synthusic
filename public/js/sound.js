function Sound(audioContext) {
	this.oscillators = [];
	this.audioContext = audioContext;
	this.masterGainNode = this.audioContext.createGain();
	this.masterGainNode.connect(this.audioContext.destination);
}

Sound.prototype.createOscillator = function (note) {
	var oscillators = [];
	var pitch = note.freq;
	for (var i = 0; i < instrument.osc_count; i++) {
		var gainNode = audioContext.createGain();
		gainNode.connect(this.masterGainNode);
		gainNode.gain.value = 0;

		osc = audioContext.createOscillator();
		osc.gainNode = gainNode;
		osc.connect(gainNode);
		osc.type = instrument.osc_type[i];
		osc.frequency.value = pitch * instrument.osc_freq[i];
		osc.start(0);

		oscillators.push(osc);
	}
	return oscillators;
};

Sound.prototype.playNote = function (note, duration) {
	var index = note.index;
	if (!this.oscillators[index]) {
		this.oscillators[index] = this.createOscillator(note);
		this.setGain(note, 1);
		if (duration) {
			setTimeout(function () {
				// without 'this' qualifier! stop it using main.js function
				stopNote(note);
			}, duration);
		}	// TODO
	}
};

Sound.prototype.stopNote = function (note) {
	var index = note.index;
	if (this.oscillators[index]) {
		for (var j = 0; j < instrument.osc_count; j++) {
			this.oscillators[index][j].stop(0);
			this.oscillators[index][j].disconnect();
		}
		this.oscillators[index] = null;
	}
};

Sound.prototype.stop = function () {
	for (var index in this.oscillators) {
		if (this.oscillators[index] == null)
			continue;
		for (var j = 0; j < instrument.osc_count; j++) {
			this.oscillators[index][j].stop(0);
			this.oscillators[index][j].disconnect();
		}
	}
	this.oscillators = [];
};

Sound.prototype.getGain = function (note) {
	var index = note.index;
	if (!this.oscillators[index])
		return 0;
	return this.oscillators[index][0].gainNode.gain.value / instrument.osc_gain[0];
};
Sound.prototype.setGain = function (note, gain) {
	var index = note.index;
	if (this.oscillators[index]) {
		for (var j = 0; j < instrument.osc_count; j++) {
			this.oscillators[index][j].gainNode.gain.value = gain * instrument.osc_gain[j];
		}
	}
};

Sound.prototype.getMasterGain = function () {
	return this.masterGainNode.gain.value;
};
Sound.prototype.setMasterGain = function (gain) {
	this.masterGainNode.gain.value = gain;
};