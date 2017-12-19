"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var script_loader_1 = require("./script-loader");
/**
 * @return {ScriptLoader}
 */
function createScriptLoader() {
    return new script_loader_1.default(document);
}
exports.createScriptLoader = createScriptLoader;
//# sourceMappingURL=index.js.map