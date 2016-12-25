import 'jquery';
import 'bootstrap/dist/js/bootstrap';
import {Socket}       from "./websocket.js";
import {Sound}        from "./sound/sound.js";
import {Ui}           from "./ui/ui.js";

// Babel6 workaround http://stackoverflow.com/questions/34736771/webpack-umd-library-return-object-default/34778391
var _main = new Main();
export default _main;
module.exports = _main;


function Main() {

    var self = this;

    Object.defineProperties(this, {
        bpm: {
            get: function () {
                return __config.bpm;
            },
            set: function (bpm) {
                __config.bpm = bpm;
                self.ui.updateBpm(bpm)
            }
        },
        masterGain: {
            get: function () {
                return self.sound.getMasterGain();
            },
            set: function (gain) {
                if (self.masterGain == gain)
                    return;

                self.sound.setMasterGain(gain);
                self.ui.updateMasterGain(gain);
            }
        },
        scale: {
            get: function () {
                return __config.scale;
            },
            set: function (sc) {
                if (__config.scale == sc)
                    return;

                __config.scale = sc;
            }
        },
        mode: {
            get: function () {
                return __config.mode;
            },
            set: function (mode) {
                if (__config.mode == mode)
                    return;

                __config.mode = mode;
            }
        },
        instruments: {
            get: function () {
                return __config.instruments;
            }
        },
        instrument: {
            get: function () {
                return self.instruments.find((i) => {
                    return i.id == __config.instrumentId;
                });
            },
            set: function (id) {
                if (__config.instrumentId === id)
                    return;

                let instrument = self.instruments.find((i) => {
                    return i.id == id;
                });
                if (typeof instrument == 'undefined') return;

                self.reload(function () {
                    __config.instrumentId = id;
                });
                self.ui.updateInstrument(instrument);
                console.log(`Instrument has been changed to ${instrument.name}`);
            }
        },
        envelope: {
            get: () => {
                return self.instrument.envelope;
            }
        },
        oscilloscopeRenderType: {
            get: () => {
                return self.ui.oscilloscope.renderType;
            },
            set: (rt) => {
                self.ui.updateOscilloscopeRenderType(rt);
            }
        },
        playing: {
            get: () => {
                return __config.playing;
            },
            set: (value) => {
                __config.playing = value;
            }
        }
    });

    this.gain = new Proxy({}, {
        get: function (target, note) {
            return self.sound.getGain(note);
        },
        set: function (target, note, gain) {
            self.sound.setGain(note, gain);
            self.ui.noteInfoGainLabel.text(gain);
            self.ui.noteInfoGainRange.value = gain;
            return true;
        }
    });

    this.init = function () {

        this.ui = new Ui();

        this.instrument = 11;
        this.bpm = 60;
        this.masterGainBeforeMute = 0;

        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        window.audioContext = audioContext;
        this.sound = new Sound(audioContext, this.instrument);
        this.masterGain = __constants.MASTER_GAIN_MAX / 2;

        this.socket = new Socket(__constants.WEB_SOCKET_HOST);
        this.socket.onmessage = onSocketMessage.bind(this);
        this.socket.onopen = onSocketOpen.bind(this);
        this.socket.connect();

    };

    document.addEventListener("DOMContentLoaded", function () {
        self.init();
    });

}

/**
 * Call stop function and play notes again.
 */
Main.prototype.reload = function (callback) {

    var pl = this.playing;
    this.stop({notify: false});

    callback();

    let event = new CustomEvent('reload', {
        detail: this.instrument,
        bubbles: false,
        cancelable: false
    });
    document.body.dispatchEvent(event);

    for (var index in pl) {
        if (pl[index]) {
            console.log(index);
            var note = __note.getNote(index);
            this.playNote({note: note});
        }
    }

};

Main.prototype.playNote = function (parameters) {
    var note = parameters.note;
    var duration = parameters.duration;
    var notify = parameters.notify;

    if (this.playing[note])
        return;

    this.playing[note] = true;

    let event = new CustomEvent('playnote', {
        detail: note,
        bubbles: false,
        cancelable: false
    });
    document.body.dispatchEvent(event);

    this.observeInNoteBox(note);

    console.log(note.fullname + ' is now playing');

    if (notify == undefined) notify = true;
    if (notify) {
        this.socket.send({
            type: __constants.WEB_SOCKET_MESSAGE_TYPE.play_note,
            note: note.fullname
        });
    }

    if (duration) {
        setTimeout(() => {
            this.stopNote({note: note});
        }, duration);
    }
};

