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
