var dab = require("./extmodule");
var ee = require('events').EventEmitter;
var fs = require("fs");
var path = require("path");
var http = require('http');


var dir = process.env.DAAPD_DIR || path.join(getUserHome(), "daapd_music");
var ext = "m3u";

dab.channels.on("programListLoaded", function() {
    console.log("Fikk event: ", args);
    syncDir(dab.channels);
});

exports.init = function() {
    syncDir(dab.channels);
};

function syncDir(channels) {
    fs.readdir(dir, function(err, files) {
        if (err) {
            console.error("Could not access daapd-sync directory " + dir, err);
            return;
        }
        files.sort();
        var toCreate = [];
        var toRemove = [];
        for (var c = 0; c < channels.length; c++) {
            var channel = channels[c];
            var name = channel.channel;
            var fileIdx = files.indexOf(channel.dabIndex + "-" + name + "." + ext);
            if (fileIdx != -1) {
                files.splice(fileIdx, 1);
            } else {
                toCreate.push(channel);
            }
        }
        for (var i = 0; i < toCreate.length; i++) {
            fs.writeFileSync(path.join(dir, toCreate[i].dabIndex + "-" + toCreate[i].channel) + "." + ext, "#EXTM3U\n#EXTINF:-1," + toCreate[i].channel +" - \nhttp://localhost:3000/channels/" + toCreate[i].dabIndex);
        }
        for (var f = 0; f < files.length; f++) {
            var file = files[f];
            if (!file.endsWith("." + ext)) {
                continue;
            }
            fs.unlinkSync(path.join(dir, file));
            //console.log("Would delete " + path.join(dir, file));
        }
    })
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}