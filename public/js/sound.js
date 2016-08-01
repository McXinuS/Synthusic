function Sound(audioContext) {
	this.maxGain = 0.1;
	this.oscillators = [];
	this.audioContext = audioContext;
	this.masterGainNode = this.audioContext.createGain();
	this.masterGainNode.connect(this.audioContext.destination);
}

Sound.prototype.createOscillator = function (note) {
	var oscillators = [];
	var pitch = note.freq;
	for (var i = 0; i < instr.osc_count; i++) {
		var gainNode = audioContext.createGain();
		gainNode.connect(this.masterGainNode);
		gainNode.gain.value = 0;

		osc = audioContext.createOscillator();
		osc.gainNode = gainNode;
		osc.connect(gainNode);
		osc.type = instr.osc_type[i];
		osc.frequency.value = pitch * instr.osc_freq[i];
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
		}	// TODO
	}
	console.log('Sound: new note: ' + note.name + note.octave);
};

Sound.prototype.stopNote = function (note) {
	var index = note.index;
	if (this.oscillators[index]) {
		for (var j = 0; j < instr.osc_count; j++) {
			this.oscillators[index][j].stop(0);
			this.oscillators[index][j].disconnect();
		}
		this.oscillators[index] = null;
	}
	console.log('Sound: stop note: ' + note.name + note.octave);
};

Sound.prototype.stop = function () {
	for (var i = 0; i < this.oscillators.length; i++) {
		for (var j = 0; j < instr.osc_count; j++) {
			this.oscillators[i][j].stop(0);
			this.oscillators[i][j].disconnect();
		}
		this.oscillators[i] = null;
	}
	console.log('Sound: stop');
};

Sound.prototype.getGain = function (note) {
	var index = note.index;
	if (!this.oscillators[index])
		return 0;
	return this.oscillators[index][0].gainNode.gain.value / instr.osc_gain[0];
};
Sound.prototype.setGain = function (note, gain) {
	var index = note.index;
	if (this.oscillators[index]) {
		for (var j = 0; j < instr.osc_count; j++) {
			this.oscillators[index][j].gainNode.gain.value = gain * instr.osc_gain[j];
		}
	}
};

Sound.prototype.getMasterGain = function () {
	return this.masterGainNode.gain.value;
};
Sound.prototype.setMasterGain = function (gain) {
	this.masterGainNode.gain.value = gain;
};