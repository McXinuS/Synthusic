function Oscilloscope(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	
	this.width = canvas.width;
	this.height = canvas.height;
	this.amplitude = canvas.height / 2;
	this.center = { x: canvas.width / 2, y: canvas.height / 2 }; //TODO

	this.notes = [];
	this.amplBuf = [];	// values of each oscillator waves

	this.lineWidthRes = 2;
	this.lineWidthSrc = 0.7;

	this.mask = new Image();
	this.mask.src = 'img/osc_overlay.png';
	this.mask.onload = function(obj) {
		obj.draw();
	}(this);

	this.scale = 0.00001;
	this.setSampleRate(300);
}

Oscilloscope.prototype.calcOscillatorAmplitudes = function (note) {
	var index = note.index;
	this.amplBuf[index] = [];
	var baseFreq = note.freq * 2 * Math.PI;

	for (var i = 0; i < instr.osc_count; i++) {
		this.amplBuf[index][i] = [];
		var ampl = this.amplitude * instr.osc_gain[i];
		var freq = baseFreq * instr.osc_freq[i] * this.scale;
		var waveFunc;
		switch (instr.osc_type[i]) {
			case 'sine':
				waveFunc = Math.sin;
				break;
			case 'square':
				waveFunc = function (val) {
					return (Math.sin(val) > 0) ? 1 : -1
				};
				break;
		}
		for (var j = 0; j <= this.width; j += this.step) {
			this.amplBuf[index][i][j] = ampl * waveFunc(freq * (j-this.center.x)) + this.amplitude;
		}
	}
};

Oscilloscope.prototype.drawSourceWaves = function (note) {
	var index = note.index;
	if (!this.amplBuf[index])
		this.calcOscillatorAmplitudes(note);
	var baseFreq = note.freq * 2 * 3.14;
	this.ctx.lineWidth = this.lineWidthSrc;
	
	// color is based on the note index:
	// bass is red, middle is green and treble is blue 
	var relIndex = index / (notesCount-1);
	var r = Math.floor(256 * (1 - relIndex));
	var g = (relIndex<0.5) ?  Math.floor(256 * (relIndex / 0.5)) : Math.floor(256 * ((1 - relIndex) / 0.5));
	var b = Math.floor(256 * relIndex);
	var strokeColor = [];
	strokeColor.push(
		'rgb(',
		r,
		', ',
		g,
		', ',
		b,
		')'
	);
	this.ctx.strokeStyle = strokeColor.join("");

	this.ctx.beginPath();
	for (var i = 0; i < instr.osc_count; i++) {
		this.ctx.moveTo(0,this.amplitude);
		for (var j = 0; j < this.width; j += this.step) {
			this.ctx.lineTo(j, this.amplBuf[index][i][j]);
		}
	}
	this.ctx.stroke();
};

Oscilloscope.prototype.drawResultingWave = function () {
	this.ctx.lineWidth = this.lineWidthRes;
	this.ctx.strokeStyle = '#4f4';
	this.ctx.shadowOffsetY = 3;
	this.ctx.shadowBlur = this.ctx.shadowOffsetY*2;
	this.ctx.shadowColor = '#3a3';

	var indexes = [];
	for (var nInd = 0; nInd < this.notes.length; nInd++) {
		var note = this.notes[nInd];
		indexes[nInd] = note.index;
		if (!this.amplBuf[indexes[nInd]])
			this.calcOscillatorAmplitudes(note);
	}

	this.ctx.beginPath();
	this.ctx.moveTo(0,this.amplitude);
	for (var j = 0; j < this.width; j += this.step) {
		var resAmpl = 0;
		for (var nInd = 0; nInd < this.notes.length; nInd++) {
			var index = indexes[nInd];
			for (var i = 0; i < instr.osc_count; i++) {
				resAmpl += this.amplBuf[index][i][j];
			}
		}
		this.ctx.lineTo(j, resAmpl / instr.osc_count / this.notes.length);
	}
	this.ctx.stroke();
	this.ctx.shadowBlur = 0;
	this.ctx.shadowOffsetY = 0;
};

Oscilloscope.prototype.draw = function () {
	// clear screen
	this.ctx.beginPath();
	this.ctx.fillStyle = '#000';
	this.ctx.fillRect(0, 0, this.width, this.height);
	
	// grid
	// TODO: make a grid
	this.ctx.strokeStyle = '#aaa';
	this.ctx.beginPath();
	this.ctx.moveTo(0,this.center.y);
	this.ctx.lineTo(this.width,this.center.y);
	this.ctx.moveTo(this.center.x, 0);
	this.ctx.lineTo(this.center.x,this.height);
	this.ctx.stroke();
	
	for (var i = 0; i < this.notes.length; i++) {
		this.drawSourceWaves(this.notes[i]);
	}
	this.drawResultingWave();
	
	// apply mask
	this.ctx.shadowBlur = 11;
	this.ctx.shadowColor = "#060";
	this.ctx.drawImage(this.mask, 0, 0, this.width, this.height);
	this.ctx.shadowBlur = 0;
};

Oscilloscope.prototype.setScale = function (scale) {
	this.scale = scale;
	this.draw();
};

// calculate number of measures per wave
Oscilloscope.prototype.setSampleRate = function (sampleRate) {
	this.sampleRate = sampleRate;
	this.step = Math.floor(this.width / this.sampleRate);
};

Oscilloscope.prototype.addNote = function (note) {
	this.notes.push(note);
	this.draw();
};

Oscilloscope.prototype.removeNote = function (note) {
	for (var i = 0; i < this.notes.length; i++) {
		var curNote = this.notes[i];
		if (curNote.name === note.name && curNote.octave === note.octave) {
			this.notes.splice(i, 1);
			break;
		}
	}
	this.draw();
};