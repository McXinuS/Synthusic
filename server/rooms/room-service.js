'use strict';

let rm = require('./room');

let RoomService = function () {
  const MAX_ROOMS = 10;

  let rooms = [];

  let lastRoomId = 0;

  function createRoom() {
    return new rm.Room(lastRoomId++);
  }

  function addUser(id) {

    let freeRoom;

    // Find a room from existing
    for (let room of rooms) {
      if (!room.isLocked && room.getUserCount() < room.maxUsers) {
        freeRoom = room;
        break;
      }
    }

    // Create a new room if no free room was found
    if (!freeRoom) {
      if (rooms.length >= MAX_ROOMS) {
        console.log('Unable to open a new room: too many rooms are opened.');
      } else {
        console.log('All room are full, creating a new room.');
        freeRoom = createRoom();
        rooms.push(freeRoom);
      }
    }

    if (freeRoom) {
      freeRoom.addUser(id);
      return freeRoom.id;
    } else {
      console.log(`Cannot assign user ${id}: all rooms are full.`);
    }

  }

  function updateUser(id) {
    let room = getRoomByUser(id);
    if (!room) return;
    room.updateUser(id);
  }

  function removeUser(id) {
    let room = getRoomByUser(id);
    if (!room) return;
    room.removeUser(id);
    //if (!room.hasUsers) {
    //  destroyRoom(room.id);
    //}
  }

  function getRoomByUser(userId) {
    for (let room of rooms) {
      if (room.hasUser(userId)) {
        return room;
      }
    }
    throw new Error('There is no room assigned with user id ' + userId);
  }

  function getRoomUsersByUser(userId) {
    return getRoomByUser(userId).getUsers();
  }

  function getRoomStateByUser(userId) {
    return getRoomByUser(userId).getState(userId);
  }

  function getRoomInfoByUser(userId) {
    return getRoomByUser(userId).getRoomInfo();
  }

  /* API */

  this.addUser = addUser;
  this.updateUser = updateUser;
  this.removeUser = removeUser;

  this.getRoomByUser = getRoomByUser;
  this.getRoomUsersByUser = getRoomUsersByUser;
  /**
   * Returns all room data.
   */
  this.getRoomStateByUser = getRoomStateByUser;
  /**
   * Returns room's name and users.
   */
  this.getRoomInfoByUser = getRoomInfoByUser;
};

module.exports.RoomService = RoomService;
