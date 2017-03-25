// TODO beautify visualisation
import {RGBtoHSV, HSVtoRGB} from '../ext.js'

exports.Oscilloscope = Oscilloscope;

function Oscilloscope(canvas) {

    this.RENDER_DISABLED = -1;
    this.RENDER_THEORY = 0;
    this.RENDER_LIVE_AMPLITUDE = 1;
    this.RENDER_LIVE_FREQUENCY = 2;

    Object.defineProperties(this, {
        renderType: {
            get: () => {
                return this._renderType;
            },
            set: (rt) => {
                this._renderType = rt;
                if (rt == this.RENDER_THEORY) {
                    this.recalcAmplitudes();
                }
                this.invalidate();
            }
        },
        scale: {
            get: () => {
                return this._scale;
            },
            set: (sc) => {
                this._scale = sc;
                this.recalcAmplitudes();
                this.invalidate();
            }
        },
        sampleRate: {
            get: () => {
                return this._sampleRate;
            },
            set: (sr) => {
                if (sr < 0) this._sampleRate = 0;
                else if (sr > 100000) this._sampleRate = 100000;
                else this._sampleRate = sr;
                this.recalcAmplitudes();
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

        this.scale = 0.00004;
        this.sampleRate = 300;
        this.renderType = this.RENDER_THEORY;

        this.onResize();
        this.clearAmplitudeBuffer();
        this.draw();
    }.bind(this);
    init();

    window.addEventListener('resize', function () {
        this.onResize();
    }.bind(this), true);

    document.body.addEventListener('playnote', (e) => {
        this.addNote(e.detail);
    });

    document.body.addEventListener('stopnote', (e) => {
        this.removeNote(e.detail);
    });

    document.body.addEventListener('stop', () => {
        this.stop();
    });
}

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
    let oscDivW = this.canvas.parentNode.clientWidth
        - (parseFloat(oscParentStyle.paddingLeft) + parseFloat(oscParentStyle.paddingRight))
        - (parseFloat(oscStyle.paddingLeft) + parseFloat(oscStyle.paddingRight));

    this.canvas.setAttribute('width', oscDivW);
    this.canvas.setAttribute('height', oscDivW);
    this.maskCanvas.setAttribute('width', oscDivW);
    this.maskCanvas.setAttribute('height', oscDivW);

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.center = {x: this.canvas.width / 2, y: this.canvas.height / 2};
    this.renderLivePxPerFreq = this.center.y / 255.;
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
    if (this.renderType == this.RENDER_THEORY) this.calcAmplitudes();
    this.invalidate();
};

Oscilloscope.prototype.removeNote = function (note) {
    if (this.renderType == this.RENDER_THEORY) {
        delete this.amplitudeBuffer[note];
        delete this.canvasBuffer[note];
    }
    this.invalidate();
};

Oscilloscope.prototype.stop = function () {
    if (this.renderType == this.RENDER_THEORY) this.clearAmplitudeBuffer();
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

    if (this.renderType == this.RENDER_THEORY && main.playing.length > 0) {
        this.drawTheoreticalWaves();
    } else if (this.renderType == this.RENDER_LIVE_AMPLITUDE || this.renderType == this.RENDER_LIVE_FREQUENCY) {
        this.drawFromBuffer();
    }

    window.requestAnimationFrame(() => {
        this.draw()
    });
};

Oscilloscope.prototype.drawTheoreticalWaves = function () {
    for (let note in main.playing) {
        this.drawSourceWaves(note);
    }
    this.drawResultingWave();
};

Oscilloscope.prototype.drawFromBuffer = function () {
    var buffer, scaleX;
    if (this.renderType == this.RENDER_LIVE_AMPLITUDE) {
        buffer = main.sound.getAudioAmpBuffer();
        scaleX = -this.center.y;
    } else {
        buffer = main.sound.getAudioFreqBuffer();
        scaleX = this.renderLivePxPerFreq;
    }

    this.ctx.lineWidth = this.lineWidthLive;
    this.ctx.strokeStyle = '#4f4';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.center.y);
    for (var i = 0; i < buffer.length; i++) {
        this.ctx.lineTo(i * this.step, this.center.y + scaleX * buffer[i]);
    }
    this.ctx.stroke();

    this.invalidate();
};

Oscilloscope.prototype.drawSourceWaves = function (note) {
    this.ctx.lineWidth = this.lineWidthSrc;
    this.ctx.strokeStyle = getWaveColor(__note.getNote(note).index);
    this.ctx.beginPath();
    for (var i = 0; i < main.instrument.oscillators.length; i++) {
        this.ctx.moveTo(0, this.canvasBuffer[note][i][0]);
        for (var j = 0; j < this.sampleRate; j++) {
            this.ctx.lineTo(j * this.step, this.canvasBuffer[note][i][j]);
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

    let pointY;
    this.ctx.beginPath();
    for (var j = 0; j < this.sampleRate; j++) {
        var resAmpl = 0;
        for (var note in main.playing) {
            for (var i = 0; i < main.instrument.oscillators.length; i++) {
                resAmpl += this.canvasBuffer[note][i][j];
            }
        }
        pointY = resAmpl / main.instrument.oscillators.length / main.playing.length;
        if (j==0) {
            this.ctx.moveTo(0, pointY);
        } else {
            this.ctx.lineTo(j * this.step, pointY);
        }
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
};

/**
 * Calculate amplitudes of waves of notes.
 */
Oscilloscope.prototype.calcAmplitudes = function () {
    for (let note in main.playing) {
        if (this.amplitudeBuffer[note]) continue;

        let i, j;

        var baseFreq = __note.getNote(note).freq * 2 * Math.PI;
        this.amplitudeBuffer[note] = [];
        for (i = 0; i < main.instrument.oscillators.length; i++) {
            var waveFunc = __constants.WAVE_FUNCTION(main.instrument.oscillators[i].type);
            this.amplitudeBuffer[note][i] = [];
            var amplMultiplier = main.instrument.oscillators[i].gain;
            var freq = baseFreq * main.instrument.oscillators[i].freq * this.scale;
            var center = this.center.x / this.step;
            for (j = 0; j <= this.sampleRate; j++) {
                this.amplitudeBuffer[note][i][j] = amplMultiplier * waveFunc(freq * (j - center));
            }
        }

        this.canvasBuffer[note] = [];
        for (i = 0; i < main.instrument.oscillators.length; i++) {
            this.canvasBuffer[note][i] = [];
            for (j = 0; j <= this.sampleRate; j++) {
                // reverse value of amplitude because
                // the lowest point of the canvas (j,0)
                // is the highest amplitude of wave
                this.canvasBuffer[note][i][j] = -this.center.y * this.amplitudeBuffer[note][i][j] + this.center.y;
            }
        }
    }
};

Oscilloscope.prototype.clearAmplitudeBuffer = function () {
    this.amplitudeBuffer = [];
    this.canvasBuffer = [];
};

Oscilloscope.prototype.recalcAmplitudes = function () {
    this.clearAmplitudeBuffer();
    this.calcAmplitudes();
};

Oscilloscope.prototype.loadMask = function (url) {
    this.mask = new Image();
    this.mask.setAttribute('crossOrigin', 'anonymous');
    this.mask.onload = function () {
        this.prepareMask(this.mask);
    }.bind(this);
    this.mask.src = url;
};

Oscilloscope.prototype.prepareMask = function () {
    if (typeof(this.maskCanvas) == 'undefined' || typeof(this.mask) == 'undefined') return;

    // clear screen
    this.mctx.beginPath();
    this.mctx.fillStyle = 'rgba(0,0,0,0)';
    this.mctx.fillRect(0, 0, this.width, this.height);
    this.mctx.fill();

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
    maskCanvas.setAttribute('style', 'position: absolute; top: 0; z-index: 1');
    return maskCanvas;
}