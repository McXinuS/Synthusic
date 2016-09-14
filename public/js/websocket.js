function Socket(host, onmessageCallback) {
	var self = this;

	this.onmessage = null;
	this.reconnectTime = 10000;

	this.socket = connect();

	function connect() {
		var ws = new WebSocket(host);

		ws.onopen = function () {
			// get initial data
			ws.send(JSON.stringify({
				type: WEB_SOCKET_MESSAGE_TYPE.get_state
			}));
		};

		ws.onmessage = function (event) {
			var data = JSON.parse(event.data);
			if (self.onmessage != null){
				self.onmessage(data);
			}
		};

		ws.onclose = function (e) {
			console.log('Socket is closed. Next attempt to reconnect in ' + self.reconnectTime / 1000 + ' seconds.', e.reason);
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
			return;

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