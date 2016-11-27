export default Enveloper;

function Enveloper(audioCtx) {
    this.STATE_STARTED = 0;
    this.STATE_DECAYING = 1;
    this.STATE_SUSTAINED = 2;
    this.STATE_RELEASING = 3;
    this.STATE_FINISHED = 4;

    Object.defineProperties(this, {
        _attack: {
            get: () => {
                return __config.envelope.attack;
            }
        },
        _decay: {
            get: () => {
                return __config.envelope.decay;
            }
        },
        _sustain: {
            get: () => {
                // restrict sustain in [0;1] interval
                return Math.max(0, Math.min(__config.envelope.sustain, 1));
            }
        },
        _release: {
            get: () => {
                return __config.envelope.release;
            }
        },
    });

    this._state = this.STATE_FINISHED;
    this._funcTimeoutId = -1;

    this.audioCtx = audioCtx;
    this._gainNode = audioCtx.createGain();
    this._gainNode.gain.value = 0;

    this.onFinished = undefined;
}

Enveloper.prototype.updateState = function (type) {
    switch (type) {
        case this.STATE_STARTED:
            this._state = this.STATE_STARTED;
            this.cancelStateChange();
            this.changeStateAtTime(this.STATE_DECAYING, 1.0, this._attack);
            break;
        case this.STATE_DECAYING:
            this._state = this.STATE_DECAYING;
            this.changeStateAtTime(this.STATE_SUSTAINED, this._sustain, this._decay);
            break;
        case this.STATE_SUSTAINED:
            this._state = this.STATE_SUSTAINED;
            break;
        case this.STATE_RELEASING:
            this._state = this.STATE_RELEASING;
            this.cancelStateChange();
            this.changeStateAtTime(this.STATE_FINISHED, 0, this._release);
            break;
        case this.STATE_FINISHED:
            this._state = this.STATE_FINISHED;
            if (typeof(this.onFinished) == 'function') this.onFinished();
            break;
    }
};

Enveloper.prototype.changeStateAtTime = function (newState, newGain, time) {
    this._gainNode.gain.setValueAtTime(this._gainNode.gain.value, this.getRampTime(0));
    this._gainNode.gain.linearRampToValueAtTime(newGain, this.getRampTime(time));
    this._funcTimeoutId = setTimeout(this.updateState.bind(this, newState), time);
};

Enveloper.prototype.cancelStateChange = function () {
    this._gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
    clearTimeout(this._funcTimeoutId);
};

Enveloper.prototype.start = function () {
    this.updateState(this.STATE_STARTED);
};

Enveloper.prototype.release = function () {
    this.updateState(this.STATE_RELEASING);
};

Enveloper.prototype.getGainNode = function () {
    return this._gainNode;
};
Enveloper.prototype.getState = function () {
    return this._state;
};
Enveloper.prototype.getGain = function () {
    return this._gainNode.gain.value;
};
Enveloper.prototype.getGain = function () {
	return this._gainNode.gain.value;
};

// converts time from millis to seconds and adds it to the current time
Enveloper.prototype.getRampTime = function (time) {
    return this.audioCtx.currentTime + time / 1000.0;
};