"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var data_store_1 = require("./data-store");
describe('DataStore', function () {
    describe('#dispatch()', function () {
        it('dispatches actions to reducers', function () {
            var state = {};
            var reducer = jest.fn(function () { return state; });
            var store = new data_store_1.default(reducer, state);
            var action = { type: 'ACTION' };
            store.dispatch(action);
            expect(reducer).toHaveBeenCalledWith(state, action);
        });
        it('subscribes to observables and dispatches actions to reducers', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var state, reducer, store, action;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = {};
                        reducer = jest.fn(function () { return state; });
                        store = new data_store_1.default(reducer, state);
                        action = rxjs_1.Observable.from([
                            { type: 'ACTION' },
                            { type: 'ACTION_2' },
                        ]);
                        return [4 /*yield*/, store.dispatch(action)];
                    case 1:
                        _a.sent();
                        expect(reducer).toHaveBeenCalledWith(state, { type: 'ACTION' });
                        expect(reducer).toHaveBeenCalledWith(state, { type: 'ACTION_2' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches observable actions and resolves promise with current state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var store, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        store = new data_store_1.default(function (state, action) {
                            if (action.type === 'APPEND') {
                                return tslib_1.__assign({}, state, { message: state.message + action.payload });
                            }
                            return state;
                        }, { message: '' });
                        _a = expect;
                        return [4 /*yield*/, store.dispatch(rxjs_1.Observable.of({ type: 'APPEND', payload: 'foo' }, { type: 'APPEND', payload: 'bar' }, { type: 'APPEND', payload: '!!!' }))];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).toEqual({ message: 'foobar!!!' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches observable actions and rejects promise with current state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var store, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new data_store_1.default(function (state) { return state; }, { message: 'foobar' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, store.dispatch(rxjs_1.Observable.throw({ type: 'APPEND_ERROR' }))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        expect(error_1).toEqual({ message: 'foobar' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        it('dispatches observable actions sequentially', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var reducer, store;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reducer = jest.fn(function (state) { return state; });
                        store = new data_store_1.default(reducer);
                        reducer.mockClear();
                        return [4 /*yield*/, Promise.all([
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION' }).delay(10)),
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION_2' })),
                                store.dispatch(rxjs_1.Observable.throw({ type: 'ACTION_3', error: true })).catch(function () { }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION_4' })),
                            ])];
                    case 1:
                        _a.sent();
                        expect(reducer.mock.calls).toEqual([
                            [expect.anything(), { type: 'ACTION' }],
                            [expect.anything(), { type: 'ACTION_2' }],
                            [expect.anything(), { type: 'ACTION_3', error: true }],
                            [expect.anything(), { type: 'ACTION_4' }],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches observable actions sequentially by tags', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var reducer, store;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reducer = jest.fn(function (state) { return state; });
                        store = new data_store_1.default(reducer);
                        reducer.mockClear();
                        return [4 /*yield*/, Promise.all([
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION' }).delay(10)),
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION_2' })),
                                store.dispatch(rxjs_1.Observable.throw({ type: 'ACTION_3', error: true })).catch(function () { }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'FOOBAR_ACTION' }).delay(5), { queueId: 'foobar' }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'FOOBAR_ACTION_2' }), { queueId: 'foobar' }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION_4' })),
                            ])];
                    case 1:
                        _a.sent();
                        expect(reducer.mock.calls).toEqual([
                            [expect.anything(), { type: 'FOOBAR_ACTION' }],
                            [expect.anything(), { type: 'FOOBAR_ACTION_2' }],
                            [expect.anything(), { type: 'ACTION' }],
                            [expect.anything(), { type: 'ACTION_2' }],
                            [expect.anything(), { type: 'ACTION_3', error: true }],
                            [expect.anything(), { type: 'ACTION_4' }],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('resolves promises sequentially', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var store, callback;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new data_store_1.default(function (state) { return state; });
                        callback = jest.fn();
                        return [4 /*yield*/, Promise.all([
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION' }).delay(10)).then(function () { return callback('ACTION'); }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION_2' })).then(function () { return callback('ACTION_2'); }),
                                store.dispatch(rxjs_1.Observable.throw({ type: 'ACTION_3', error: true })).catch(function () { return callback('ACTION_3'); }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'FOOBAR_ACTION' }).delay(5), { queueId: 'foobar' }).then(function () { return callback('FOOBAR_ACTION'); }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'FOOBAR_ACTION_2' }), { queueId: 'foobar' }).then(function () { return callback('FOOBAR_ACTION_2'); }),
                                store.dispatch(rxjs_1.Observable.of({ type: 'ACTION_4' })).then(function () { return callback('ACTION_4'); }),
                            ])];
                    case 1:
                        _a.sent();
                        expect(callback.mock.calls).toEqual([
                            ['FOOBAR_ACTION'],
                            ['FOOBAR_ACTION_2'],
                            ['ACTION'],
                            ['ACTION_2'],
                            ['ACTION_3'],
                            ['ACTION_4'],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('ignores actions that do not have `type` property', function () {
            var reducer = jest.fn(function (state) { return state; });
            var store = new data_store_1.default(reducer);
            reducer.mockClear();
            store.dispatch({});
            store.dispatch({ payload: 'foobar' });
            expect(reducer).not.toHaveBeenCalled();
        });
        it('ignores observable actions that do not emit actions with `type` property', function () {
            var reducer = jest.fn(function (state) { return state; });
            var store = new data_store_1.default(reducer);
            reducer.mockClear();
            store.dispatch(rxjs_1.Observable.of({}, { payload: 'foobar' }));
            expect(reducer).not.toHaveBeenCalled();
        });
    });
    describe('#subscribe()', function () {
        it('notifies subscribers when dispatching actions', function () {
            var initialState = { foobar: 'foobar' };
            var store = new data_store_1.default(function (state) { return state; }, initialState);
            var subscriber = jest.fn();
            store.subscribe(subscriber);
            store.dispatch({ type: 'ACTION' });
            expect(subscriber).toHaveBeenCalledWith(initialState);
        });
        it('does not notify subscribers if the current state has not changed', function () {
            var initialState = { foobar: 'foobar' };
            var store = new data_store_1.default(function (state, action) { return action.type === 'CAPITALIZE' ? { foobar: 'FOOBAR' } : state; }, initialState);
            var subscriber = jest.fn();
            store.subscribe(subscriber);
            subscriber.mockReset();
            store.dispatch({ type: 'CAPITALIZE' });
            store.dispatch({ type: 'ACTION' });
            expect(subscriber.mock.calls.length).toEqual(1);
        });
        it('notifies subscribers with the tranformed state', function () {
            var initialState = { foobar: 'foobar' };
            var store = new data_store_1.default(function (state, action) { return action.type === 'CAPITALIZE' ? { foobar: 'FOOBAR' } : state; }, initialState, function (state) { return (tslib_1.__assign({}, state, { transformed: true })); });
            var subscriber = jest.fn();
            store.subscribe(subscriber);
            store.dispatch({ type: 'CAPITALIZE' });
            expect(subscriber).toHaveBeenCalledWith({
                foobar: 'FOOBAR',
                transformed: true,
            });
        });
        it('notifies all subscribers with the initial state', function () {
            var store = new data_store_1.default(function (state) { return state; });
            var subscriber = jest.fn();
            store.subscribe(subscriber);
            expect(subscriber).toHaveBeenCalledWith(store.getState());
        });
        it('only notifies subscribers when `filter` condition is met', function () {
            var store = new data_store_1.default(function (state, action) {
                switch (action.type) {
                    case 'FOO':
                        return tslib_1.__assign({}, state, { foo: 'foo' });
                    case 'FOO_CAPITALIZED':
                        return tslib_1.__assign({}, state, { foo: 'FOO' });
                    case 'BAR':
                        return tslib_1.__assign({}, state, { bar: 'bar' });
                    default:
                        return state;
                }
            });
            var subscriber = jest.fn();
            store.subscribe(subscriber, function (state) { return state.foo; });
            subscriber.mockReset();
            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'BAR' });
            store.dispatch({ type: 'FOO_CAPITALIZED' });
            store.dispatch({ type: 'FOO' });
            expect(subscriber).toHaveBeenCalledTimes(3);
        });
        it('only notifies subscribers when multiple `filter` conditions are met', function () {
            var store = new data_store_1.default(function (state, action) {
                switch (action.type) {
                    case 'FOO':
                        return tslib_1.__assign({}, state, { foo: 'foo' });
                    case 'BAR':
                        return tslib_1.__assign({}, state, { bar: 'bar' });
                    case 'FOOBAR':
                        return tslib_1.__assign({}, state, { foobar: 'foobar' });
                    case 'FOO_AND_BAR':
                        return tslib_1.__assign({}, state, { foo: 'FOO', bar: 'BAR' });
                    default:
                        return state;
                }
            });
            var subscriber = jest.fn();
            store.subscribe(subscriber, function (state) { return state.foo; }, function (state) { return state.bar; });
            subscriber.mockReset();
            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'BAR' });
            store.dispatch({ type: 'FOOBAR' });
            store.dispatch({ type: 'FOOBAR' });
            store.dispatch({ type: 'FOO_AND_BAR' });
            expect(subscriber).toHaveBeenCalledTimes(3);
        });
        it('notifies subscribers sequentially', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var store, subscriber;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new data_store_1.default(function (state, action) {
                            if (action.type === 'APPEND') {
                                return tslib_1.__assign({}, state, { message: "" + state.message + action.payload });
                            }
                            return state;
                        }, { message: '' });
                        subscriber = jest.fn();
                        store.subscribe(subscriber);
                        return [4 /*yield*/, Promise.all([
                                store.dispatch(rxjs_1.Observable.from([{ type: 'APPEND', payload: 'foo' }, { type: 'APPEND', payload: 'bar' }]).delay(10)),
                                store.dispatch(rxjs_1.Observable.from([{ type: 'APPEND', payload: '!!!' }]).delay(1)),
                            ])];
                    case 1:
                        _a.sent();
                        expect(subscriber.mock.calls).toEqual([
                            [{ message: '' }],
                            [{ message: 'foo' }],
                            [{ message: 'foobar' }],
                            [{ message: 'foobar!!!' }],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('notifies subscribers sequentially by tags', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var store, subscriber;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new data_store_1.default(function (state, action) {
                            if (action.type === 'APPEND') {
                                return tslib_1.__assign({}, state, { message: "" + state.message + action.payload });
                            }
                            return state;
                        }, { message: '' });
                        subscriber = jest.fn();
                        store.subscribe(subscriber);
                        return [4 /*yield*/, Promise.all([
                                store.dispatch(rxjs_1.Observable.from([{ type: 'APPEND', payload: 'foo' }, { type: 'APPEND', payload: 'bar' }]).delay(10)),
                                store.dispatch(rxjs_1.Observable.from([{ type: 'APPEND', payload: '!!!' }]).delay(5)),
                                store.dispatch(rxjs_1.Observable.from([{ type: 'APPEND', payload: 'Hey' }]).delay(1), { queueId: 'greeting' }),
                                store.dispatch(rxjs_1.Observable.from([{ type: 'APPEND', payload: ', ' }]), { queueId: 'greeting' }),
                            ])];
                    case 1:
                        _a.sent();
                        expect(subscriber.mock.calls).toEqual([
                            [{ message: '' }],
                            [{ message: 'Hey' }],
                            [{ message: 'Hey, ' }],
                            [{ message: 'Hey, foo' }],
                            [{ message: 'Hey, foobar' }],
                            [{ message: 'Hey, foobar!!!' }],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('calls the reducer with the initial action', function () {
            var initialState = { foobar: 'foobar' };
            var reducer = jest.fn(function (state) { return state; });
            var store = new data_store_1.default(reducer, initialState);
            store.subscribe(function () { });
            expect(reducer).toHaveBeenCalledWith(initialState, { type: 'INIT' });
        });
        it('returns an unsubscribe function', function () {
            var initialState = { foobar: 'foobar' };
            var store = new data_store_1.default(function (state) { return state; }, initialState);
            var subscriber = jest.fn();
            var unsubscribe = store.subscribe(subscriber);
            unsubscribe();
            subscriber.mockReset();
            store.dispatch({ type: 'ACTION' });
            expect(subscriber).not.toHaveBeenCalledWith(initialState);
        });
    });
    describe('#notifyState()', function () {
        it('notifies subscribers of its current state', function () {
            var store = new data_store_1.default(function (state) { return state; }, { foobar: 'foobar' });
            var subscriber = jest.fn();
            store.subscribe(subscriber);
            store.notifyState();
            expect(subscriber).toHaveBeenLastCalledWith({ foobar: 'foobar' });
            expect(subscriber).toHaveBeenCalledTimes(2);
        });
        it('notifies subscribers with filters of its current state', function () {
            var store = new data_store_1.default(function (state) { return state; }, { foobar: 'foobar' });
            var subscriber = jest.fn();
            store.subscribe(subscriber, function (state) { return state.foobar; });
            store.notifyState();
            expect(subscriber).toHaveBeenLastCalledWith({ foobar: 'foobar' });
            expect(subscriber).toHaveBeenCalledTimes(2);
        });
    });
    describe('#getState()', function () {
        it('returns the current state', function () {
            var initialState = { foobar: 'foobar' };
            var store = new data_store_1.default(function (state, action) {
                if (action.type === 'INCREMENT') {
                    return { foobar: 'foobar x2' };
                }
                return state;
            }, initialState);
            expect(store.getState()).toEqual(initialState);
            store.dispatch({ type: 'INCREMENT' });
            expect(store.getState()).toEqual({ foobar: 'foobar x2' });
        });
        it('applies the state transformer before returning the current state', function () {
            var store = new data_store_1.default(function (state, action) { return action.type === 'INCREMENT' ? { foobar: 'foobar x2' } : state; }, { foobar: 'foobar' }, function (state) { return (tslib_1.__assign({}, state, { transformed: true })); });
            expect(store.getState()).toEqual({
                foobar: 'foobar',
                transformed: true,
            });
            store.dispatch({ type: 'INCREMENT' });
            expect(store.getState()).toEqual({
                foobar: 'foobar x2',
                transformed: true,
            });
        });
    });
});
//# sourceMappingURL=data-store.spec.js.map