'use strict';

let usr = require('./user.model');

let Room = function (id) {
  this.id = id;
  this.name = 'Room #'+(id+1);
  this.users = [];

  let defaults = require('./../../shared/defaults');
  this.bpm = defaults.bpm;
  this.lastInstrumentId = defaults.instruments.reduce((maxId, ins) => ins.id > maxId ? ins.id : maxId);
  this.instruments = defaults.instruments;
  this.notes = [];

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
      room: this.getInfo()
    }
  },

  /**
   * Returns room's name and users
   */
  getInfo: function () {
    return {
      name: this.name,
      users: this.users
    }
  },

  changeRoomName: function (name) {
    this.name = name;
  },

  addUser: function (id) {
    this.users.push(new usr(id));
  },
  removeUser: function(id) {
    let i = this.users.findIndex(user => user.id === id);
    if (i != -1) {
      this.users.splice(i, 1);
    }
  },
  hasUser: function(id) {
    return this.users.findIndex(user => user.id === id) != -1;
  },

  addNote: function (note) {
    this.notes.push(note);
  },
  removeNote: function (note) {
    let index = this.notes.indexOf(note);
    if (index >= 0) this.notes.splice(index);
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
