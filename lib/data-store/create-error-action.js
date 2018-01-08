"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var create_action_1 = require("./create-action");
function createErrorAction(type, payload, meta) {
    return tslib_1.__assign({}, create_action_1.default(type, payload, meta), { error: true });
}
exports.default = createErrorAction;
//# sourceMappingURL=create-error-action.js.map