/*
	A push-server based on Node.js
*/

var fs = require('fs');
var express = require('express'),
  app = express();

var port = process.env.PORT || 8443;
var insecurePort = process.argv[3] || 5000;

var options = {
  key: fs.readFileSync('ssl/simple-synthesizer_herokuapp_com.key'),
  cert: fs.readFileSync('ssl/simple-synthesizer_herokuapp_com.crt')
};

var server = require('https').createServer(options, app);
/*
require("https").createServer(options, function(req, res){
    res.writeHead(200, {    'Content-Type': 'text/plain', 
    "Strict-Transport-Security": "max-age=604800"});
    res.end('Hello from SSL!\n');
  }).listen(port);
*/

// redirect to HTTPS
require("http").Server(function(req, res){
	// remove port from host name
	var hostname = ( req.headers.host.match(/:/g) )
		? req.headers.host.slice( 0, req.headers.host.indexOf(":") )
		: req.headers.host;
	var newUrl = 'https://' + hostname + ':' + port + req.url;
    res.writeHead(301, {
       'Content-Type': 'text/plain', 
       'Location': newUrl
    });
    res.end('Redirecting to SSL\n');
	
	var oldUrl = req.protocol + '://' + req.headers.host + req.url;
	console.log('Redirected to the https from "' + oldUrl + '" to "' + newUrl + '"');
  }).listen(insecurePort);

  
server.listen(port);

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

console.log("The server is running @ " + port);