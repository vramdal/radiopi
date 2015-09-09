var express = require('express');

var http = require('http');
var path = require('path');
var async = require("async");
var routes = require('./routes');
var bodyParser = require('body-parser');
var dab = require("./extmodule");
var daapdSync = require("./daapd-sync");
var polyfill = require("./polyfills");

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

http.createServer(app).listen(port, function(){
    console.log(arguments);
    console.log("Express server listening on port %d in %s mode", port, app.settings.env);
    daapdSync.init();
});
