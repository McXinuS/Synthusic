var fs = require('fs');
var express = require('express'),
	app = express();
var path = require('path');

var port = process.env.PORT || 5000;

var server = require("http").Server(app);
server.listen(port);
console.log("HTTP server is running @ " + port);

var webSocketServer = require('./web-socket.js').Server(server);
console.log("WebSocket server is running @ " + port);

app.use(express.static('public'));

app.get(['/favicon', '/favicon.ico'], function (req, res) {
	res.sendFile(path.join(__dirname, '../frontend/img/favicon.png'));
});