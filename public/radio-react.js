
var Slider = React.createClass({
    getInitialState: function() {
        return {"volume": 0, "playIndex": 0, "numChannels": 0}
    },
    componentDidMount: function() {
        console.log("componentDidMount");
        try {
            var xhr = new XMLHttpRequest();
            var _this = this;
            xhr.addEventListener("load", function (evt) {
                console.log("Load");
                if (_this.isMounted()) {
                    console.log("Populating");
                    var json = JSON.parse(evt.srcElement.responseText);
                    var keys = Object.keys(json);
                    for (var i = 0; i < keys.length; i++) {
                        _this.state[keys[i]] = json[keys[i]];
                    }
                    console.log("State: ", _this.state);
                }
            });
            xhr.open("get", "/player", true);
            xhr.send();
        } catch (e) {
            console.error(e);
        }
    },
    componentWillUnmount: function() {
    },
    handleVolumeChange: function(event) {
        this.setState({volume: event.target.value});
    },
    handlePlayIndexChange: function(event) {
        this.setState({playIndex: event.target.value});
    },
    render: function() {
        var numChannels = this.state.numChannels;
        var playIndex = this.state.playIndex;
        var volume = this.state.volume;
        console.log("numChannels:", numChannels);
        return <div>
            <label>Volume
                <input type="range" min="0" max="16" name="volume" value={volume} onChange={this.handleVolumeChange}/>
            </label>
            <label>
                <input type="range" min="0" max={numChannels} name="playIndex" value={playIndex}  onChange={this.handlePlayIndexChange}/>
            </label>
        </div>
                ;
    }
});

//React.render(<Timer />, mountNode);