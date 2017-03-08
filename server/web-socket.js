'use strict';

exports.Server = Server;

let rs = require('./rooms/room-service').RoomService,
  ws = require('ws');
const WebSocketMessageType = require('./../shared/web-socket-message-types').WebSocketMessageType;

function Server(server) {
  let webSocketServer = ws.Server({
    server: server
  });

  let wsClients = new Map(),
    wsLastId = 0,
    roomService = new rs();

  function onConnection(ws) {
    let id = wsLastId++;
    wsClients.set(id, ws);
    roomService.addUser(id);
    notifyRoomUsersUpdate(id);

    console.log("New connection : id " + id);

    ws.on('message', function (message) {
      processWebSocketMessage(message, id);
    });

    ws.on('close', function () {
      notifyRoomUsersUpdate(id);
      roomService.removeUser(id);
      wsClients.delete(id);
      console.log('Connection closed : id ' + id);
    });
  }


  /**
   * Get web socket (or array of web sockets), assigned to user id.
   */
  function getWebSockets(id) {
    if (!(id instanceof Array)) {
      // single id
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
    if (typeof receivers == 'undefined') return;
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
   * @param userId Array of user ids or websockets.
   */
  function broadcastToUserRoom(message, userId) {
    let rec = roomService.getRoomUsersByUser(userId);
    if (!rec) return;
    rec.splice(rec.indexOf(userId), 1);
    broadcast(message, rec);
  }

  /**
   * Send message to the particular user.
   * @param message String or an object, containing message type.
   * @param receiver Array of user ids or websockets.
   */
  function send(message, receiver) {
    if (typeof(message) === 'object') {
      message = JSON.stringify(message);
    }
    if (!message.includes('type')) {
      throw new Error('Message must have a type');
    }
    if (!(receiver instanceof ws)) {
      receiver = getWebSockets(receiver);
    }
    receiver.send(message);
  }

  function notifyRoomUsersUpdate(userId) {
    broadcastToUserRoom({
      type: WebSocketMessageType.room_users_update,
      data: roomService.getRoomUsersByUser(userId)
    }, userId);
  }

  function processStateMessage(message, sender) {
    switch (message.type) {

      case WebSocketMessageType.get_state:
        send({
          type: WebSocketMessageType.get_state,
          data: roomService.getRoomStateByUser(sender)
        }, sender);
        return true;

      // Note

      case WebSocketMessageType.note_add:
        roomService.getRoomByUser(sender).addNote(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.note_remove:
        roomService.getRoomByUser(sender).removeNote(message.data);
        broadcastToUserRoom(message, sender);
        return true;

      // Instrument

      case WebSocketMessageType.instrument_add:
        roomService.getRoomByUser(sender).addInstrument(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.instrument_update:
        roomService.getRoomByUser(sender).updateInstrument(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.instrument_delete:
        roomService.getRoomByUser(sender).deleteInstrument(message.data);
        broadcastToUserRoom(message, sender);
        return true;

    }
    return false;
  }

  function processServiceMessage(message, sender) {
    switch (message.type) {
      case WebSocketMessageType.room_update:
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.ping:
        send({type: WebSocketMessageType.pong}, sender);
        return true;
    }
    return false;
  }

  function processChatMessage(message, sender) {
    if (message.type == WebSocketMessageType.chat_new_message) {
      message.data = {
        message: message.data,
        sender: sender
      };
      broadcastToUserRoom(message, sender);
      return true;
    }
    return false;
  }

  let messageHandlers = [processStateMessage, processServiceMessage, processChatMessage];

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
      onMessageSuccess,
      onMessageRejected
    );
  }

  function onMessageSuccess(result) {
    console.log(result);
  }

  function onMessageRejected(error) {
    console.log(error);
  }

  webSocketServer.on('connection', onConnection);

  return webSocketServer;
}
