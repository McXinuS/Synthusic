exports.Socket = Socket;

function Socket(host) {
    this.onmessage = null;
    this.onopen = null;

    this.SEND_WAIT_TIME = 1000; // interval between attempts to send data in wrong socket state
    this.RECONNECT_TIME = 10000; // time between attempts to reconnect when disconnected
    this.PING_TIME = 30000; // interval of ping of server to keep web socket connection

    this.host = host;
}

Socket.prototype.connect = function () {
    var ws = new WebSocket(this.host);

    var self = this;

    var pingIntervalId;
    ws.onopen = function () {
        console.info(`Connected to server`);
        pingIntervalId = setInterval(function() {
            self.sendPing();
        }, self.PING_TIME);
        if (self.onopen != null) {
            self.onopen();
        }
    };

    ws.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (self.onmessage != null) {
            self.onmessage(data);
        }
    };

    ws.onclose = function () {
        console.warn(`Socket is closed. Next attempt to reconnect in ${self.RECONNECT_TIME / 1000} seconds`);
        clearTimeout(pingIntervalId);
        setTimeout(function () {
            self.connect();
        }, self.RECONNECT_TIME)
    };

    this.socket = ws;
};

Socket.prototype.send = function (parameters) {
    this.waitForSocketConnection(function (socket) {
        var message = JSON.stringify(parameters);
        socket.send(message);
    });
};

/**
 * Wait for socket state to be 'ready' and pass the socket into a callback.
 */
Socket.prototype.waitForSocketConnection = function (callback) {
    if (this.socket.readyState === 1) {
        if (callback != null) callback(this.socket);
    } else {
        setTimeout(function () {
            this.waitForSocketConnection(this.socket, callback);
        }.bind(this), this.SEND_WAIT_TIME);
    }
};

Socket.prototype.sendPing = function () {
    this.send({type: __constants.WEB_SOCKET_MESSAGE_TYPE.ping});
};