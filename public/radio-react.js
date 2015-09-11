var AjaxForm = React.createClass({
    dirtyProps: {},
    getInitialState: function() {
        return {"volume": 0, "playIndex": 0, "numChannels": 10, "maxVolume": 16, "connected": false,
            "programText": "", "channelName": "", "playStatus": "", "channelsMap": {}}
    },
    componentDidMount: function() {
        var _this = this;
        var initialState = _this.getInitialState();
        var propsToFetch = Object.keys(initialState);
        var wsUrl = (window.location.protocol === "https" ? "wss:" : "ws:") + "//" + window.location.hostname + ":3000" + "/player?" + propsToFetch.join("&");
        console.log("Connecting to WebSocket on " + wsUrl);
        this.ws = new WebSocket(wsUrl);
        this.ws.onmessage = function(evt) {
            var data = JSON.parse(evt.data);
            console.log("Mottok: ", data);
            _this.setState(data);
            console.log("Satt state");
        };
        this.ws.onopen = function(evt) {
            _this.state.connected = true;
        };
        this.ws.onerror = function(evt) {
            console.error("WebSocket error", evt);
        };
        this.ws.onclose = function(evt) {
            _this.state.connected = false;
        };
        var volumeKnob = this.getDOMNode().querySelector("#volume-knob");
        volumeKnob.addEventListener("change", function() {
            _this.onUpdate("volume", volumeKnob.value);
        });
        console.log("componentDidMount");
    },
    onUpdate: function(name, value) {
        var changes = {};
        changes[name] = value;
        //this.setState(changes);
        this.dirtyProps[name] = value;
        this.save();
    },
    save: function() {
        if (this.isSaving) {
            console.log("Queueing save");
            this.xhrQueue = true;
            return;
        }
        this.isSaving = true;
        var formData = new FormData();
        var _this = this;
/*
        this.dirtyProps.iterateProperties(function(item, idx) {
            formData.append(item, _this.dirtyProps[item]);
        });
*/
        this.ws.send(JSON.stringify(this.dirtyProps));
/*
        var xhr = new XMLHttpRequest();
        xhr.open("post", "/player", true);
        xhr.send(formData);
*/
        this.isSaving = false;
        if (this.xhrQueue) {
            delete this.xhrQueue;
            console.log("Queued save, saving");
            this.save();
        }
    },
    test: function(evt) {
        console.log("test: ", arguments);
        this.setState({"volume": evt.target.value});
    },

    render: function() {
        console.log("FORM render");
        var radiobuttons = [];
        var channelOptionsList = [];
        var channelColumns = [];

        for (var key in this.state.channelsMap) {
            if (!this.state.channelsMap.hasOwnProperty(key)) {
                continue;
            }
            var channel = this.state.channelsMap[key];
            radiobuttons.push(<span key={key}><input type="radio" name="playIndex" value={key}/> {channel.channel}</span>);
            channelOptionsList.push(<option key={key} label="{channel.channel}">{key}</option>);
            channelColumns.push(<td key={key}><span>{channel.channel}</span></td>);
        }
        return (
                <form method="post" action="/player"> Connected: {this.state.connected ? "yes" : "no"}<br/>
                    <webaudio-knob id="volume-knob" value={this.state.volume} />
                    <h1>{this.state.programText}</h1>
                    <h2>{this.state.channelName}</h2>
                    <h3>{this.state.playStatus}</h3>
                    <Slider label="Volume" name="volume" value={this.state.volume} max={this.state.maxVolume} onUpdate={this.onUpdate}/> ({this.state.volume}/{this.state.maxVolume})
                    <hr/>
                    {radiobuttons}
                    <table className="tunerdisplay">
                        <tr>
                            {channelColumns}
                        </tr>
                    </table>
                    <Slider label="Channel" name="playIndex" list={channelOptionsList} value={this.state.playIndex} max={this.state.numChannels - 1} onUpdate={this.onUpdate}/>
                </form>
        );
    }
});

var Slider = React.createClass({
    getInitialState: function() {
        //return {max: 0, name: "", value: 0, label: ""}
        return null;
    },
    onChangeHandler: function(evt) {
        this.props.onUpdate(this.props.name, event.target.value);
    },
    render: function() {
        return <div>
            <label>{this.props.label}<br/>
                <input type="range" min="0" max={this.props.max} name={this.props.name} value={this.props.value} onChange={this.onChangeHandler} list={this.props.name + "_list"}/>
                <datalist id={this.props.name + "_list"}>
                    {this.props.list}
                </datalist>
            </label>
        </div>;
    }
});

//React.render(<Timer />, mountNode);