var express = require('express');

var http = require('http');
var path = require('path');
var async = require("async");
var routes = require('./routes');
var bodyParser = require('body-parser');
var dab = require("./extmodule");
var daapdSync = require("./daapd-sync");
var polyfill = require("./polyfills");
var urlUtil = require('url');

var app = express();
var port = app.get("port") ? app.get("port") : (process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/channels/*', routes.channels);
//app.all('/volume', routes.volume);

var playerRoute = require("./routes/player");

app.get('/player', playerRoute.statusGet);
app.post('/player', playerRoute.statusSet);

app.use('/static', express.static('public'));


var server = http.createServer(app).listen(port, function(){
    console.log(arguments);
    console.log("Express server listening on port %d in %s mode", port, app.settings.env);
    daapdSync.init();
});
var WebSocketServer = WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server }) ;

var playerEvents = dab.playerEvents;

wss.on('connection', function connection(ws) {
    var location = urlUtil.parse(ws.upgradeReq.url, true);
    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    var dabEventHandler = function (evt) {
        console.log(arguments);
        ws.send(JSON.stringify(evt));
    };

    var propsToSend = Object.keys(location.query);
    var result = {};
    for (var prop in location.query) {
        if (!location.query.hasOwnProperty(prop)) {
            continue;
        }
        result[prop] = dab.player[prop];
        ws.send(JSON.stringify(result));
    }

    playerEvents.on("stateChange", dabEventHandler);

    ws.on("close", function() {
        playerEvents.removeListener("stateChange", dabEventHandler);
    });

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        playerRoute.setProperties(JSON.parse(message));
    });

    //ws.send('something');
});

