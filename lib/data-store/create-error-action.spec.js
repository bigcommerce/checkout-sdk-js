"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var create_error_action_1 = require("./create-error-action");
describe('createErrorAction()', function () {
    it('creates a standard action object', function () {
        var payload = { message: 'Foobar' };
        var meta = { status: 'not found' };
        var action = create_error_action_1.default('ACTION', payload, meta);
        expect(action).toEqual({ type: 'ACTION', error: true, payload: payload, meta: meta });
    });
    it('creates an empty action object', function () {
        var action = create_error_action_1.default('ACTION');
        expect(action).toEqual({ type: 'ACTION', error: true });
    });
    it('throws an error if `type` is not provided', function () {
        expect(function () { return create_error_action_1.default(); }).toThrow();
    });
});
//# sourceMappingURL=create-error-action.spec.js.map