"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var script_loader_1 = require("@bigcommerce/script-loader");
var afterpay_script_loader_1 = require("./afterpay-script-loader");
exports.default = afterpay_script_loader_1.default;
function createAfterpayScriptLoader() {
    var scriptLoader = script_loader_1.createScriptLoader();
    return new afterpay_script_loader_1.default(scriptLoader);
}
exports.createAfterpayScriptLoader = createAfterpayScriptLoader;
//# sourceMappingURL=index.js.map