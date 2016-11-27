// TODO: add listeners on 'playNote', 'stopNote' and 'stop'

import 'jquery';
import 'bootstrap/dist/js/bootstrap';
import {Socket}       from "./websocket.js";
import {Sound}        from "./sound/sound.js";
import {Ui}           from "./ui/ui.js";

// Babel6 workaround http://stackoverflow.com/questions/34736771/webpack-umd-library-return-object-default/34778391
var _main = new Main();
export default _main;
module.exports = _main;

var masterGainBeforeMute;


function Main() {

    var self = this;

    Object.defineProperties(this, {
        playing: {
            value: [],
            writable: true
        },
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
        instrument: {
            get: function () {
                return __config.instrument;
            },
            set: function (id) {
                if (__config.instrument != undefined && __config.instrument.id === id)
                    return;

                for (let index in __config.instruments) {
                    if (__config.instruments[index].id == id) {
                        var instrument = __config.instruments[index];
                        self.reload(function (instr) {
                            __config.instrument = instr;
                        }, instrument);
                        self.ui.updateInstrument(instrument);
                        console.log(`Instrument has been changed to ${instrument.name}`);
                        break;
                    }
                }
            }
        },
        oscilloscopeRenderType: {
            get: () => {
                return self.ui.oscilloscope.renderType;
            },
            set: (rt) => {
                self.ui.oscilloscope.renderType = rt;
                self.ui.updateOscilloscopeRenderType(rt);
                console.log(`Render type has been changed to ${rt}`);
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

    document.addEventListener("DOMContentLoaded", function () {
        self.init();
    });

}


Main.prototype.init = function () {

    this.ui = new Ui();

    this.instrument = 11;
    this.bpm = 60;

    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    window.audioContext = audioContext;
    this.sound = new Sound(audioContext, this.instrument);

    this.masterGain = __constants.MASTER_GAIN_MAX / 2;

    this.socket = new Socket(__constants.WEB_SOCKET_HOST);
    this.socket.onmessage = onSocketMessage;

};

/**
 * Call stop function and play notes again.
 */
Main.prototype.reload = function (callback, callbackArgs) {

    var pl = this.playing;
    this.stop({notify: false});

    callback(callbackArgs);

    // TODO remove this hack -_-
    if (typeof(this.sound) !== 'undefined') {
        this.sound.instrument = __config.instrument;
    }

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
    this.sound.playNote(note, duration);

    this.ui.oscilloscope.addNote(note);
    this.ui.keyboard.highlightOn(note);
    this.observeInNoteBox(note);

    if (notify == undefined) {
        notify = true;
    }
    if (notify) {
        this.socket.send({
            type: __constants.WEB_SOCKET_MESSAGE_TYPE.play_note,
            noteName: note.name,
            noteOctave: note.octave
        });
    }

    console.log(note.name + note.octave + ' is now playing');
};

Main.prototype.stopNote = function (parameters) {
    var note = parameters.note;
    var notify = parameters.notify;

    if (!this.playing[note])
        return;

    this.playing[note] = false;
    this.sound.stopNote(note);

    this.ui.oscilloscope.removeNote(note);
    this.ui.keyboard.highlightOff(note);
    this.observeInNoteBox(note);

    if (notify == undefined) {
        notify = true;
    }
    if (notify) {
        this.socket.send({
            type: __constants.WEB_SOCKET_MESSAGE_TYPE.stop_note,
            noteName: note.name,
            noteOctave: note.octave
        });
    }
    console.log(note.name + note.octave + ' has been stopped');
};

Main.prototype.stop = function (parameters) {
    var notify = parameters.notify;

    if (typeof(this.ui.oscilloscope) != 'undefined') this.ui.oscilloscope.stop();
    if (typeof(this.sound) != 'undefined') this.sound.stop();
    if (typeof(this.ui.keyboard) != 'undefined') this.ui.keyboard.highlightClear();

    this.playing = [];

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

Main.prototype.showNav = function (nav) {
    this.ui.showNav(nav);
};

Main.prototype.toggleMute = function () {
    if (this.ui.masterGainRange.value > 0) {
        masterGainBeforeMute = this.ui.masterGainRange.value;
        this.masterGain = 0;
    } else {
        this.masterGain = masterGainBeforeMute;
    }
};

Main.prototype.observeInNoteBox = function (note) {
    this.ui.noteBox.setObserve(note);
};

function onSocketMessage(data) {
    var type = data.type;

    switch (type) {
        case __constants.WEB_SOCKET_MESSAGE_TYPE.play_note:
            let name = data.noteName;
            let octave = data.noteOctave;
            let note = __note.getNote(name, octave);
            main.playNote({note: note, notify: false});
            break;
        case __constants.WEB_SOCKET_MESSAGE_TYPE.stop_note:
            name = data.noteName;
            octave = data.noteOctave;
            note = __note.getNote(name, octave);
            main.stopNote({note: note, notify: false});
            break;
        case __constants.WEB_SOCKET_MESSAGE_TYPE.stop:
            main.stop({notify: false});
            break;
        case __constants.WEB_SOCKET_MESSAGE_TYPE.change_instrument:
            main.instrument = data.instrumentName;
            break;
    }
}