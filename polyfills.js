// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

if (!Object.prototype.hasOwnProperty("iterateProperties")) {
    Object.defineProperty(Object.prototype, 'iterateProperties', {
        value: function (func) {
            var counter = 0;
            for (var p in this) {
                if (!this.hasOwnProperty(p)) {
                    continue;
                }
                func(p, counter);
                counter++;
            }

        }
    });
}

exports.jsenum = function() {
    var values = Array.prototype.slice.call(arguments, 0);
    var names = [];
    var arr = [];
    arr.toString = function() {
        if (arguments.length == 0) {
            return Array.prototype.toString.call(this);
        } else if (typeof arguments[0] == "symbol") {
            return names[arguments[0]];
        }
    };

    arr.fromString = function(str) {
        for (var i = 0; i < arr.length; i++) {
            if (this[i].toString() == str) {
                return this[i];
            }
        }
    };
    function symbolGenerator(str) {
        var symb = Symbol(str);
        symb.toReadable = function() {
            return str;
        };
        return symb;
    }
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        var symbol = symbolGenerator(v);
        arr[v.toUpperCase()] = symbol;
        names[symbol] = v;
        arr.push(symbol);

    }
    return arr;
};

exports.autoUpdateProperty = function(host, propName, fetcherFunc, interval, onChange) {
    setInterval(function() {
        var latestValue = fetcherFunc();
        var oldValue = host[propName];
        if (latestValue != oldValue) {
            host[propName] = latestValue;
            onChange(latestValue, oldValue);
        }
    }, interval);
}