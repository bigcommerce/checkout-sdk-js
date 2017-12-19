"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var create_action_1 = require("./create-action");
describe('createAction()', function () {
    it('creates a standard action object', function () {
        var payload = { message: 'Foobar' };
        var meta = { status: 'ok' };
        var action = create_action_1.default('ACTION', payload, meta);
        expect(action).toEqual({ type: 'ACTION', payload: payload, meta: meta });
    });
    it('creates an empty action object', function () {
        var action = create_action_1.default('ACTION');
        expect(action).toEqual({ type: 'ACTION' });
    });
    it('throws an error if `type` is not provided', function () {
        expect(function () { return create_action_1.default(); }).toThrow();
    });
});
//# sourceMappingURL=create-action.spec.js.map