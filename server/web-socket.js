'use strict';

exports.Server = Server;

let rs = require('./rooms/room-service').RoomService,
  ws = require('ws');

const WebSocketMessageType = require('./../shared/web-socket-message-types').WebSocketMessageType;
const CHAT_MESSAGE_LENGTH_MAX = 340;
const CHAT_USER_NAME_LENGTH_MAX = 20;

function Server(server) {

  let webSocketServer = new ws.Server({
    server: server
  });

  // List of all connected users
  const wsClients = new Map();
  let wsLastId = 0;

  const roomService = new rs();

  function onConnection(ws) {
    let id = wsLastId++;
    wsClients.set(id, ws);
    roomService.addUser(id);
    notifyRoomUpdate(id);

    console.log("New connection : id " + id);

    ws.on('message', function (message) {
      processWebSocketMessage(message, id);
    });

    ws.on('close', function () {
      let room = roomService.getRoomInfoByUser(id);
      room.users = room.users.filter(user => user.id !== id);

      broadcastToUserRoom({
        type: WebSocketMessageType.room_updated,
        data: room
      }, id);

      roomService.removeUser(id);
      wsClients.delete(id);

      console.log('Connection closed : id ' + id);
    });

    ws.on('error', error => console.log(error));
  }


  /**
   * Get web socket (or array of web sockets), assigned to user id.
   */
  function getWebSockets(id) {

    // single id
    if (!(id instanceof Array)) {
      return wsClients.get(id);
    }

    // multiple ids
    let sockets = [];
    for (let i of id) {
      sockets.push(wsClients.get(i));
    }
    return sockets;
  }

  /**
   * Broadcast message to the particular users.
   * @param message String or an object, containing message type.
   * @param receivers Array of user ids or websockets.
   */
  function broadcast(message, receivers) {
    if (typeof receivers === 'undefined') return;
    if (typeof(message) === 'object') {
      message = JSON.stringify(message);
    }
    if (receivers[0] && !(receivers[0] instanceof ws)) {
      receivers = getWebSockets(receivers);
    }
    for (let receiver of receivers) {
      send(message, receiver);
    }
  }

  /**
   * Broadcast message to the particular users.
   * @param message String or an object, containing message type.
   * @param userId ID or websocket of user, whose room's users will be broadcasted with message.
   * @param includeSender Indicates whether or not the message will be sent to user (userId).
   */
  function broadcastToUserRoom(message, userId, includeSender = false) {
    let rec = roomService.getRoomUsersByUser(userId);
    if (!rec) return;
    rec = rec.map(user => user.id); // get only ids
    if (!includeSender) {
      rec.splice(rec.indexOf(userId), 1);
    }
    broadcast(message, rec);
  }

  /**
   * Send message to the particular user.
   * @param message String or an object, containing message type.
   * @param receiver Array of user ids or websockets.
   */
  function send(message, receiver) {

    // Convert message to string if it is an object
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }

    if (!message) {
      throw new Error('Message is empty.');
    }

    // Throw error if no type is specified
    if (!message.includes('type')) {
      throw new Error('Message must have a type.');
    }

    // Convert receiver ID(s) to web socket clients
    if (!(receiver instanceof ws)) {
      receiver = getWebSockets(receiver);
    }

    receiver.send(message);
  }

  /**
   * Broadcast whole user room to its users.
   * @param userId User whose room need to beb changed.
   */
  function notifyRoomUpdate(userId) {
    broadcastToUserRoom({
      type: WebSocketMessageType.room_updated,
      data: roomService.getRoomInfoByUser(userId)
    }, userId, true);
  }

  function processStateMessage(message, sender) {

    let room = roomService.getRoomByUser(sender);

    switch (message.type) {

      case WebSocketMessageType.get_state:
        send({
          type: WebSocketMessageType.get_state,
          data: roomService.getRoomStateByUser(sender)
        }, sender);
        return true;

      // Note

      case WebSocketMessageType.note_add:
        room.addNote(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.note_delete:
        room.removeNote(message.data);
        broadcastToUserRoom(message, sender);
        return true;

      // Instrument

      case WebSocketMessageType.instrument_add:
        message.data = room.createInstrument();
        broadcastToUserRoom(message, sender, true);
        return true;
      case WebSocketMessageType.instrument_update:
        room.updateInstrument(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.instrument_delete:
        room.deleteInstrument(message.data);
        broadcastToUserRoom(message, sender);
        return true;

      // Room

      case WebSocketMessageType.room_name_update:
        room.setRoomName(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.bpm_changed:
        room.setBpm(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.room_set_max_users:
        room.setMaxUsers(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.room_lock:
        room.setRoomLock(true);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.room_unlock:
        room.setRoomLock(false);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.user_update:
        message.data.name = message.data.name.substring(0, CHAT_USER_NAME_LENGTH_MAX);
        room.updateUser(message.data);
        notifyRoomUpdate(sender);
        return true;
      case WebSocketMessageType.chat_new_message:
        let userMessage = message.data || '';
        userMessage = userMessage.substring(0, CHAT_MESSAGE_LENGTH_MAX);
        message.data = {
          message: userMessage,
          sender: sender
        };
        broadcastToUserRoom(message, sender, true);
        return true;
    }

    return false;
  }

  function processServiceMessage(message, sender) {
    switch (message.type) {
      case WebSocketMessageType.ping:
        send({type: WebSocketMessageType.pong}, sender);
        return true;
    }
    return false;
  }

  let messageHandlers = [processStateMessage, processServiceMessage];

  function processWebSocketMessage(messageStr, sender) {
    new Promise(function (resolve, reject) {

      let message = JSON.parse(messageStr);
      // replace type with its description
      let describedMsg = Object.assign({}, message, {type: WebSocketMessageType[message.type]});
      let logMsg = `New message from id ${sender}: ${JSON.stringify(describedMsg)}`;

      for (let handler of messageHandlers) {
        let handled = handler(message, sender);
        if (handled) {
          resolve(logMsg);
          return;
        }
      }
      reject(logMsg);
    }).then(
      console.log,
      console.log
    );
  }

  webSocketServer.on('connection', onConnection);

  return webSocketServer;
}
