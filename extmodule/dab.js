var EventEmitter = require('events').EventEmitter;
var util         = require("util");
var jsenum = require("../polyfills").jsenum;
var autoUpdateProperty = require("../polyfills").autoUpdateProperty;

exports.PROGRAM_TYPE =[null, "News", "Current Affairs", "Information", "Sport", "Education", "Drama", "Arts", "Science",
"Talk", "Pop Music", "Rock Music", "Easy Listening", "Light Classical", "Classical Music", "Other Music",
        "Weather", "Finance", "Children's", "FACTUAL", "Religion", "Phone In", "Travel", "Leisure", "Jazz and Blues", "Country Music",
			"National Music", "Oldies Music", "Folk Music", "Documentary", "Undefined", "Undefined"];


var ext;
if (process.env.HW == "fake") {
    //noinspection JSUnusedGlobalSymbols
    ext = {
        playIndex: -1,
        getVolume: function() {return 0},
        setVolume: function() {return true;},
        getPlayStatus: function() {return 0},
        getPrograms: function() {
            return [
                {programType: 0, dabIndex: 0, channel: "NRK P1", applicationType: 0},
                {programType: 0, dabIndex: 1, channel: "NRK P2", applicationType: 0},
                {programType: 0, dabIndex: 2, channel: "NRK P3", applicationType: 0},
                {programType: 0, dabIndex: 3, channel: "NRK Nyheter", applicationType: 0}
            ];
        },
        getProgramText: function() {
            if (this.playIndex >= 0 && this.playIndex < this.getPrograms().length) {
                return ["Program 1", "Program 2", "Program 3"][this.playIndex];
            }
        },
        getPlayIndex: function() {return this.playIndex;},
        getDataRate: function() {return (this.playIndex == -1 ? -1 : 128)},
        getDABSignalQuality: function() {return (this.playIndex == -1 ? -1 : 50)},
        getSignalStrength: function() {return (this.playIndex == -1 ? -1 : 50)},
        playStream: function(playMode, idx) {this.playIndex = parseInt(idx); return true;},
        prevStream: function() {if (this.playIndex > 0) {this.playIndex -= 1; return true; } else return false},
        nextStream: function() {
            if (this.playIndex < 2) {
                this.playIndex += 1;
                return true}
            else
                return false
        }

    };
} else {
    console.log("Requiring MonkeyBoard");
    ext = require('./build/Release/monkeyboard');
    console.log("MonkeyBoard ready");
}

var getProgramTypeText = function(programType) {
    return exports.PROGRAM_TYPE[programType];
};

exports.monkeyboard = ext;

var channelsEe = new EventEmitter();
exports.playerEvents = new EventEmitter();

function loadProgramsList(arr) {
    console.log("Loading programs list");
    var programs = ext.getPrograms();
    arr.length = programs.length;
    for (var i = 0; i < programs.length; i++) {
        var program = programs[i];
        program.channel = program.channel.trim();
        program.programType = getProgramTypeText(program.programType);
        if (i == this.playIndex) {
            program.playing = true;
        }
        arr[i] = program;
    }
    console.log("Programs list loaded");
    channelsEe.emit("programListLoaded");
    //return programs;
}

exports.PLAY_MODE = jsenum("DAB", "FM");
exports.PLAY_STATUS = jsenum("PLAYING", "SEARCHING", "TUNING", "STOP", "SORTING", "RECONFIGURING");

function ChannelsList() {
    EventEmitter.call(this);
    this.prototype = Array.prototype;
}
util.inherits(ChannelsList, EventEmitter);


var shadow = {
    player: {
        volume: ext.getVolume(),
        playMode: 0, //getEnumValue(ext.getPlayMode(), exports.PLAY_MODE),
        playStatus: getEnumValue(ext.getPlayStatus(), exports.PLAY_STATUS),
        currentlyPlaying: null,
        dataRate: null, //ext.getDataRate(),
        signalQuality: null, //ext.getDABSignalQuality(),
        signalStrength: null, //ext.getSignalStrength(),
        _updateStats: function() {
            //this.dataRate = ext.getDataRate();
            //this.signalQuality = ext.getDABSignalQuality();
            //this.signalStrength = ext.getSignalStrength();
        },
        programText: false
    },
    channelsList: new ChannelsList(),
    playIndex: ext.getPlayIndex()
};

autoUpdateProperty(shadow, "programText", function() {
    var updatedText = ext.getProgramText();
    if (updatedText === true) {
        return shadow.player.programText;
    } else if (updatedText === false) {
        return null;
    } else {
        shadow.player.programText = updatedText;
        return updatedText;
    }
}, 1000, function(newValue, oldValue) {
    exports.playerEvents.emit("stateChange", {programText: newValue});
});

