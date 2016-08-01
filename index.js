/*
	A push-server based on Node.js
*/

var fs = require('fs');
var express = require('express'),
  app = express();

var port = process.env.PORT || 8443;
var insecurePort = process.argv[3] || 4080;

var options = {
  key: fs.readFileSync('ssl/simple-synthesizer_herokuapp_com.key'),
  cert: fs.readFileSync('ssl/simple-synthesizer_herokuapp_com.crt')
};

var server = require('https').createServer(options, app);  
server.listen(port);

// redirect to HTTPS
var server = require("http").Server(function(req, res){
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
	console.log('Redirecting to SSL: from "' + oldUrl + '" to "' + newUrl + '"');
  }).listen(insecurePort);


app.use(express.static('public'));

app.get('/', function (req, res) {
  console.log('Responsing to "' + req.url + '" request');
  res.sendFile(__dirname + '/index.html');
});

console.log("The server is running @ " + port);