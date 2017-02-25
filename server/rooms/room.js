'use strict';

let conf = require('./config');

let Room = function (id) {
  this.id = id;
  this.config = new conf.Config();
  this.users = [];

  let self = this;

  Object.defineProperties(this, {
    hasUser: {
      get: function(id) {
        return self.users.findIndex(user => user === id) != -1;
      }
    },
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
    return this.config.getState();
  },

  addUser: function (id) {
    this.users.push(id);
  },
  removeUser: function(id) {
    let i = this.users.findIndex(user => user === id);
    if (i != -1) {
      this.users.splice(i, 1);
    }
  },

  addNote: function (note) {
    this.config.addNote(note);
  },
  removeNote: function (note) {
    this.config.removeNote(note);
  },

  addInstrument: function (instrument) {
    this.config.addInstrument(instrument);
  },
  updateInstrument: function (instrument) {
    this.config.updateInstrument(instrument);
  },
  deleteInstrument: function (id) {
    this.config.deleteInstrument(id);
  }
};

module.exports.Room = Room;
