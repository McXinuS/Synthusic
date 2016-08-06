/*
	A push-server based on Node.js
*/

var fs = require('fs');
var express = require('express'),
  app = express();

var port = process.env.PORT || 5000;
//var insecurePort = process.argv[3] || 4080;

require("http").Server(app).listen(port);

/*var options = {
  key: fs.readFileSync('ssl/simple-synthesizer_herokuapp_com.key'),
  cert: fs.readFileSync('ssl/simple-synthesizer_herokuapp_com.crt')
};*/

//var server = require('https').createServer(options, app);  
//server.listen(port);

// redirect to HTTPS
/*var server = require("http").Server(function(req, res){
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
  }).listen(insecurePort);*/


app.use(express.static('public'));

app.get('*', function(req,res,next){
  if(req.headers['x-forwarded-proto']!='https'){
    console.log('Redirecting to HTTPS');
    res.redirect('https://'+req.headers.host+req.url);
  }
  else{
    console.log('Responsing to "' + req.url + '" request');
    next();
  }
})

/*app.all('*', function (req, res, next) {
  if (req.protocol !== 'https'){
    console.log('redirecting to HTTPS...');
    var newUrl = 'https://' + req.headers.host + req.url;
    res.writeHead(301, {
      'Content-Type': 'text/plain', 
      'Location': newUrl
    });
    res.end('Redirecting to SSL\n');
  }
  else{
    console.log('Responsing to "' + req.url + '" request');
    next();
  }
});*/

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

console.log("The server is running @ " + port);