require('./webSocketServer.js');

var fs = require('fs');
var express = require('express'),
	app = express();
var path = require('path');

var port = process.env.PORT || 5000;

require("http").Server(app).listen(port);

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
	res.sendFile(path.join(__dirname, '/img/icon_highres.png'));
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '/index.html'));
});

console.log("The server is running @ " + port);
