/*
	Attempt to create a push-server based on Node.js
*/

var express = require('express'),
  app = express();
var server = require('http').Server(app);
var gcm = require('node-gcm');

server.listen(80);

app.use(express.static('public'));
app.get('/index.html', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/api/send_sample', function (req, res) {
  sendSample();
});

console.log("The server is running @ localhost:80");



var sender = new gcm.Sender('AIzaSyAcakhi97oJuejIKIV07_v_KRjy9SEXKdU');

function sendSample () {
	var message = new gcm.Message({
		collapseKey: 'demo',
		priority: 'high',
		contentAvailable: true,
		delayWhileIdle: true,
		timeToLive: 3,
		restrictedPackageName: "com.example.push",
		dryRun: true,
		data: {
			key1: 'message1',
			key2: 'message2'
		},
		notification: {
			title: "Hello, World",
			icon: "ic_launcher",
			body: "This is a notification that will be displayed ASAP."
		}
	});

	sender.send(message, { topic: '/topics/notes' }, 10, function (err, response) {
		if(err) console.error(err);
		else    console.log(response);
	});
}