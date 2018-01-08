"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createClientError(type, title) {
    return {
        body: {
            type: type,
            title: title,
        },
    };
}
exports.default = createClientError;
//# sourceMappingURL=create-client-error.js.map