autoUpdateProperty(shadow, "playStatus", function() {
    return ext.getPlayStatus();
}, 1000, function(newValue, oldValue) {
    exports.playerEvents.emit("stateChange", {playStatus: newValue});
});



loadProgramsList(shadow.channelsList);
exports.channels = shadow.channelsList;


//noinspection JSUnusedGlobalSymbols
exports.player = {
    get volume () {
        return shadow.player.volume;
    },
    get channelsMap() {
        var result = {};
        for (var i = 0; i < shadow.channelsList.length; i++) {
            result[i] = shadow.channelsList[i];
        }
        return result;
    },
    get numChannels () {
        return shadow.channelsList.length;
    },
    set volume (vol) {
        vol = parseInt(vol);
        if (ext.setVolume(vol)) {
            shadow.player.volume = vol;
            exports.playerEvents.emit("stateChange", {volume: shadow.player.volume});
            return true;
        } else {
            return false;
        }
    },
    get dataRate () {
        return shadow.player.dataRate;
    },
    /** Deprecated **/
    get signalQuality () {
        return shadow.player.signalQuality;
    },
    get signalStrength () {
        return shadow.player.signalStrength;
    },
    mute: function() {
        ext.toggleMute();
        shadow.player.volume = ext.getVolume();
        exports.playerEvents.emit("stateChange", {volume: shadow.player.volume});
    },
    get playStatus () {
        return exports.PLAY_STATUS.toString(exports.PLAY_STATUS[ext.getPlayStatus()]);
    },
    get programText() {
        return shadow.player.programText;
    },
    get playIndex() {
        return shadow.playIndex;
    },
    set playIndex(idx) {
        return this.playDAB(idx);
    },
    get playMode() {
        return shadow.player.playMode;
    },
    get channelName() {
        var channel = this.currentlyPlaying;
        return channel != null ? channel.channel : null;
    },
    get currentlyPlaying() {
        for (var i = 0; i < shadow.channelsList.length; i++) {
            if (shadow.channelsList[i].playing) {
                return shadow.channelsList[i];
            }
        }
        return null;
    },
    playDAB: function(idx) {
        for (var i = 0; i < shadow.channelsList.length; i++) {
            delete shadow.channelsList[i].playing;
        }
        if (ext.playStream(exports.PLAY_MODE.indexOf(exports.PLAY_MODE.DAB), idx)) {
            shadow.channelsList[idx].playing = true;
            shadow.playIndex = idx;
            this._emitChannelEvent();
            shadow.player._updateStats();
            return true;
        } else {
            this._emitChannelEvent({failed: true});
            return false;
        }
    },
    nextStream: function() {
        if (ext.nextStream()) {
            for (var i = 0; i < shadow.channelsList.length; i++) {
                delete shadow.channelsList[i].playing;
            }
            shadow.playIndex = ext.getPlayIndex();
            shadow.channelsList[shadow.playIndex].playing = true;
            this._emitChannelEvent();
            shadow.player._updateStats();
            return true;
        } else {
            console.warn("nextStream failed. playIndex:", shadow.playIndex);
            return false;

        }
    },
    _emitChannelEvent: function (extra) {
        var props = {
            channel:     shadow.channelsList[shadow.playIndex],
            playIndex:   shadow.playIndex,
            channelName: this.channelName,
            playStatus:  this.playStatus
        };
        if (extra != undefined) {
            extra.iterateProperties(function(key) {
                props[key] = extra[key];
            });
        }
        exports.playerEvents.emit("stateChange", props);
    },
    prevStream: function() {
        if (ext.prevStream()) {
            for (var i = 0; i < shadow.channelsList.length; i++) {
                delete shadow.channelsList[i].playing;
            }
            shadow.playIndex = ext.getPlayIndex();
            shadow.channelsList[shadow.playIndex].playing = true;
            this._emitChannelEvent();
            shadow.player._updateStats();
            return true;
        } else {
            console.warn("prevStream failed. playIndex:", shadow.playIndex);
            return false;

        }
    },
    doScan: function(progressCb) {
        return ext.doScan(progressCb);
    }
};

EventEmitter.call(exports.player);
util.inherits(exports.player, EventEmitter);

function getEnumValue(idx, aEnum) {
    return aEnum[idx];
}

// extend prototype
function inherits(target, source) {
  for (var k in source.prototype)
    { //noinspection JSUnfilteredForInLoop
        target.prototype[k] = source.prototype[k];
    }
}
