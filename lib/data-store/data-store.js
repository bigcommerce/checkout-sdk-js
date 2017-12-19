"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
var noop_state_transformer_1 = require("./noop-state-transformer");
require("rxjs/add/observable/merge");
require("rxjs/add/observable/of");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/concatMap");
require("rxjs/add/operator/distinctUntilChanged");
require("rxjs/add/operator/do");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/map");
require("rxjs/add/operator/mergeMap");
require("rxjs/add/operator/scan");
/**
 * @implements {ReadableDataStore}
 * @implements {DispatchableDataStore}
 */
var DataStore = /** @class */ (function () {
    /**
     * @param {Reducer} reducer
     * @param {State} [initialState={}]
     * @param {function(state: State): TransformedState} [stateTransformer=noopStateTransformer]
     * @return {void}
     * @template State, TransformedState
     */
    function DataStore(reducer, initialState, stateTransformer) {
        if (initialState === void 0) { initialState = {}; }
        if (stateTransformer === void 0) { stateTransformer = noop_state_transformer_1.default; }
        this._state$ = new BehaviorSubject_1.BehaviorSubject(initialState);
        this._notification$ = new Subject_1.Subject();
        this._dispatchers = {};
        this._dispatchQueue$ = new Subject_1.Subject()
            .mergeMap(function (dispatcher$) { return dispatcher$.concatMap(function (action$) { return action$; }); })
            .filter(function (action) { return action.type; });
        this._dispatchQueue$
            .scan(function (state, action) { return reducer(state, action); }, initialState)
            .distinctUntilChanged()
            .map(stateTransformer)
            .subscribe(this._state$);
        this.dispatch({ type: 'INIT' });
    }
    /**
     * @param {Action<T>} action
     * @param {Object} [options]
     * @return {Promise<TransformedState>}
     * @template T
     */
    DataStore.prototype.dispatch = function (action, options) {
        if (action instanceof Observable_1.Observable) {
            return this._dispatchObservableAction(action, options);
        }
        this._dispatchAction(action);
        return action.error ? Promise.reject(this.getState()) : Promise.resolve(this.getState());
    };
    /**
     * @return {TransformedState}
     */
    DataStore.prototype.getState = function () {
        return this._state$.getValue();
    };
    /**
     * @return {void}
     */
    DataStore.prototype.notifyState = function () {
        this._notification$.next(this.getState());
    };
    /**
     * @param {function(state: TransformedState): void} subscriber
     * @param {...function(state: TransformedState): any} [filters]
     * @return {function(): void}
     */
    DataStore.prototype.subscribe = function (subscriber) {
        var filters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            filters[_i - 1] = arguments[_i];
        }
        var state$ = this._state$;
        if (filters.length > 0) {
            state$ = state$.distinctUntilChanged(function (stateA, stateB) {
                return filters.every(function (filter) { return filter(stateA) === filter(stateB); });
            });
        }
        var subscriptions = [
            state$.subscribe(subscriber),
            this._notification$.subscribe(subscriber),
        ];
        return function () { return subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); }); };
    };
    /**
     * @private
     * @param {Action<T>} action
     * @return {Promise<TransformedState>}
     * @template T
     */
    DataStore.prototype._dispatchAction = function (action) {
        this._getDispatcher().next(Observable_1.Observable.of(action));
    };
    /**
     * @private
     * @param {Observable<Action<T>>} action$
     * @param {Object} [options]
     * @return {Promise<TransformedState>}
     * @template T
     */
    DataStore.prototype._dispatchObservableAction = function (action$, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var action;
            var error;
            _this._getDispatcher(options.queueId).next(action$
                .catch(function (value) {
                error = value;
                return Observable_1.Observable.of(value);
            })
                .do({
                next: function (value) { action = value; },
                complete: function () { return error || action.error ?
                    reject(_this.getState()) :
                    resolve(_this.getState()); },
            }));
        });
    };
    /**
     * @private
     * @param {string} [queueId='default']
     * @return {Subject<Action<T>>}
     */
    DataStore.prototype._getDispatcher = function (queueId) {
        if (queueId === void 0) { queueId = 'default'; }
        if (!this._dispatchers[queueId]) {
            this._dispatchers[queueId] = new Subject_1.Subject();
            this._dispatchQueue$.next(this._dispatchers[queueId]);
        }
        return this._dispatchers[queueId];
    };
    return DataStore;
}());
exports.default = DataStore;
//# sourceMappingURL=data-store.js.map