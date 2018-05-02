'use strict';

let usr = require('./../models/user.js');
let names = [
  'Bolitest', 'Brilliant', 'BWithWonder', 'Cationol', 'Cutieremi', 'Discuua', 'Dressylved', 'Dryadur', 'Encover', 'Flipjava', 'Gigausaler', 'Grindie', 'Haneffe', 'Helsonix', 'Hickyawmet', 'HipurAdvice', 'Horrayerth', 'Imervita', 'LastingMercy', 'Littler', 'Magfull', 'Meresspo', 'Missonolve', 'Mithister', 'Netbanc', 'Omflower', 'Paneryat', 'PassionIcyCooky', 'PrestigeLeventis'
];
function getRandomName() {
  return names[Math.floor(Math.random() * names.length)];
}

let Room = function (id) {

  let defaults = require('./../../shared/defaults');
  // Deep clone default settings object to prevent changes sharing between rooms.
  // Method is expensive but called not too often.
  defaults = JSON.parse(JSON.stringify(defaults));

  this.id = id;
  this.name = 'Room #' + (id + 1);
  this.users = [];

  this.isLocked = defaults.isLocked;
  this.bpm = defaults.bpm;
  this.instruments = defaults.instruments;
  this.maxUsers = defaults.maxUsers;
  this.notes = defaults.notes;

  this.lastNoteId = this.notes.reduce((maxId, note) => (note.id > maxId) ? note.id : maxId, 0);
  this.lastInstrumentId = this.instruments.reduce((maxId, ins) => (ins.id > maxId) ? ins.id : maxId, 0);

  };

Room.prototype = {
  getState: function (id) {
    return {
      room: this.getRoomInfo(),
      currentUser: this.getUser(id)
    }
  },

  /**
   * Returns room's name and users
   */
  getRoomInfo: function () {
    return {
      id: this.id,
      name: this.name,
      users: this.users.slice(),
      maxUsers: this.maxUsers,
      isLocked: this.isLocked,

      bpm: this.bpm,
      instruments: this.instruments,
      notes: this.notes
    }
  },

  setRoomName: function (name) {
    this.name = name;
  },

  setBpm: function (bpm) {
    this.bpm = bpm;
  },

  setRoomLock: function (lock) {
    if (typeof lock !== 'boolean') {
      this.log('Room locking error: wrong type ' + typeof lock);
    }
    this.isLocked = lock;
  },

  /* Users */

  setMaxUsers: function (userCount) {
    if (userCount < 1) {
      return;
    }
    this.maxUsers = userCount;
  },

  addUser: function (id) {
    let user = new usr(
      id,
      getRandomName()
    );
    this.users.push(user);
    return user;
  },

  getUser: function (id) {
    return this.users.find(user => user.id === id);
  },

  getUserCount: function () {
    return this.users.length;
  },

  getUsers: function () {
    return this.users.slice();
  },

  updateUser: function (user) {
    let index = this.users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      let u = this.users[index];
      u.name = user.name;
    }
  },

  removeUser: function (id) {
    let index = this.users.findIndex(user => user.id === id);
    if (index >= 0) this.users.splice(index, 1);
  },

  hasUser: function (id) {
    return this.users.findIndex(user => user.id === id) >= 0;
  },

  /* Note */

  addNote: function (note, id) {
    if (typeof id !== 'number') {
      note.id = ++this.lastNoteId;
    }
    this.notes.push(note);
    return note.id;
  },
  updateNote: function (note) {
    this.removeNote(note.id);
    this.addNote(note, note.id);
  },
  removeNote: function (id) {
    let index = this.notes.findIndex(n => n.id === id);
    if (index >= 0) {
      this.notes.splice(index, 1);
    } else {
      this.log(`Unable to remove note: No such note with id ${id} is found.`);
    }
  },

  /* Instrument */

  createInstrument: function () {
    let instrument = Object.assign({}, require('./../defaults/defaults').instrument);
    instrument.id = ++this.lastInstrumentId;
    this.instruments.push(instrument);
    return instrument;
  },
  updateInstrument: function (instrument) {
    let index = this.instruments.findIndex(ins => ins.id === instrument.id);
    if (index >= 0) this.instruments[index] = instrument;
  },
  deleteInstrument: function (id) {
    let index = this.instruments.findIndex(ins => ins.id === id);
    if (index >= 0) this.instruments.splice(index, 1);
  },



  log: function(msg) {
    console.log(`Room '${this.name}' (id${this.id}): ${msg}`);
  }
};


module.exports.Room = Room;
