"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var omit_deep_1 = require("./omit-deep");
function omitPrivate(object) {
    return omit_deep_1.default(object, function (value, key) {
        return ("" + key).indexOf('$$') === 0 || ("" + key).indexOf('_') === 0;
    });
}
exports.default = omitPrivate;
//# sourceMappingURL=omit-private.js.map