exports.Oscilloscope = Oscilloscope;

const RENDER_DISABLED = 0;
const RENDER_LIVE = 1;
const RENDER_THEORY = 2;

function Oscilloscope(canvas) {

	var self = this;
	Object.defineProperties(Oscilloscope, {
		renderType: {
			get: function () {
				return self.renderType;
			},
			set: function (renderType) {
				self.renderType = renderType;
			}
		}
	});

	this.renderType = RENDER_DISABLED;
	this.canvas = canvas;
	this.mask = new Image();
	this.mask.src = 'img/osc_overlay.png';
	this.mask.onload = function () {
		self.draw();
	};
	this.onResize();
	this.reset();

	this.renderType = RENDER_THEORY;
	this.draw();
}

Oscilloscope.prototype.onResize = function () {
	// hack: get oscDiv content width by creating a new div and getting its width
	var oscDiv = this.canvas.parentNode;
	var oscDivTemp = document.createElement('div');
	oscDiv.appendChild(oscDivTemp);
	var oscDivTempStyle = window.getComputedStyle(oscDivTemp, null);
	var oscDivW = oscDivTempStyle.getPropertyValue("width");
	oscDiv.removeChild(oscDivTemp);

	this.canvas.setAttribute('width', oscDivW);
	this.canvas.setAttribute('height', '500px');

	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.maxAmplitudeHeight = this.canvas.height / 2;
	this.center = {x: this.canvas.width / 2, y: this.canvas.height / 2};

	this.setSampleRate(this.sampleRate);

	this.draw();
};

Oscilloscope.prototype.setScale = function (scale) {
	this.scale = scale;
	this.draw();
};

// calculate number of measures per wave
Oscilloscope.prototype.setSampleRate = function (sampleRate) {
	if (typeof(sampleRate) == 'undefined') return;
	if (sampleRate < 0 || sampleRate > 100000) return;

	this.sampleRate = sampleRate;
	this.step = this.width / this.sampleRate;
};

Oscilloscope.prototype.reset = function () {
	this.ctx = this.canvas.getContext("2d");

	this.lineWidthRes = 2;
	this.lineWidthSrc = 0.7;

	this.setScale(0.00002);
	this.setSampleRate(300);

	this.stop();
};

Oscilloscope.prototype.addNote = function (note) {
	// check for duplicate
	for (var name in this.notes) {
		if (this.notes[name].name == note.name && this.notes[name].octave == note.octave) {
			// don't add to the 'notes' list if exists, just draw
			this.draw();
			return;
		}
	}

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

Oscilloscope.prototype.stop = function () {
	this.notes = [];
	this.canvasAmplitudeBuffer = [];	// constants of each oscillator waves

	this.draw();
};

/**
 * Calculate the points of waves of the note on canvas.
 */
Oscilloscope.prototype.calcAmplitudes = function (note) {
	this.canvasAmplitudeBuffer[note] = [];
	var baseFreq = note.freq * 2 * Math.PI;

	for (var i = 0; i < main.instrument.osc_count; i++) {
		var waveFunc = constants.WAVE_FUNCTION(main.instrument.osc_type[i]);
		this.canvasAmplitudeBuffer[note][i] = [];
		// reverse value of amplitude because the lower point of canvas (j,0)
		// is the highest possible amplitude of wave
		var amplMultiplier = -this.maxAmplitudeHeight * main.instrument.osc_gain[i];
		var freq = baseFreq * main.instrument.osc_freq[i] * this.scale;
		var center = this.center.x / this.step;
		for (var j = 0; j <= this.sampleRate; j++) {
			this.canvasAmplitudeBuffer[note][i][j] =
				amplMultiplier * waveFunc(freq * (j - center)) + this.maxAmplitudeHeight;
		}
	}
};

Oscilloscope.prototype.draw = function () {
	// check for proper initialization of oscilloscope
	if (typeof(this.width) == 'undefined') return;
	if (typeof(this.ctx) == 'undefined') return;

	// clear screen
	this.ctx.beginPath();
	this.ctx.fillStyle = '#000';
	this.ctx.fillRect(0, 0, this.width, this.height);

	// axis
	this.ctx.strokeStyle = '#aaa';
	this.ctx.beginPath();
	this.ctx.moveTo(0, this.center.y);
	this.ctx.lineTo(this.width, this.center.y);
	this.ctx.moveTo(this.center.x, 0);
	this.ctx.lineTo(this.center.x, this.height);
	this.ctx.stroke();

	if (this.renderType != RENDER_DISABLED && this.notes.length > 0) {
		for (var i = 0; i < this.notes.length; i++) {
			this.drawSourceWaves(this.notes[i]);
		}
		this.drawResultingWave();
	}

	// apply mask
	this.ctx.shadowBlur = 11;
	this.ctx.shadowColor = "#060";
	this.ctx.drawImage(this.mask, 0, 0, this.width, this.height);
	this.ctx.shadowBlur = 0;
};

Oscilloscope.prototype.drawSourceWaves = function (note) {
	if (!this.canvasAmplitudeBuffer[note])
		this.calcAmplitudes(note);
	this.ctx.lineWidth = this.lineWidthSrc;

	this.ctx.strokeStyle = getWaveColor(note.index);
	this.ctx.beginPath();
	for (var i = 0; i < main.instrument.osc_count; i++) {
		this.ctx.moveTo(0, this.canvasAmplitudeBuffer[note][i][0]);
		for (var j = 0; j < this.sampleRate; j++) {
			this.ctx.lineTo(j * this.step, this.canvasAmplitudeBuffer[note][i][j]);
		}
	}
	this.ctx.stroke();
};

/**
 * color is based on the note index:
 * bass - red
 * middle - green
 * treble - blue
 */
function getWaveColor(index) {
	var relIndex = index / (notesCount - 1);
	var r = Math.floor(256 * (1 - relIndex));
	var g = (relIndex < 0.5) ? Math.floor(256 * (relIndex / 0.5)) : Math.floor(256 * ((1 - relIndex) / 0.5));
	var b = Math.floor(256 * relIndex);
	return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

Oscilloscope.prototype.drawResultingWave = function () {
	this.ctx.lineWidth = this.lineWidthRes;
	this.ctx.strokeStyle = '#4f4';
	this.ctx.shadowOffsetY = 3;
	this.ctx.shadowBlur = this.ctx.shadowOffsetY * 2;
	this.ctx.shadowColor = '#3a3';

	var names = [];
	let nInd;
	for (nInd = 0; nInd < this.notes.length; nInd++) {
		var note = this.notes[nInd];
		names[nInd] = note.toString();
		if (!this.canvasAmplitudeBuffer[names[nInd]])
			this.calcAmplitudes(note);
	}

	this.ctx.beginPath();
	this.ctx.moveTo(0, this.maxAmplitudeHeight);
	for (var j = 0; j < this.sampleRate; j++) {
		var resAmpl = 0;
		for (nInd = 0; nInd < this.notes.length; nInd++) {
			var name = names[nInd];
			for (var i = 0; i < main.instrument.osc_count; i++) {
				resAmpl += this.canvasAmplitudeBuffer[name][i][j];
			}
		}
		this.ctx.lineTo(j * this.step, resAmpl / main.instrument.osc_count / this.notes.length);
	}
	this.ctx.stroke();
	this.ctx.shadowBlur = 0;
	this.ctx.shadowOffsetY = 0;
};
