var dab = require("../extmodule/dab.js");
var player = dab.player;
var multiparty = require('multiparty');

exports.statusGet = function (req, res) {
    res.format({
        "json": function() {
            res.send(JSON.stringify(dab.player));
        },
        "html": function() {
            res.render('player', { title: 'PiRadio', player: dab.player});
        }
    });
};

exports.statusSet = function (req, res) {
    var form = new multiparty.Form();
    //noinspection JSUnusedLocalSymbols
    form.parse(req, function(err, fields, files) {
        var settableProps = {"volume": parseInt, "playIndex": parseInt};
        var propsSet = {};
        fields.iterateProperties(function (prop) {
            if (settableProps[prop] != undefined) {
                var value = settableProps[prop](fields[prop]);
                propsSet[prop] = value;
                dab.player[prop] = value;
            }
        });
        res.end(JSON.stringify(propsSet));

    });
};