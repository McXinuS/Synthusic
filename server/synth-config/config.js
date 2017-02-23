'use strict';

exports.Config = Config;

function Config() {
  let defaults = require('./defaults');

  Object.defineProperties(this, {
    notes: {
      value: {},
      writable: false
    },
    instruments: {
      value: defaults.instruments,
      writable: false
    }
  });
}

Config.prototype = {
  getStateObject: function () {
    return {
      notes: this.notes,
      instruments: this.instruments
    }
  },

  addNote: function (note) {
    this.notes[note] = true;
  },
  removeNote: function (note) {
    this.notes[note] = false;
  },

  addInstrument: function (instrument) {
    this.instruments.push(instrument); // TODO assign ID to the instrument
  },
  updateInstrument: function () {

  },
  deleteInstrument: function (id) {
    delete this.instruments.find(ins => ins.id == id);
  }
};
