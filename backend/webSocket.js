var webSocketServer;

WEB_SOCKET_MESSAGE_TYPE = {
	play_note: 0,
	stop_note: 1,
	stop: 5,
	change_instrument: 10,
	get_state: 20
};

var wsClients = [];
var wsLastId = 0;

var stateObject = {
	playing: [],
	instrument: undefined
};

exports.Server = function (server) {
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
};

function broadcast(message, sender){
	wsClients.forEach(function (client) {
		if (client !== sender.ws) {
			client.send(message);
		}
	});
}

function processWebSocketMessage(message, sender) {
	try {
		var data = JSON.parse(message);
		var logMsg = 'New message from id ' + sender.id + '. Message ';
		var bCast = true;	// whether or not the server should broadcast incoming message

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
				case WEB_SOCKET_MESSAGE_TYPE.get_state:
					bCast = false;
					logMsg += 'type : get_state';
					sender.ws.send(JSON.stringify(stateObject));
					break;
			}
		}

		console.log(logMsg);

		if (bCast) {
			broadcast(message, sender);
		}
	} catch (e) {
		console.log('Exception in WebSocket.send: ' + e.message);
	}
}