'use strict';

exports.Server = Server;

let rs = require('./rooms/room-service').RoomService;
const WebSocketMessageType = require('./../shared/web-socket-message-types.ts').WebSocketMessageType;

function Server(server) {
  let webSocketServer = require('ws').Server({
    server: server
  });

  let wsClients = new Map(),
    wsLastId = 0,
    roomService = new rs();

  function onConnection(ws) {
    let id = wsLastId++;
    wsClients.set(id, ws);
    let roomId = roomService.addUser(ws);
    notifyRoomUsersUpdate(roomId);

    console.log("New connection : id " + id);

    ws.on('message', function (message) {
      processWebSocketMessage(message, id);
    });

    ws.on('close', function () {
      roomService.removeUser();
      wsClients.delete(id);
      notifyRoomUsersUpdate(roomId);
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
    if (typeof(message) === 'object') {
      message = JSON.stringify(message);
    }
    if (receivers && receivers[0] && !(receivers[0] instanceof WebSocket)) {
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
    let rec = roomService.getRoomByUser(userId);
    rec.splice(rec.findIndex(userId), 1);
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
    if (!(receiver instanceof WebSocket)) {
      receiver = getWebSockets(receiver);
    }
    receiver.send(message);
  }

  function notifyRoomUsersUpdate(roomId) {
    broadcast({
      type: WebSocketMessageType.room_users_update,
      data: roomService.getRoomUsersByUser(roomId)
    })
  }

  function processStateMessage(message, sender) {
    let note;
    switch (message.type) {

      case WebSocketMessageType.get_state:
        send(roomService.getRoomStateByUser(sender), sender);
        return true;

      case WebSocketMessageType.note_add:
        roomService.getRoomByUser(sender).addNote(message.data);
        broadcastToUserRoom(message, sender);
        return true;
      case WebSocketMessageType.note_remove:
        roomService.getRoomByUser(sender).removeNote(message.data);
        broadcastToUserRoom(message, sender);
        return true;

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
      case WebSocketMessageType.room_name_update:
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
      broadcastToUserRoom(message, sender);
      return true;
    }
    return false;
  }

  let messageHandlers = [processStateMessage, processServiceMessage, processChatMessage];

  function processWebSocketMessage(messageStr, sender) {
    new Promise(function (resolve, reject) {
      let message = JSON.parse(messageStr),
        logMsg = 'New message from id ' + sender + ': ' + messageStr;
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
