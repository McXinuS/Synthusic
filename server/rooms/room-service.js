'use strict';

let rm = require('./room');

let RoomService = function () {
  const MAX_ROOMS = 10;
  const MAX_USERS_IN_ROOM = 2;

  let rooms = [];

  let lastRoomId = 0;
  let createRoom = function () {
    return new rm(lastRoomId++);
  };

  let destroyRoom = function (id) {
    delete rooms.find(room => room.id === id);
  };

  let addUser = function (id) {
    let freeRoom;
    for (let room in rooms) {
      if (room.usersNumber < MAX_USERS_IN_ROOM) {
        freeRoom = room;
        break;
      }
    }
    if (!freeRoom) {
      if (rooms.length >= MAX_ROOMS) {
        console.log('Unable to open a new room: too many rooms are opened.');
        console.log(`Cannot assign user ${id}: all rooms are full.`);
        return;
      } else {
        freeRoom = createRoom();
        rooms.push(freeRoom);
      }
    }
    freeRoom.addUser(id);
  };

  let deleteUser = function (id) {
    let room = getUserRoom(id);
    if (!room) return;

    room.deleteUser(id);
    if (!room.hasUsers) {
      destroyRoom(room.id);
    }
  };

  let getSameRoomUsers = function (userId) {
    for (let room of rooms) {
      if (room.hasUser(userId)) {
        return room;
      }
    }
    return null;
  };

  this.addUser = addUser;
  this.deleteUser = deleteUser;
  this.getSameRoomUsers = getSameRoomUsers;
};

module.exports.RoomService = RoomService;
