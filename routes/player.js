var dab = require("../extmodule/dab.js");
var negotiate = require('express-negotiate');
var player = dab.player;

exports.statusGet = function(req, res, next) {
    res.format({
        "json": function() {
            res.send(JSON.stringify(dab.player));
        },
        "html": function() {
            res.render('player', { title: 'PiRadio', player: dab.player});
        }
    });
};

exports.statusSet = function(req, res, next) {
    var propsSet = {};
    if (req.body.volume != undefined) {
        dab.player.volume = parseInt(req.body.volume);
        propsSet["volume"] = dab.player.volume;
    }
    res.end(JSON.stringify(propsSet));
};