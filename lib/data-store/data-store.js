"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
var deep_freeze_1 = require("./deep-freeze");
var noop_action_transformer_1 = require("./noop-action-transformer");
var noop_state_transformer_1 = require("./noop-state-transformer");
require("rxjs/add/observable/merge");
require("rxjs/add/observable/of");
require("rxjs/add/observable/throw");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/concatMap");
require("rxjs/add/operator/distinctUntilChanged");
require("rxjs/add/operator/do");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/first");
require("rxjs/add/operator/map");
require("rxjs/add/operator/mergeMap");
require("rxjs/add/operator/scan");
var DataStore = (function () {
    function DataStore(reducer, initialState, options) {
        if (initialState === void 0) { initialState = {}; }
        var _this = this;
        this._reducer = reducer;
        this._options = tslib_1.__assign({ shouldWarnMutation: true, stateTransformer: noop_state_transformer_1.default, actionTransformer: noop_action_transformer_1.default }, options);
        this._state$ = new BehaviorSubject_1.BehaviorSubject(this._options.stateTransformer(initialState));
        this._notification$ = new Subject_1.Subject();
        this._dispatchers = {};
        this._dispatchQueue$ = new Subject_1.Subject();
        this._errors = {};
        this._dispatchQueue$
            .mergeMap(function (dispatcher$) { return dispatcher$.concatMap(function (action$) { return action$; }); })
            .filter(function (action) { return !!action.type; })
            .scan(function (states, action) { return _this._transformStates(states, action); }, { state: initialState, transformedState: this._state$.getValue() })
            .map(function (_a) {
            var transformedState = _a.transformedState;
            return transformedState;
        })
            .distinctUntilChanged(lodash_1.isEqual)
            .subscribe(this._state$);
        this.dispatch({ type: 'INIT' });
    }
    DataStore.prototype.dispatch = function (action, options) {
        if (action instanceof Observable_1.Observable) {
            return this._dispatchObservableAction(action, options);
        }
        return this._dispatchAction(action);
    };
    DataStore.prototype.getState = function () {
        return this._state$.getValue();
    };
    DataStore.prototype.notifyState = function () {
        this._notification$.next(this.getState());
    };
    DataStore.prototype.subscribe = function (subscriber) {
        var filters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            filters[_i - 1] = arguments[_i];
        }
        var state$ = this._state$;
        if (filters.length > 0) {
            state$ = state$.distinctUntilChanged(function (stateA, stateB) {
                return filters.every(function (filter) { return lodash_1.isEqual(filter(stateA), filter(stateB)); });
            });
        }
        var subscriptions = [
            state$.subscribe(subscriber),
            this._notification$.subscribe(subscriber),
        ];
        return function () { return subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); }); };
    };
    DataStore.prototype._transformStates = function (states, action) {
        var state = states.state, transformedState = states.transformedState;
        try {
            var newState = this._reducer(state, action);
            var transformedState_1 = this._options.shouldWarnMutation === false ?
                this._options.stateTransformer(newState) :
                this._options.stateTransformer(deep_freeze_1.default(newState));
            return { state: newState, transformedState: transformedState_1 };
        }
        catch (error) {
            this._getDispatchError(action.meta && action.meta.queueId).next(error);
            return { state: state, transformedState: transformedState };
        }
    };
    DataStore.prototype._dispatchAction = function (action) {
        return this._dispatchObservableAction(action.error ?
            Observable_1.Observable.throw(action) :
            Observable_1.Observable.of(action));
    };
    DataStore.prototype._dispatchObservableAction = function (action$, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var error$ = _this._getDispatchError(options.queueId);
            var transformedAction$ = _this._options.actionTransformer(action$.map(function (action) {
                return options.queueId ? lodash_1.merge({}, action, { meta: { queueId: options.queueId } }) : action;
            }));
            _this._getDispatcher(options.queueId).next(transformedAction$
                .map(function (action, index) {
                if (index === 0) {
                    error$.first().subscribe(reject);
                }
                if (action.error) {
                    reject(action.payload);
                }
                return action;
            })
                .catch(function (action) {
                reject(action instanceof Error ? action : action.payload);
                return Observable_1.Observable.of(action);
            })
                .do({
                complete: function () {
                    resolve(_this.getState());
                },
            }));
        });
    };
    DataStore.prototype._getDispatcher = function (queueId) {
        if (queueId === void 0) { queueId = 'default'; }
        if (!this._dispatchers[queueId]) {
            this._dispatchers[queueId] = new Subject_1.Subject();
            this._dispatchQueue$.next(this._dispatchers[queueId]);
        }
        return this._dispatchers[queueId];
    };
    DataStore.prototype._getDispatchError = function (queueId) {
        if (queueId === void 0) { queueId = 'default'; }
        if (!this._errors[queueId]) {
            this._errors[queueId] = new Subject_1.Subject();
        }
        return this._errors[queueId];
    };
    return DataStore;
}());
exports.default = DataStore;
//# sourceMappingURL=data-store.js.map