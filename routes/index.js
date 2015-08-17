var dab = require("../extmodule/dab.js");


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
    var re = /^[^?]*?(\d+)$/;
    var match = re.exec(req.url);
    var message = req.query.msg;
    if (match == null) {
        // List channels
        res.render('default', { title: 'PiRadio', channels: dab.channels, player: dab.player, msg: message});
    } else if (match != null) {
        // Play channel
        var playIndex = match[1];
        dab.player.playDAB(playIndex);
        dab.player.volume = 8;
        backWithMsg(req, res, "Now playing " + dab.player.currentlyPlaying.channel);
        //res.render('player', {program: dab.player.currentlyPlaying});
    }
};


