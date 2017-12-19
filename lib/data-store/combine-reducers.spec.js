"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var combine_reducers_1 = require("./combine-reducers");
describe('combineReducers()', function () {
    it('combines multiple reducers into one', function () {
        var fooReducer = jest.fn(function () { return 'foo'; });
        var barReducer = jest.fn(function () { return 'bar'; });
        var state = { foo: 'FOO', bar: 'BAR' };
        var action = { type: 'ACTION' };
        var reducer = combine_reducers_1.default({
            foo: fooReducer,
            bar: barReducer,
        });
        expect(reducer(state, action)).toEqual({
            foo: 'foo',
            bar: 'bar',
        });
        expect(fooReducer).toHaveBeenCalledWith(state.foo, action);
        expect(barReducer).toHaveBeenCalledWith(state.bar, action);
    });
});
//# sourceMappingURL=combine-reducers.spec.js.map