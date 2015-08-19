exports.PROGRAM_TYPE =[null, "News", "Current Affairs", "Information", "Sport", "Education", "Drama", "Arts", "Science",
"Talk", "Pop Music", "Rock Music", "Easy Listening", "Light Classical", "Classical Music", "Other Music",
        "Weather", "Finance", "Children's", "FACTUAL", "Religion", "Phone In", "Travel", "Leisure", "Jazz and Blues", "Country Music",
			"National Music", "Oldies Music", "Folk Music", "Documentary", "Undefined", "Undefined"];


var ext;
if (process.env.HW == "fake") {
    ext = {
        playIndex: -1,
        getVolume: function() {return 0},
        setVolume: function() {return true;},
        getPlayStatus: function() {return 0},
        getPrograms: function() {
            return [
                {programType: 0, dabIndex: 0, channel: "NRK P1", applicationType: 0},
                {programType: 0, dabIndex: 1, channel: "NRK P2", applicationType: 0},
                {programType: 0, dabIndex: 2, channel: "NRK P3", applicationType: 0}
            ];
        },
        getProgramText: function() {return "Programmet mitt"},
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

function loadProgramsList() {
    console.log("Loading programs list");
    var programs = ext.getPrograms();
    for (var i = 0; i < programs.length; i++) {
        var program = programs[i];
        program.programType = getProgramTypeText(program.programType);
        if (i == this.playIndex) {
            program.playing = true;
        }
    }
    console.log("Programs list loaded");
    return programs;
}

var PLAY_MODE = [];
PLAY_MODE.DAB = Symbol("DAB");
PLAY_MODE.FM = Symbol("FM");
PLAY_MODE.push(PLAY_MODE.DAB, PLAY_MODE.FM);
exports.PLAY_MODE = PLAY_MODE;

var PLAY_STATUS = [];
PLAY_STATUS.PLAYING = Symbol("Playing");
PLAY_STATUS.SEARCHING = Symbol("Searching");
PLAY_STATUS.TUNING = Symbol("Tuning");
PLAY_STATUS.STOP = Symbol("Stop");
PLAY_STATUS.SORTING = Symbol("Sorting");
PLAY_STATUS.RECONFIGURING = Symbol("Reconfiguring");
PLAY_STATUS.push(
        PLAY_STATUS.PLAYING,
        PLAY_STATUS.SEARCHING,
        PLAY_STATUS.TUNING,
        PLAY_STATUS.STOP,
        PLAY_STATUS.SORTING,
        PLAY_STATUS.RECONFIGURING
);
exports.PLAY_STATUS = PLAY_STATUS;

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
    channels: loadProgramsList(),
    playIndex: ext.getPlayIndex()
};

exports.channels = shadow.channels;

exports.player = {
    get volume () {
        return shadow.player.volume;
    },
    set volume (vol) {
        if (ext.setVolume(vol)) {
            shadow.player.volume = vol;
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
    },
    get playStatus () {
        return PLAY_STATUS[ext.getPlayStatus()].toString();
    },
    get programText() {
        var updatedText = ext.getProgramText();
        if (updatedText === true) {
            return shadow.player.programText;
        } else if (updatedText === false) {
            return null;
        } else {
            shadow.player.programText = updatedText;
            return updatedText;
        }
    },
    get playIndex() {
        return shadow.playIndex;
    },
    get playMode() {
        return shadow.player.playMode;
    },
    get currentlyPlaying() {
        for (var i = 0; i < shadow.channels.length; i++) {
            if (shadow.channels[i].playing) {
                return shadow.channels[i];
            }
        }
        return null;
    },
    playDAB: function(idx) {
        for (var i = 0; i < shadow.channels.length; i++) {
            delete shadow.channels[i].playing;
        }
        if (ext.playStream(PLAY_MODE.indexOf(PLAY_MODE.DAB), idx)) {
            shadow.channels[idx].playing = true;
            shadow.playIndex = idx;
            shadow.player._updateStats();
            return true;
        } else {
            return false;
        }
    },
    nextStream: function() {
        if (ext.nextStream()) {
            for (var i = 0; i < shadow.channels.length; i++) {
                delete shadow.channels[i].playing;
            }
            shadow.playIndex = ext.getPlayIndex();
            shadow.channels[shadow.playIndex].playing = true;
            shadow.player._updateStats();
            return true;
        } else {
            console.warn("nextStream failed. playIndex:", shadow.playIndex);
            return false;

        }
    },
    prevStream: function() {
        if (ext.prevStream()) {
            for (var i = 0; i < shadow.channels.length; i++) {
                delete shadow.channels[i].playing;
            }
            shadow.playIndex = ext.getPlayIndex();
            shadow.channels[shadow.playIndex].playing = true;
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

function getEnumValue(idx, aEnum) {
    return aEnum[idx];
}

// extend prototype
function inherits(target, source) {
  for (var k in source.prototype)
    target.prototype[k] = source.prototype[k];
}
