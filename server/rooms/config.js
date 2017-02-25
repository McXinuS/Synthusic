'use strict';

exports.Config = Config;

function Config() {
  let defaults = require('./../../shared/defaults');

  this.lastInstrumentId = defaults.instruments.reduce((maxId, ins) => ins.id > maxId ? ins.id : maxId);
  this.notes = [];
  this.instruments = defaults.instruments;
  this.bpm = defaults.bpm;
}

Config.prototype = {
  getState: function () {
    return {
      notes: this.notes,
      instruments: this.instruments,
      bpm: this.bpm
    }
  },

  addNote: function (note) {
    this.notes[note] = true;
  },
  removeNote: function (note) {
    this.notes[note] = false;
  },

  addInstrument: function (instrument) {
    instrument.id = this.lastInstrumentId++;
    this.instruments.push(instrument);
  },
  updateInstrument: function (instrument) {
    let i = this.instruments.findIndex(ins => ins.id == instrument.id);
    if (i != -1) this.instruments[i] = instrument;
  },
  deleteInstrument: function (id) {
    delete this.instruments.find(ins => ins.id == id);
  }
};
