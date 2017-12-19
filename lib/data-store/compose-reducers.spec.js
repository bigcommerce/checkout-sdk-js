"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compose_reducers_1 = require("./compose-reducers");
describe('composeReducers()', function () {
    var fooReducer = function (state, action) {
        switch (action.type) {
            case 'FOO':
                return 'foo';
            case 'APPEND':
                return state + "foo";
            default:
                return state;
        }
    };
    var barReducer = function (state, action) {
        switch (action.type) {
            case 'BAR':
                return 'bar';
            case 'APPEND':
                return state + "bar";
            default:
                return state;
        }
    };
    it('composes multiple reducers', function () {
        var reducer = compose_reducers_1.default(barReducer, fooReducer);
        var initialState = '';
        expect(reducer(initialState, { type: 'FOO' })).toEqual('foo');
        expect(reducer(initialState, { type: 'BAR' })).toEqual('bar');
        expect(reducer(initialState, { type: 'HELLO' })).toEqual('');
    });
    it('composes reducers from the right', function () {
        var reducer = compose_reducers_1.default(barReducer, fooReducer);
        var initialState = '';
        expect(reducer(initialState, { type: 'APPEND' })).toEqual('foobar');
    });
});
//# sourceMappingURL=compose-reducers.spec.js.map