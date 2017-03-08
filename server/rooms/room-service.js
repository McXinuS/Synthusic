'use strict';

let rm = require('./room');

let RoomService = function () {
  const MAX_ROOMS = 10;
  const MAX_USERS_IN_ROOM = 2;

  let rooms = [];

  let lastRoomId = 0;

  function createRoom() {
    return new rm.Room(lastRoomId++);
  }

  function addUser(id) {
    let freeRoom;
    for (let room of rooms) {
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
    return freeRoom.id;
  }

  function removeUser(id) {
    let room = getRoomByUser(id);
    if (!room) return;

    room.removeUser(id);
    if (!room.hasUsers) {
      //destroyRoom(room.id);
    }
  }

  function getRoomByUser(userId) {
    for (let room of rooms) {
      if (room.hasUser(userId)) {
        return room;
      }
    }
    throw new Error('There is no room assigned with user id ' + userId);
  }

  function getRoomStateByUser(userId) {
    return getRoomByUser(userId).getState();
  }

  function getRoomUsersByUser(userId) {
    return getRoomByUser(userId).users.slice();
  }

  function getRoomInfoByUser(userId) {
    let room = getRoomByUser(userId);
    return {
      name: room.name,
      users: room.users.slice()
    };
  }

  /* API */

  this.addUser = addUser;
  this.removeUser = removeUser;

  this.getRoomByUser = getRoomByUser;
  this.getRoomStateByUser = getRoomStateByUser;
  this.getRoomUsersByUser = getRoomUsersByUser;
  /**
   * Returns name and users of te room.
   */
  this.getRoomInfoByUser = getRoomInfoByUser;
};

module.exports.RoomService = RoomService;
