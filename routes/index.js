var dab = require("../extmodule/dab.js");
require("../polyfills");


exports.volume = function(req, res, next) {
    if (req.method == "POST") {
        dab.player.volume = parseInt(req.body.volume);
        backWithMsg(req, res, "Volume: " + dab.player.volume);
    } else {
        next();
    }
};

function backWithMsg(req, res, msg) {
    backURL='/channels/';
    // do your thang
    res.redirect(backURL + "?msg=" + msg);
}

exports.channels = function(req, res) {
    var re = /^[^?]*?(\d+|next|previous)$/;
    var match = re.exec(req.url);
    var message = req.query.msg;
    if (match == null && !req.query.channel) {
        // List channels
        res.render('default', { title: 'PiRadio', channels: dab.channels, player: dab.player, msg: message});
    } else {
        // Play channel
        var playIndex = req.query.channel || match[1];
        var result;
        if (playIndex == "next") {
            result = dab.player.nextStream();
        } else if (playIndex == "previous") {
            result = dab.player.prevStream();
        } else {
            result = dab.player.playDAB(playIndex);
        }
        if (result) {
            backWithMsg(req, res, "Now playing " + dab.player.currentlyPlaying.channel);
        } else {
            backWithMsg(req, res, "Could not switch stream");
        }
        //res.render('player', {program: dab.player.currentlyPlaying});
    }
};


