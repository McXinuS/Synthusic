/*
	A push-server based on Node.js
*/

var express = require('express'),
  app = express();
var server = require('https').Server(app);

server.listen(process.env.PORT || 5000);

app.use(express.static('public'));

app.get('/index.html', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

console.log("The server is running @ localhost:8080");