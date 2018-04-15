'use strict';

module.exports = startServer;

function startServer() {

  let express = require('express'),
    app = express();

  let port = process.env.PORT || 5000;

  let server = require('http').Server(app);
  server.listen(port);
  console.log("HTTP server is running @ " + port);

  let webSocketServer = require('./web-socket.js').Server(server);
  webSocketServer.on('error', error => console.log(error));
  console.log("WebSocket server is running @ " + port);

  setupSecurity(app);
  setupPublicDirs(app, express);

}

function setupSecurity(app) {
  app.use(function (req, res, next) {

    let cspName = 'Content-Security-Policy';

    let wsSrc = (req.protocol === 'http' ? 'ws://' : 'wss://') + req.get('host');

    let cspContent =
      "default-src 'self'; " +
      "connect-src " + wsSrc + "; " +
      "font-src 'self' https://fonts.gstatic.com/; " +
      // Have to allow unsafe 'data:' scheme because there's no way to stop Angular to inline small images to base64.
      // However, Angular's behaviour might change in 6.0+ : https://github.com/angular/angular-cli/pull/8967
      "img-src 'self' data:; " +
      "script-src 'self' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline';";

    res.setHeader(cspName, cspContent);
    return next();

  });
}

function setupPublicDirs(app, express) {
  app.use(express.static('dist'));
  app.use(express.static('dist/assets'));
}

