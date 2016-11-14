exports.Sound = Sound;
import Enveloper from './enveloper';
import Analyser from './analyser';

var RAMP_STOP_TIME = 50; // time when a note will be stopped (removes click when changing one note to another)

function Sound(audioContext, instrument) {
    this.oscillators = [];
    this.instrument = instrument;

    this.audioContext = audioContext;

    this.analyser = new Analyser({
        audioCtx: audioContext,
        fftSize: 2048
    });
    this.analyserNode = this.analyser.getAnalyserNode();
    this.analyserNode.connect(this.audioContext.destination);

    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.analyserNode);

    this.enveloper = new Enveloper(config.ENVELOPER_OPTIONS, audioContext);
    this.enveloper.onFinished = function () {
        this.stop()
    }.bind(this);
    this.enveloperGainNode = this.enveloper.getGainNode();
    this.enveloperGainNode.connect(this.masterGainNode);

    // note that awaiting to be stopped when enveloper is faded
    this.noteToStop = undefined;
}

Sound.prototype.createOscillators = function (note) {
    var oscillators = [];
    var pitch = note.freq;
    var osc;
    for (var i = 0; i < this.instrument.osc_count; i++) {
        var gainNode = audioContext.createGain();
        gainNode.connect(this.enveloperGainNode);
        gainNode.gain.value = 0;

        osc = audioContext.createOscillator();
        osc.gainNode = gainNode;
        osc.connect(gainNode);
        osc.type = this.instrument.osc_type[i];
        osc.frequency.value = pitch * this.instrument.osc_freq[i];
        osc.start(0);

        oscillators.push(osc);
    }
    return oscillators;
};

Sound.prototype.playNote = function (note, duration) {
    if (this.noteToStop != undefined) {
        this.stopNoteImmediately(this.noteToStop, true);
        this.noteToStop = undefined;
    }

    if (this.oscillators[note]) {
        this.enveloper.start();
        return;
    }

    this.oscillators[note] = this.createOscillators(note);
    this.setGain(note, 1, true);
    if (duration) {
        setTimeout(function () {
            // stop it using function from 'main.js'
            main.stopNote({note: note});
        }, duration);
    }
    this.enveloper.start();
};

Sound.prototype.stopNote = function (note) {
    if (!this.oscillators[note]) return;

    var oscCount = Object.keys(this.oscillators).length;
    // if the only note is stopped, release the enveloper
    if (oscCount == 1) {
        this.enveloper.release();
        // we need to remember currently fading note to stop it
        // if some note will be played before enveloper released
        this.noteToStop = note;
    } else {
        this.setGain(note, 0, true);
        setTimeout(function () {
            this.stopNoteImmediately(note)
        }.bind(this), RAMP_STOP_TIME);
    }
};

// If immediatelly = true, stop the note
// Otherwise, stop it in RAMP_STOP_TIME to prevent click effect
Sound.prototype.stopNoteImmediately = function (note) {
    if (!this.oscillators[note]) return;

    for (var j = 0; j < this.instrument.osc_count; j++) {
        this.oscillators[note][j].stop(0);
        this.oscillators[note][j].disconnect();
    }
    delete (this.oscillators[note]);
};

Sound.prototype.stop = function () {
    this.noteToStop = undefined;

    for (var name in this.oscillators) {
        if (this.oscillators[name] == null)
            continue;
        for (var j = 0; j < this.instrument.osc_count; j++) {
            this.oscillators[name][j].stop(0);
            this.oscillators[name][j].disconnect();
        }
    }
    this.oscillators = [];
};

// 'note' is actually a name of the note, not an object
Sound.prototype.getGain = function (note) {
    if (!this.oscillators[note]) return 0;
    return this.oscillators[note][0].gainNode.gain.value / this.instrument.osc_gain[0];
};
Sound.prototype.setGain = function (note, gain, linear) {
    if (!this.oscillators[note]) return;

    if (!linear) {
        // stop instantly
        for (let j = 0; j < this.instrument.osc_count; j++) {
            this.oscillators[note][j].gainNode.gain.value = gain * this.instrument.osc_gain[j];
        }
    } else {
        // grow gain to 'gain' value in RAMP_STOP_TIME milliseconds
        for (let j = 0; j < this.instrument.osc_count; j++) {
            var gainNode = this.oscillators[note][j].gainNode;
            gainNode.gain.linearRampToValueAtTime(gain * this.instrument.osc_gain[j],
                this.audioContext.currentTime + RAMP_STOP_TIME / 1000.0);
        }
    }
};

Sound.prototype.getMasterGain = function () {
    return this.masterGainNode.gain.value;
};
Sound.prototype.setMasterGain = function (gain) {
    this.masterGainNode.gain.value = gain;
};

Sound.prototype.getAudioAmpBuffer = function () {
    return this.analyser.getFloatTimeDomainData();
};

Sound.prototype.getAudioFreqBuffer = function () {
    return this.analyser.getByteFrequencyData();
};