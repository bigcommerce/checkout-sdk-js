"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var create_client_error_1 = require("./create-client-error");
describe('createClientError()', function () {
    it('returns error response object', function () {
        expect(create_client_error_1.default('unknown_error', 'An unknown error has occured'))
            .toEqual({
            body: {
                title: 'An unknown error has occured',
                type: 'unknown_error',
            },
        });
    });
});
//# sourceMappingURL=create-client-error.spec.js.map