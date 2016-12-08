'use strict';

exports.Server = Server;

// TODO add rooms

var webSocketServer;

const WEB_SOCKET_MESSAGE_TYPE = {
    play_note: 0,
    stop_note: 1,
    stop: 5,
    change_instrument: 10,
    // TODO
    //instrument_add: 11,
    //instrument_remove: 12,
    //instrument_change_...: 1...,
    get_state: 20,
    ping: 100, // sent by client to keep alive connection
    pong: 101  // sent by server
};

var wsClients = [];
var wsLastId = 0;

var stateObject = {
    playing: [],
    instrument: undefined
};

function Server(server) {
    webSocketServer = new require('ws').Server({
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
        console.log
    );
}

function processGeneralMessage(data, sender) {
    switch (data.type) {
        case WEB_SOCKET_MESSAGE_TYPE.play_note:
            var note = data.note;
            stateObject.playing[note] = true;
            broadcast(data, sender);
            return 'type: play_note, note: ' + note;
        case WEB_SOCKET_MESSAGE_TYPE.stop_note:
            var note = data.note;
            stateObject.playing[note] = false;
            broadcast(data, sender);
            return 'type: stop_note, note: ' + note;
        case WEB_SOCKET_MESSAGE_TYPE.stop:
            stateObject.playing = [];
            broadcast(data, sender);
            return 'type: stop';
        case WEB_SOCKET_MESSAGE_TYPE.get_state:
            send(stateObject, sender);
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