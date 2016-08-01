/*
	Attempt to create a push-server based on Node.js
*/

var express = require('express'),
  app = express();
var server = require('http').Server(app);

server.listen(8080);

app.use(express.static('public'));

app.get('/index.html', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

console.log("The server is running @ localhost:8080");