export default Enveloper;

/**
 * ADSR envelope
 * @param adsr
 * @param audioCtx
 * @constructor
 */
function Enveloper(adsr, audioCtx) {
	this._attack = adsr.attack;
	this._decay = adsr.decay;
	// s>1 => s=1; s<0 => s=0; s=s otherwise
	this._sustain = (adsr.sustain > 1) ? 1 : (adsr.sustain < 0) ? 0 : adsr.sustain;
	this._release = adsr.release;

	this._released = false;
	this._timestamp = Date.now(); // in millis
	this._playing = false;
	this._gainNode = audioCtx.createGain();
	this._gainNode.gain.value = 0;

	this.onStart = undefined;
	this.onRelease = undefined;
	this.onFinish = undefined;
}

Enveloper.prototype.getAmp = function () {
	let timePassed = Date.now() - this._timestamp;
	if (!this._released) {
		// attack
		if (timePassed < this._attack)
			return timePassed / this._attack;
		// decay
		else if (timePassed - this._attack < this._decay)
			return 1 - (1 - this._sustain) * (timePassed - this._attack) / this._decay;
		// sustain
		else
			return this._sustain;
	} else {
		// release
		if (timePassed < this._release)
			return this._sustain - this._sustain * (timePassed) / this._release;
		else
			return 0;
	}
};

Enveloper.prototype.updateGainNode = function () {
	this._gainNode.gain.value = this.getAmp();

	if (this._gainNode.gain.value == 0 && this._released) {
		this._playing = false;
		if (typeof(this.onFinish) == 'function') {
			this.onFinish();
		}
	} else {
		setTimeout(Enveloper.prototype.updateGainNode.bind(this), 10);
	}
};

Enveloper.prototype.start = function () {
	this._timestamp = Date.now();
	this._released = false;
	if (!this._playing) {
		this.updateGainNode();
		this._playing = true;
	}
	if (typeof(this.onStart) == 'function') {
		this.onStart();
	}
};

Enveloper.prototype.release = function () {
	this._timestamp = Date.now();
	this._released = true;
	if (typeof(this.onRelease) == 'function') {
		this.onRelease();
	}
};

Enveloper.prototype.getGainNode = function () {
	return this._gainNode;
};