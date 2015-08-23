var dab = require("../extmodule/dab.js");
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
    var settableProps = {"volume": parseInt};
    var propsSet = {};
    req.body.iterateProperties(function(prop, idx) {
        if (settableProps[prop] != undefined) {
            var value = settableProps[prop](req.body[prop]);
            propsSet[prop] = value;
            dab.player[prop] = value;
        }
    });
    res.end(JSON.stringify(propsSet));
};