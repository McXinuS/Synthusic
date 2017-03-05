'use strict';

let Room = function (id) {
  this.id = id;

  let defaults = require('./../../shared/defaults');
  this.bpm = defaults.bpm;
  this.lastInstrumentId = defaults.instruments.reduce((maxId, ins) => ins.id > maxId ? ins.id : maxId);
  this.instruments = defaults.instruments;
  this.notes = [];
  this.users = [];

  let self = this;

  Object.defineProperties(this, {
    hasUsers: {
      get: function() {
        return self.users.length !== 0;
      }
    },
    usersNumber: {
      get: function() {
        return self.users.length;
      }
    }
  })
};

Room.prototype = {
  getState: function() {
    return {
      bpm: this.bpm,
      instruments: this.instruments,
      notes: this.notes,
      users: this.users
    }
  },

  addUser: function (id) {
    this.users.push(id);
  },
  hasUser: function(id) {
    return this.users.findIndex(user => user === id) != -1;
  },
  removeUser: function(id) {
    let i = this.users.findIndex(user => user === id);
    if (i != -1) {
      this.users.splice(i, 1);
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

module.exports.Room = Room;
