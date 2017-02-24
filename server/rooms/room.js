'use strict';

let conf = require('../synth-config/config');

let Room = function (id) {
  this.id = id;
  this.progConfig = new conf.Config();
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
  addUser: function (id) {
    this.users.push(id);
  },
  removeUser: function(id) {
    let i = this.users.findIndex(user => user === id);
    this.users.splice()
  },

  getState: function() {

  },

  changeState: function() {


  },
};

module.exports.Room = Room;
