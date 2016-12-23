'use strict';

exports.Server = Server;

const WEB_SOCKET_MESSAGE_TYPE = require('./../shared/web-socket-message-types');
let synthConfig = new (require('./synth-config/config').Config);

let wsClients = [];
let wsLastId = 0;

function Server(server) {
    let webSocketServer = require('ws').Server({
        server: server
    });

    webSocketServer.on('connection', function (ws) {

        var id = wsLastId;
        wsLastId++;

        wsClients[id] = ws;
        console.log("New connection : id " + id);

        ws.on('message', function (message) {
            processWebSocketMessage(message, {ws: ws, id: id});
        });

        ws.on('close', function () {
            console.log('Connection closed : id ' + id);
            delete wsClients[id];
        });

    });

    return webSocketServer;
}

function broadcast(message, sender) {
    if (typeof(message) !== 'string') message = JSON.stringify(message);

    wsClients.forEach(function (client) {
        if (client !== sender.ws) {
            client.send(message);
        }
    });
}

function send(message, reciever) {
    if (typeof(message) !== 'string') message = JSON.stringify(message);

    reciever.ws.send(message);
}


let messageHandlers = [processGeneralMessage, processServiceMessage];

function processWebSocketMessage(message, sender) {
    new Promise(function (resolve, reject) {
        let data = JSON.parse(message);
        let logMsg = 'New message from id ' + sender.id + '. Message ';

        let success = false;
        for (let ind in messageHandlers) {
            let res = messageHandlers[ind](data, sender);
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
    ).catch(
        onException
    );
}

function processGeneralMessage(data, sender) {
    switch (data.type) {
        case WEB_SOCKET_MESSAGE_TYPE.play_note:
            var note = data.note;
            synthConfig.addNote(note);
            broadcast(data, sender);
            return 'type: play_note, note: ' + note;
        case WEB_SOCKET_MESSAGE_TYPE.stop_note:
            var note = data.note;
            synthConfig.removeNote(note);
            broadcast(data, sender);
            return 'type: stop_note, note: ' + note;
        case WEB_SOCKET_MESSAGE_TYPE.stop:
            synthConfig.removeAllNotes();
            broadcast(data, sender);
            return 'type: stop';
        case WEB_SOCKET_MESSAGE_TYPE.get_state:
            send(synthConfig.getStateObject(), sender);
            return 'type: get_state';
    }

    return false;
}

function processServiceMessage(data, sender) {
    switch (data.type) {
        case WEB_SOCKET_MESSAGE_TYPE.ping:
            send({type: WEB_SOCKET_MESSAGE_TYPE.pong}, sender);
            return 'type: ping';
    }

    return false;
}

function onMessageSuccess(result) {
    console.log(result);
}

function onMessageRejected(error) {
    console.log(error);
}

function onException(ex) {
    console.log(ex);
}