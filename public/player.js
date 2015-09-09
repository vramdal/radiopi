window.addEventListener("load", function() {
    Array.prototype.forEach.call(document.querySelectorAll("input"), function (item) {
        item.save = function () {
            if (this.xhr) {
                this.xhrQueued = true;
                console.log("XHR queued", this.xhr);
                return;
            }
            this.xhr = new XMLHttpRequest();
            this.xhr.addEventListener("load", function (evt) {
                console.log("Saved: ", evt.srcElement.responseText);
                item.xhr = null;
                if (item.xhrQueued) {
                    delete item.xhrQueued;
                    item.save();
                }
            });
            this.xhr.open("post", this.form.action, true);
            var formData = new FormData();
            formData.append(this.name, this.value);
            this.xhr.send(formData);
        }
    });

    Array.prototype.forEach.call(document.querySelectorAll("input"), function (item) {
        item.addEventListener("change", item.save);
    });
});