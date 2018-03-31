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

  function getRooms() {
    return rooms.map(room => {
      return {
        id: room.id,
        name: room.name
      }
    });
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

  this.getRooms = getRooms;
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
