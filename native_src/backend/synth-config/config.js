'use strict';

exports.Config = Config;

function Config() {
    let defaults = require('./defaults');
    let _instrument = defaults.instrumentId;

    Object.defineProperties(this, {
        playing: {
            value: {},
            writable: true
        },
        instruments: {
            value: defaults.instruments,
            writable: false
        },
        instrumentId: {
            get: () => {
                return _instrument;
            },
            set: (id) => {
                if (this.instruments.findIndex((ins) => {
                        return ins.id == id;
                    }) != -1) {
                    _instrument = id;
                }
            }
        }
    });
}

Config.prototype = {
    getStateObject: function() {
        return {
            playing: this.playing,
            instruments: this.instruments,
            instrumentId: this.instrumentId
        }
    },

    addNote: function(note) {
        this.playing[note] = true;
    },
    removeNote: function(note) {
        this.playing[note] = false;
    },
    removeAllNotes: function() {
        this.playing = [];
    },

    addInstrument: function(ins) {
    },
    changeInstrument: function(id) {
        this.instrumentId = id;
    },
    changeInstrumentProperty: function(name, subname, value) {
        if (typeof value == 'undefined') value = subname;
    },
    removeInstrument: function(id) {
        let ind = this.instruments.findIndex((ins) => {
            return ins.id == id;
        });
        if (ind != -1) delete this.instruments[ind];
    }
};