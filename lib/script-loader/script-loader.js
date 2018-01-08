"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ScriptLoader = (function () {
    function ScriptLoader(document) {
        this._document = document;
    }
    ScriptLoader.prototype.loadScript = function (src) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var script = _this._document.createElement('script');
            script.onload = function (event) { return resolve(event); };
            script.onreadystatechange = function (event) { return resolve(event); };
            script.onerror = function (event) { return reject(event); };
            script.async = true;
            script.src = src;
            _this._document.body.appendChild(script);
        });
    };
    return ScriptLoader;
}());
exports.default = ScriptLoader;
//# sourceMappingURL=script-loader.js.map