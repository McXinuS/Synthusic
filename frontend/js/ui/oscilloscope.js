import {RGBtoHSV, HSVtoRGB, RGBtoSaturation, RGBtoValue} from './ext.js'

exports.Oscilloscope = Oscilloscope;

function Oscilloscope(canvas) {

    this.RENDER_DISABLED = -1;
    this.RENDER_THEORY = 0;
    this.RENDER_LIVE_AMPLITUDE = 1;
    this.RENDER_LIVE_FREQUENCY = 2;
    this.RENDER_IMAGE = 3;

    var self = this;
    Object.defineProperties(this, {
        renderType: {
            get: () => {
                return self._renderType;
            },
            set: (rt) => {
                var prev = self._renderType;
                self._renderType = rt;
                if (prev == this.RENDER_IMAGE) {
                    self.loadMask('img/osc_overlay.png');
                } else if (rt == this.RENDER_IMAGE) {
                    self.loadMask(getRandomImageUrl(self.width, self.height));
                }
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

    let init = function () {
        this._valid = true;

        this.lineWidthRes = 2;
        this.lineWidthSrc = 0.7;
        this.lineWidthLive = 1.5;

        this.canvas = canvas;
        this.canvas.setAttribute('style', "z-index: 0");
        this.ctx = this.canvas.getContext("2d");

        this.maskCanvas = createMaskCanvas();
        this.canvas.parentNode.appendChild(this.maskCanvas);
        this.mctx = this.maskCanvas.getContext("2d");

        this.loadMask('img/osc_overlay.png');

        this.reload();
        this.onResize();

        this.draw();
    }.bind(this);
    init();

    window.addEventListener('resize', function () {
        this.onResize();
    }.bind(this), true);
}

function getRandomImageUrl(w, h) {
    return 'https://s3-us-west-2.amazonaws.com/boom-orca/people-deal-header.png';
    w = w || 1000;
    h = h || 500;
    const urls = [`https://loremflickr.com/${w}/${h}`];
    var ind = Math.floor(Math.random() * urls.length);
    return urls[ind];
}

Oscilloscope.prototype.reload = function () {
    this.scale = 0.00002;
    this.sampleRate = 300;
    this.renderType = this.RENDER_THEORY;

    this.stop();
};

Oscilloscope.prototype.onResize = function () {
    /*
     // hack: get oscDiv content width by creating a new div and getting its width
     var oscDiv = this.canvas.parentNode;
     var oscDivTemp = document.createElement('div');
     oscDiv.appendChild(oscDivTemp);
     var oscDivTempStyle = window.getComputedStyle(oscDivTemp, null);
     var oscDivW = oscDivTempStyle.getPropertyValue("width");
     oscDiv.removeChild(oscDivTemp);
     */

    let oscStyle = window.getComputedStyle(this.canvas, null);
    let oscParentStyle = window.getComputedStyle(this.canvas.parentNode, null);
    let oscDivW = this.canvas.parentNode.clientWidth -
        parseFloat(oscParentStyle.paddingLeft) - parseFloat(oscParentStyle.paddingRight) -
        parseFloat(oscStyle.paddingLeft) - parseFloat(oscStyle.paddingRight);

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

    this.prepareMask();
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
    } else if (this.renderType == this.RENDER_IMAGE) {
        this.drawOnMask();
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
    for (var i = 0; i < main.instrument.oscillators.length; i++) {
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
            for (var i = 0; i < main.instrument.oscillators.length; i++) {
                resAmpl += this.canvasAmplitudeBuffer[name][i][j];
            }
        }
        this.ctx.lineTo(j * this.step, resAmpl / main.instrument.oscillators.length / this.notes.length);
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

    this.ctx.lineWidth = this.lineWidthLive;
    this.ctx.strokeStyle = '#4f4';
    this.ctx.moveTo(0, buffer[0]);
    for (var i = 0; i < buffer.length; i++) {
        this.ctx.lineTo(i * this.step, this.maxAmplitudeHeight + scaleX * buffer[i]);
    }
    this.ctx.stroke();

    this.invalidate();
};

Oscilloscope.prototype.drawOnMask = function () {
    if (!this.shapeMask) return;

    var buffer = main.sound.getAudioAmpBuffer();

    // TODO image should not change
    this.ctx.putImageData(this.shapeMask, 0, 0);

    var step = this.width / (buffer.length + 1);
    for (var i = 0; i < buffer.length; i++) {
        this.ctx.beginPath();
        var col = Math.floor(255 * Math.abs(buffer[i]));
        //this.ctx.fillStyle = `hsla(${360 * Math.abs(buffer[i])},100%,${Math.round(10 * Math.abs(buffer[i]))}%, 0.01)`;
        this.ctx.fillStyle = `rgba(${col}, ${col}, ${col}, 0.1)`;
        this.ctx.fillRect(i * step, 0, (i + 1) * step, this.height);
        this.ctx.fill();
    }

    this.invalidate();
};

Oscilloscope.prototype.loadMask = function (url) {
    this.mask = new Image();
    this.mask.setAttribute('crossOrigin', 'anonymous');
    this.mask.onload = function () {
        this.prepareMask(self.mask);
    }.bind(this);
    this.mask.src = url;
};

Oscilloscope.prototype.prepareMask = function () {
    if (typeof(this.maskCanvas) == 'undefined' || typeof(this.mask) == 'undefined') return;

    // clear screen
    this.mctx.beginPath();
    this.mctx.fillStyle = this.renderType == this.RENDER_IMAGE ? '#000' : 'rgba(0,0,0,0)';
    this.mctx.fillRect(0, 0, this.width, this.height);
    this.mctx.fill();

    if (this.renderType == this.RENDER_IMAGE) {
        // apply blur image
        this.mctx.shadowBlur = 11;
        this.mctx.shadowColor = "#060";
        this.mctx.drawImage(this.mask, 0, 0, this.width, this.height);
        this.mctx.shadowBlur = 0;

        /*
         <div style="
         background-image: url(https://s3-us-west-2.amazonaws.com/boom-orca/people-deal-header.png);
         width: 1060px;
         height: 500px;
         position: absolute;
         top: 30px;
         background-size: 1060px 500px;
         z-index: 2;
         mix-blend-mode: difference;
         " class=""></div>
         */

        // Creates shape of image
        this.shapeMask = this.mctx.getImageData(0, 0, this.width, this.height);
        var maskData = this.shapeMask.data;

        var value;
        for (var i = 0; i < maskData.length; i += 4) {
            value = RGBtoValue([maskData[i], maskData[i + 1], maskData[i + 2]]);
            maskData[i] = maskData[i + 1] = maskData[i + 2] = value;
            maskData[i + 3] = 255;
        }

        //this.mctx.putImageData(this.shapeMask, 0, 0);
        this.mctx.beginPath();
        this.mctx.fillStyle = '#000';
        this.mctx.fillRect(0, 0, this.width, this.height);
        this.mctx.fill();

        if (!this.maskCanvas.classList.contains('blend-mode')) {
            this.maskCanvas.classList.add('blend-mode');
        }
    } else {
        this.maskCanvas.classList.remove('blend-mode');

        // TODO draw grid with labels
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
    }
};

/**
 * Calculate the points of waves of the note on canvas.
 */
Oscilloscope.prototype.calcAmplitudes = function (note) {
    this.canvasAmplitudeBuffer[note] = [];
    var baseFreq = note.freq * 2 * Math.PI;

    for (var i = 0; i < main.instrument.oscillators.length; i++) {
        var waveFunc = __constants.WAVE_FUNCTION(main.instrument.oscillators[i].type);
        this.canvasAmplitudeBuffer[note][i] = [];
        // reverse value of amplitude because the lower point of canvas (j,0)
        // is the highest possible amplitude of wave
        var amplMultiplier = -this.maxAmplitudeHeight * main.instrument.oscillators[i].gain;
        var freq = baseFreq * main.instrument.oscillators[i].freq * this.scale;
        var center = this.center.x / this.step;
        for (var j = 0; j <= this.sampleRate; j++) {
            this.canvasAmplitudeBuffer[note][i][j] =
                amplMultiplier * waveFunc(freq * (j - center)) + this.maxAmplitudeHeight;
        }
    }
};

/**
 * color is based on the note index:
 * bass - red
 * middle - green
 * treble - blue
 */
function getWaveColor(index) {
    var relIndex = index / (__constants.NOTES_COUNT - 1);
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