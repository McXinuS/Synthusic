//var wsPort = (process.env.PORT || 5000) + 1;
var wsPort = 5001;

// TODO try import on later nodejs version
// import {WEB_SOCKET_MESSAGE_TYPE} from 'public/js/values.js';
var WEB_SOCKET_MESSAGE_TYPE = {
	play_note: 0,
	stop_note: 1,
	stop: 5,
	change_instrument: 10
};

var webSocketServer = new require('ws').Server({
	port: wsPort
});

var wsClients = [];
var wsLastId = 0;

var stateObject = {
	playing: [],
	instrument: undefined
};

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

function processWebSocketMessage(message, sender) {
	var data = JSON.parse(message);
	var logMsg = 'New message from id ' + sender.id + '. Message ';

	if (data == undefined || data.type == undefined) {
		logMsg += ' : ' + JSON.stringify(data);
	} else {
		var note;
		switch (data.type) {
			case WEB_SOCKET_MESSAGE_TYPE.play_note:
				note = data.noteName + data.noteOctave;
				logMsg += 'type : play_note, note : ' + note;
				stateObject[note] = true;
				break;
			case WEB_SOCKET_MESSAGE_TYPE.stop_note:
				note = data.noteName + data.noteOctave;
				logMsg += 'type : stop_note, note : ' + note;
				stateObject[note] = false;
				break;
			case WEB_SOCKET_MESSAGE_TYPE.stop:
				logMsg += 'type : stop';
				stateObject.playing = [];
				break;
			case WEB_SOCKET_MESSAGE_TYPE.change_instrument:
				logMsg += 'type : change_instrument, new instrument : ' + data.instrumentName;
				stateObject.instrument = data.instrumentName;
				break;
		}
	}

	wsClients.forEach(function (client) {
		if (client !== sender.ws) {
			client.send(message);
		}
	});

	console.log(logMsg);
}