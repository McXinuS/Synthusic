function Socket(host, onmessageCallback) {
	this.socket = new WebSocket(host);

	this.socket.onmessage = function(event) {
		var data = JSON.parse(event.data);
		onmessageCallback(data);
	};
}

Socket.prototype.send = function(parameters){
	var message = JSON.stringify(parameters);
	this.socket.send(message);
};