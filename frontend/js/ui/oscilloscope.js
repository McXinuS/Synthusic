exports.Oscilloscope = Oscilloscope;

// TODO: add invalidate()

function Oscilloscope(canvas) {

    this.RENDER_THEORY = 0;
    this.RENDER_LIVE_AMPLITUDE = 1;
    this.RENDER_LIVE_FREQUENCY = 2;
    this.RENDER_DISABLED = 3;

    var self = this;
    Object.defineProperties(Oscilloscope, {
        renderType: {
            get: () => {
                return self._renderType;
            },
            set: (rt) => {
                self._renderType = rt;
                self.invalidate();
            }
        },
        scale: {
            get: () => {
                return self._scale;
            },
            set: (sc) => {
                this._scale = sc;
                this.invalidate();
            }
        },
        sampleRate: {
            get: () => {
                return this._sampleRate;
            },
            set: (sr) => {
                if (sr < 0 || sr > 100000) return;

                this._sampleRate = sr;
            }
        }
    });

    this._valid = true;

    this.canvas = canvas;
    this.canvas.setAttribute('style', "z-index: 0");

    this.mask = new Image();
    this.mask.src = 'img/osc_overlay.png';
    this.mask.onload = function () {
        self.applyMask();
    };
    this.maskCanvas = createMaskCanvas();
    this.canvas.parentNode.appendChild(this.maskCanvas);

    this.reset();
    this.onResize();

    this.renderType = this.RENDER_THEORY;
    this.draw();
}

Oscilloscope.prototype.reset = function () {
    this.ctx = this.canvas.getContext("2d");
    this.mctx = this.maskCanvas.getContext("2d");

    this.lineWidthRes = 2;
    this.lineWidthSrc = 0.7;

    this.scale = 0.00002;
    this.sampleRate = 300;

    this.stop();
};

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
    this.maskCanvas.setAttribute('width', oscDivW);
    this.maskCanvas.setAttribute('height', '500px');

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.maxAmplitudeHeight = this.canvas.height / 2;
    this.renderLiveFreqToPx = this.maxAmplitudeHeight / 255.;
    this.center = {x: this.canvas.width / 2, y: this.canvas.height / 2};
    if (this.width > 0) {
        this.step = this.width / this.sampleRate;
    }

    this.applyMask();
    this.invalidate();
};

Oscilloscope.prototype.invalidate = function () {
    this._valid = false;
};

Oscilloscope.prototype.addNote = function (note) {
    // check for duplicate
    for (var name in this.notes) {
        if (this.notes[name].name == note.name && this.notes[name].octave == note.octave) {
            // don't add to the 'notes' list if exists, just draw
            this.invalidate();
            return;
        }
    }

    this.notes.push(note);
    this.invalidate();
};

Oscilloscope.prototype.removeNote = function (note) {
    for (var i = 0; i < this.notes.length; i++) {
        var curNote = this.notes[i];
        if (curNote.name === note.name && curNote.octave === note.octave) {
            this.notes.splice(i, 1);
            break;
        }
    }
    this.invalidate();
};

Oscilloscope.prototype.stop = function () {
    this.notes = [];
    this.canvasAmplitudeBuffer = [];	// constants of each oscillator waves

    this.invalidate();
};

Oscilloscope.prototype.draw = function () {
    // check for proper state of oscilloscope
    if (this._valid == true || typeof(this.ctx) == 'undefined' || this.width <= 0 ||
        this.renderType == this.RENDER_DISABLED) {
        window.requestAnimationFrame(() => {
            this.draw()
        });
        return;
    }

    this._valid = true;

    this.ctx.beginPath();
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fill();

    if (this.renderType == this.RENDER_THEORY && this.notes.length > 0) {
        for (var i = 0; i < this.notes.length; i++) {
            this.drawSourceWaves(this.notes[i]);
        }
        this.drawResultingWave();
    } else if (this.renderType == this.RENDER_LIVE_AMPLITUDE || this.renderType == this.RENDER_LIVE_FREQUENCY) {
        this.drawFromBuffer();
    }

    window.requestAnimationFrame(() => {
        this.draw()
    });
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

Oscilloscope.prototype.drawFromBuffer = function () {
    var buffer, scaleX;
    if (this.renderType == this.RENDER_LIVE_AMPLITUDE) {
        buffer = main.sound.getAudioAmpBuffer();
        scaleX = -this.maxAmplitudeHeight;
    } else {
        buffer = main.sound.getAudioFreqBuffer();
        scaleX = this.renderLiveFreqToPx;
    }

    this.ctx.lineWidth = this.lineWidthRes;
    this.ctx.strokeStyle = '#4f4';
    this.ctx.moveTo(0, buffer[0]);
    for (var i = 0; i < buffer.length; i++) {
        this.ctx.lineTo(i * this.step, this.maxAmplitudeHeight + scaleX * buffer[i]);
    }
    this.ctx.stroke();

    this.invalidate();
};

/**
 * Calculate the points of waves of the note on canvas.
 */
Oscilloscope.prototype.calcAmplitudes = function (note) {
    this.canvasAmplitudeBuffer[note] = [];
    var baseFreq = note.freq * 2 * Math.PI;

    for (var i = 0; i < main.instrument.osc_count; i++) {
        var waveFunc = __config.WAVE_FUNCTION(main.instrument.osc_type[i]);
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

Oscilloscope.prototype.applyMask = function () {
    if (typeof(this.maskCanvas) == 'undefined') return;

    // clear screen
    this.mctx.beginPath();
    this.mctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.mctx.fillRect(0, 0, this.width, this.height);
    this.mctx.fill();

    // axis
    this.mctx.strokeStyle = '#aaa';
    this.mctx.beginPath();
    this.mctx.moveTo(0, this.center.y);
    this.mctx.lineTo(this.width, this.center.y);
    this.mctx.moveTo(this.center.x, 0);
    this.mctx.lineTo(this.center.x, this.height);
    this.mctx.stroke();

    // apply blur image
    this.mctx.shadowBlur = 11;
    this.mctx.shadowColor = "#060";
    this.mctx.drawImage(this.mask, 0, 0, this.width, this.height);
    this.mctx.shadowBlur = 0;
};

/**
 * color is based on the note index:
 * bass - red
 * middle - green
 * treble - blue
 */
function getWaveColor(index) {
    var relIndex = index / (__config.NOTES_COUNT - 1);
    var r = Math.floor(256 * (1 - relIndex));
    var g = (relIndex < 0.5) ? Math.floor(256 * (relIndex / 0.5)) : Math.floor(256 * ((1 - relIndex) / 0.5));
    var b = Math.floor(256 * relIndex);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function createMaskCanvas() {
    var maskCanvas = document.createElement('canvas');
    maskCanvas.classList.add('osc-canvas');
    maskCanvas.setAttribute('style', 'position: absolute; top: 30px; z-index: 1');
    return maskCanvas;
}