Main.prototype.stopNote = function (parameters) {
    var note = parameters.note;
    var notify = parameters.notify;

    if (!this.playing[note])
        return;

    delete this.playing[note];

    let event = new CustomEvent('stopnote', {
        detail: note,
        bubbles: false,
        cancelable: false
    });
    document.body.dispatchEvent(event);

    this.observeInNoteBox(note);

    console.log(note.fullname + ' has been stopped');

    if (notify == undefined) notify = true;
    if (notify) {
        this.socket.send({
            type: __constants.WEB_SOCKET_MESSAGE_TYPE.stop_note,
            note: note.fullname
        });
    }
};

Main.prototype.stop = function (parameters) {
    var notify = parameters.notify;

    let event = new CustomEvent('stop', {
        bubbles: false,
        cancelable: false
    });
    document.body.dispatchEvent(event);

    this.playing = {};

    if (notify == undefined) notify = true;
    if (notify) {
        this.socket.send({
            type: __constants.WEB_SOCKET_MESSAGE_TYPE.stop
        });
    }
    console.log('Stop');
};

// play a random note from a scale
// Warning! This function is full of dirty hacks =/
Main.prototype.playRandomNote = function () {
    var note;

    // try to get a note within a range of currently playable notes
    // made it using iterations because of laziness
    var iter = 0;
    var iter_max = 20;
    var ok = false;
    while (iter < iter_max) {
        var interval = 0;
        var step = Math.round(Math.random() * this.mode.intervals.length);
        for (var i = 0; i < step; i++)
            interval += this.mode.intervals[i];

        var oct_max = __constants.NOTES_COUNT / 12;
        var octave = Math.round(Math.random() * oct_max) - 1;

        var index = this.scale.indexOf('C') + interval + octave * 12;
        if (index < __constants.NOTES_COUNT && index >= 0) {
            ok = true;
            note = __note.getNote(index);
            break;
        }
        iter++;
    }
    if (ok) {
        var duration = 60 * 1000 / this.bpm;
        this.playNote({note: note, duration: duration});
    }
};

Main.prototype.toggleMute = function () {
    if (this.ui.masterGainRange.value > 0) {
        this.masterGainBeforeMute = this.ui.masterGainRange.value;
        this.masterGain = 0;
    } else {
        this.masterGain = this.masterGainBeforeMute;
    }
};

function onSocketMessage(data) {
    var type = data.type;

    switch (type) {
        case __constants.WEB_SOCKET_MESSAGE_TYPE.play_note:
            let name = data.note;
            let note = __note.getNote(name);
            this.playNote({note: note, notify: false});
            break;
        case __constants.WEB_SOCKET_MESSAGE_TYPE.stop_note:
            name = data.note;
            note = __note.getNote(name);
            this.stopNote({note: note, notify: false});
            break;
        case __constants.WEB_SOCKET_MESSAGE_TYPE.stop:
            this.stop({notify: false});
            break;
        case __constants.WEB_SOCKET_MESSAGE_TYPE.change_instrument:
            this.instrument = data.instrumentId;
            break;
    }
}

function onSocketOpen() {
    // get initial data
    this.socket.send({type: __constants.WEB_SOCKET_MESSAGE_TYPE.get_state});
}


/* UI events */

Main.prototype.observeInNoteBox = function (note) {
    this.ui.noteBox.setObserve(note);
};

Main.prototype.showNav = function (nav) {
    this.ui.showNav(nav);
};

Main.prototype.updateEnvelopeConfig = function (value, type) {
    value = parseFloat(value);
    this.ui.updateEnvelopeConfig(value, type);
    switch (type) {
        case 'attack':
            main.envelope.attack = value;
            break;
        case 'decay':
            main.envelope.decay = value;
            break;
        case 'sustain':
            main.envelope.sustain = value;
            break;
        case 'release':
            main.envelope.release = value;
            break;
    }
};