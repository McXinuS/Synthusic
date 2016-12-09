exports.Sound = Sound;
import Enveloper from './enveloper';
import Analyser from './analyser';
import Convolver from './convolver';

const RAMP_STOP_TIME = 50; // time when a note will be stopped (removes click when changing one note to another)

function Sound(audioContext, instrument) {
    this.oscillators = [];
    this.instrument = instrument;

    this.audioContext = audioContext;

    this.analyser = new Analyser(audioContext);
    this.analyser.connect(this.audioContext.destination);

    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.analyser.getAnalyserNode());

    this.enveloper = new Enveloper(audioContext);
    this.enveloper.onFinished = function () {
        this.stop();
    }.bind(this);
    this.enveloper.connect(this.masterGainNode);

    this._inputNode = this.enveloper.getGainNode();

    /*
     TODO reverb
     this.convolver = new Convolver(audioContext);
     this.convolver.connect(this.enveloper.getGainNode());

     this._inputNode = this.convolver.getConvolverNode();
     */

    // note that will be stopped when enveloper is faded
    this.noteToStop = undefined;
}

Sound.prototype.createOscillators = function (note) {
    let oscillators = [];
    let pitch = note.freq;
    let osc;
    for (let i = 0; i < this.instrument.oscillators.length; i++) {
        let gainNode = audioContext.createGain();
        gainNode.connect(this._inputNode);
        gainNode.gain.value = 0;

        osc = audioContext.createOscillator();
        osc.gainNode = gainNode;
        osc.connect(gainNode);
        osc.type = this.instrument.oscillators[i].type;
        osc.frequency.value = pitch * this.instrument.oscillators[i].freq;
        osc.start(0);

        oscillators.push(osc);
    }
    return oscillators;
};

Sound.prototype.playNote = function (note, duration) {
    if (this.noteToStop != undefined && this.noteToStop != note) {
        this.stopNote(this.noteToStop, true);
        this.noteToStop = undefined;
    }

    if (!this.oscillators[note]) {
        this.oscillators[note] = this.createOscillators(note);
        this.setGain(note, 1, true);
        // TODO remove it from here to main
        if (duration) {
            setTimeout(function () {
                // stop it using function from 'main.js'
                main.stopNote({note: note});
            }, duration);
        }
    }

    this.enveloper.start();
};

/**
 * @param note
 * @param forceStop Don't save the note to stop it later with envelope callback, stop it now instead.
 */
Sound.prototype.stopNote = function (note, forceStop) {
    if (!this.oscillators[note]) return;

    forceStop = forceStop || false;

    let oscCount = Object.keys(this.oscillators).length;
    // if the only note is stopped, release the enveloper
    if (oscCount == 1 && !forceStop) {
        this.enveloper.release();
        // the note will be stopped in enveloper's onFinished callback
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

Sound.prototype.stopNoteImmediately = function (note) {
    if (!this.oscillators[note]) return;

    for (let j = 0; j < this.instrument.oscillators.length; j++) {
        this.oscillators[note][j].stop(0);
        this.oscillators[note][j].disconnect();
    }
    delete (this.oscillators[note]);
};

Sound.prototype.stop = function () {
    this.noteToStop = undefined;

    for (let name in this.oscillators) {
        if (this.oscillators[name] == null)
            continue;
        for (let j = 0; j < this.instrument.oscillators.length; j++) {
            this.oscillators[name][j].stop(0);
            this.oscillators[name][j].disconnect();
        }
    }
    this.oscillators = [];
};

// 'note' is actually a name of the note, not an object
Sound.prototype.getGain = function (note) {
    if (!this.oscillators[note]) return 0;
    return this.oscillators[note][0].gainNode.gain.value / this.instrument.oscillators[0].gain;
};

// If ramp = false, set the note's gain immediately
// Otherwise, set it in RAMP_STOP_TIME to prevent click effect
Sound.prototype.setGain = function (note, gain, ramp) {
    if (!this.oscillators[note]) return;

    if (!ramp) {
        // set immediately
        for (let j = 0; j < this.instrument.oscillators.length; j++) {
            this.oscillators[note][j].gainNode.gain.value = gain * this.instrument.oscillators[j].gain;
        }
    } else {
        // grow gain to 'gain' value in RAMP_STOP_TIME milliseconds
        for (let j = 0; j < this.instrument.oscillators.length; j++) {
            let gainNode = this.oscillators[note][j].gainNode;
            gainNode.gain.linearRampToValueAtTime(gain * this.instrument.oscillators[j].gain,
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