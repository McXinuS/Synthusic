'use strict';

exports.Server = Server;

const WEB_SOCKET_MESSAGE_TYPE = require('./../shared/web-socket-message-types');

let roomService = new (require('./rooms/room-service').RoomService)();

function Server(server) {
  let webSocketServer = require('ws').Server({
    server: server
  });

  let wsClients = [],
    wsLastId = 0;

  function onConnection(ws) {
    let id = wsLastId++;
    wsClients[id] = ws;
    roomService.addUser(ws);

    console.log("New connection : id " + id);

    ws.on('message', function (message) {
      processWebSocketMessage(message, {ws: ws, id: id});
    });

    ws.on('close', function () {
      console.log('Connection closed : id ' + id);
      roomService.deleteUser();
      delete wsClients[id];
    });
  }


  function processStateMessage(data, sender) {
    let note;
    switch (data.type) {
      case WEB_SOCKET_MESSAGE_TYPE.play_note:
        note = data.note;
        synthConfig.addNote(note);
        return 'type: play_note, note: ' + note;
      case WEB_SOCKET_MESSAGE_TYPE.stop_note:
        note = data.note;
        synthConfig.removeNote(note);
        return 'type: stop_note, note: ' + note;
      case WEB_SOCKET_MESSAGE_TYPE.stop:
        synthConfig.removeAllNotes();
        return 'type: stop';
      case WEB_SOCKET_MESSAGE_TYPE.get_state:
        send(synthConfig.getStateObject(), sender);
        return 'type: get_state';
    }
    return null;
  }

  function processServiceMessage(data, sender) {
    switch (data.type) {
      case WEB_SOCKET_MESSAGE_TYPE.ping:
        send({type: WEB_SOCKET_MESSAGE_TYPE.pong}, sender);
        return 'type: ping';
    }
    return null;
  }

  function processChatMessage(data, sender) {
    return null;
  }

  let messageHandlers = [processStateMessage, processServiceMessage, processChatMessage];

  function processWebSocketMessage(message, sender) {
    new Promise(function (resolve, reject) {
      let data = JSON.parse(message);
      let logMsg = 'New message from id ' + sender.id + '. Message ';
      let success = false;
      for (let handler of messageHandlers) {
        let res = handler(data, sender);
        if (res) {
          success = true;
          resolve(logMsg + res);
          break;
        }
      }
      if (!success) {
        reject(logMsg + ': ' + JSON.stringify(data));
      }
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

  // send message to the particular user
  function send(message, reciever) {
    if (typeof(message) === 'object') message = JSON.stringify(message);
    reciever.ws.send(message);
  }

  webSocketServer.on('connection', onConnection);

  return webSocketServer;
}
