'use strict';

let rm = require('./room');

let RoomService = function () {
  const MAX_ROOMS = 10;

  let rooms = [];

  let lastRoomId = 0;


  /**
   * [internal] Add user to the room.
   */
  function addUserToRoom(userId, room) {
    if (!room || room.isLocked || (room.getUserCount() >= room.maxUsers)) {
      return false;
    }

    room.addUser(userId);
    return true;
  }

  /**
   * Add user to room by their IDs.
   */
  function addUser(userId, roomId) {
    let room = rooms.find(room => room.id === roomId);
    return addUserToRoom(userId, room);
  }

  function createRoom() {
    return new rm.Room(lastRoomId++);
  }

  function addUserToNewRoom(userId) {
    if (rooms.length >= MAX_ROOMS) {
      console.log('Unable to open a new room: too many rooms are opened.');
      return false;
    }

    let room = createRoom();
    rooms.push(room);

    let addRes = addUserToRoom(userId, room);
    if (!addRes) {
      console.log('Cannot assign user ' + userId);
    }
    return addRes;
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
    return rooms.map(room => room.getRoomInfo());
  }

  function getRoomByUser(userId) {
    for (let room of rooms) {
      if (room.hasUser(userId)) {
        return room;
      }
    }
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
  this.addUserToNewRoom = addUserToNewRoom;
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
