// TODO: add onMessageListener

exports.Socket = Socket;

function Socket(host) {
	var self = this;

	this.onmessage = null;
	this.reconnectTime = 10000;

	this.host = host;
	this.socket = connect();

	function connect() {
		var ws = new WebSocket(self.host);

		ws.onconnect = function () {
			console.warn(`Connected to ${self.host}`);
		};

		ws.onopen = function () {
			// get initial data
			this.send(JSON.stringify({
				type: constants.WEB_SOCKET_MESSAGE_TYPE.get_state
			}));
		};

		ws.onmessage = function (event) {
			var data = JSON.parse(event.data);
			if (self.onmessage != null) {
				self.onmessage(data);
			}
		};

		ws.onclose = function () {
			console.warn(`Socket is closed. Next attempt to reconnect in  ${self.reconnectTime / 1000} seconds`);
			setTimeout(function () {
				self.socket = connect();
			}, self.reconnectTime)
		};

		return ws;
	}

	this.waitForSocketConnection = function (socket, callback) {
		if (socket.readyState === 1) {
			if (callback != null) {
				callback(socket);
			}

		} else {
			setTimeout(function () {
				self.waitForSocketConnection(socket, callback);
			}, 1000);
		}
	}
}

Socket.prototype.send = function (parameters) {
	this.waitForSocketConnection(this.socket, function (socket) {
		var message = JSON.stringify(parameters);
		socket.send(message);
	});
};