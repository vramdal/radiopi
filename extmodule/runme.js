var mb = require('./build/Release/monkeyboard');

var playIndex;

console.log("Initialiserer");
//mb.init();
//var playStatus = mb.getPlayStatus();
//console.log("playStatus: ", playStatus);
//mb.playStream(0, 5);
//mb.setVolume(16);

mb.asyncTest(function(err, data) {
    console.log("Callback", arguments);
});

console.log("Scanner");
var programs = mb.scan(function(err, data) {
    console.log("doScan callback", arguments);

});
//console.log("Programs: ", programs);

/*
while(1) {
    playStatus = mb.getPlayStatus();
    console.log("playStatus: " + playStatus);
    playIndex = mb.getPlayIndex();
    console.log("playIndex: " + playIndex);
    playIndex = mb.getPlayIndex();
    console.log("playIndex: " + playIndex);
}
*/
mb.shutDown();

//var ffi = require("ffi");
//var lib = ffi.Library(null, {
//    "DABAutoSearch" : ["int", ["int"]]
//});