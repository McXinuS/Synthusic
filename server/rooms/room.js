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

  this.id = id;
  this.name = 'Room #' + (id + 1);
  this.users = [];

  this.isLocked = defaults.isLocked;
  this.bpm = defaults.bpm;
  this.instruments = defaults.instruments;
  this.maxUsers = defaults.maxUsers;
  this.notes = defaults.notes;

  this.lastInstrumentId = this.instruments.reduce((maxId, ins) => ins.id > maxId ? ins.id : maxId, 0);

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

  setRoomLock: function (lock) {
    if (typeof lock !== 'boolean') {
      console.log('Room locking error: wrong type ' + typeof lock);
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

  addNote: function (note) {
    let index = this.instruments.findIndex(n => n.id === note.id);
    if (index >= 0) this.notes.push(note);
  },
  removeNote: function (note) {
    let index = this.notes.indexOf(note);
    if (index >= 0) this.notes.splice(index, 1);
  },

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
  }
};


module.exports.Room = Room;
