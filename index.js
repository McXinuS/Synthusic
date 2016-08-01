/*
	A push-server based on Node.js
*/

var express = require('express'),
  app = express();
var server = require('http').Server(app);

var port = process.env.PORT || 5000;
server.listen(port);

app.use(express.static('public'));
app.use('*', function(req, res, next) {  
  if(!req.secure) {
    var secureUrl = "https://" + req.headers['host'] + req.url; 
    res.writeHead(301, { "Location":  secureUrl });
    res.end();
	console.log('Redirected to the https');
  }
  //next();
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

console.log("The server is running @ " + port);