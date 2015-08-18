exports.PROGRAM_TYPE =[null, "News", "Current Affairs", "Information", "Sport", "Education", "Drama", "Arts", "Science",
"Talk", "Pop Music", "Rock Music", "Easy Listening", "Light Classical", "Classical Music", "Other Music",
        "Weather", "Finance", "Children's", "FACTUAL", "Religion", "Phone In", "Travel", "Leisure", "Jazz and Blues", "Country Music",
			"National Music", "Oldies Music", "Folk Music", "Documentary", "Undefined", "Undefined"];


var ext;
if (process.env.HW == "fake") {
    ext = {
        playIndex: 0,
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
    ext = require('./build/Release/monkeyboard');
}

var getProgramTypeText = function(programType) {
    return exports.PROGRAM_TYPE[programType];
};

exports.monkeyboard = ext;

function loadProgramsList() {
    var programs = ext.getPrograms();
    for (var i = 0; i < programs.length; i++) {
        var program = programs[i];
        program.programType = getProgramTypeText(program.programType);
        if (i == this.playIndex) {
            program.playing = true;
        }
    }
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
        dataRate: ext.getDataRate(),
        signalQuality: ext.getDABSignalQuality()
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
        return player.dataRate;
    },
    get signalQuality () {
        return player.signalQuality;
    },
    mute: function() {
        ext.toggleMute();
        shadow.player.volume = ext.getVolume();
    },
    get playStatus () {
        return PLAY_STATUS[ext.getPlayStatus()].toString();
    },
    get programText() {
        return ext.getProgramText();
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
            return true;
        } else {
            console.warn("prevStream failed. playIndex:", shadow.playIndex);
            return false;

        }
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
