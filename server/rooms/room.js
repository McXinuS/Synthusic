'use strict';

let conf = require('./synth-config/config');

let Room = function () {
  this.progConfig = new conf.Config();
  this.users = [];
};

Room.prototype = {
  // TODO notify other users somehow
  addUser: function (user) {
    this.users.push(user);
  },
  removeUser: function() {

  },

  changeState: function() {
    this.broadcast(data, sender);
  },

  // send message to everyone in the room except sender
  broadcast: function (message, sender) {
    if (typeof(message) === 'object') message = JSON.stringify(message);
    wsClients.forEach(function (client) {
      if (client !== sender.ws) {
        client.send(message);
      }
    });
  },

  // send message to particular user
  send: function (message, reciever) {
    if (typeof(message) === 'object') message = JSON.stringify(message);
    reciever.ws.send(message);
  }
};

module.exports.Room = Room;
