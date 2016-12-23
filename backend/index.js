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

var useSsl = (process.argv[2] != undefined && process.argv[2].toLowerCase()=='true');

// redirect to HTTPS
if (useSsl) {
	app.get('*', function (req, res, next) {
		if (req.headers['x-forwarded-proto'] != 'https') {
			console.log('Redirecting to HTTPS');
			res.redirect('https://' + req.headers.host + req.url);
		}
		else {
			console.log('Responding to "' + req.url + '" request');
			next();
		}
	});
}

app.get('/favicon', function (req, res) {
	res.sendFile(path.join(__dirname, '/img/favicon.png'));
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '/index.html'));
});