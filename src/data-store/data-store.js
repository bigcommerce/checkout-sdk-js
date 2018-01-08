import { isEqual } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import deepFreeze from './deep-freeze';
import noopStateTransformer from './noop-state-transformer';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/scan';

/**
 * @implements {ReadableDataStore}
 * @implements {DispatchableDataStore}
 */
export default class DataStore {
    /**
     * @param {Reducer} reducer
     * @param {State} [initialState={}]
     * @param {function(state: State): TransformedState} [stateTransformer=noopStateTransformer]
     * @param {Object} [options={}]
     * @param {boolean} [options.shouldWarnMutation=true]
     * @return {void}
     * @template State, TransformedState
     */
    constructor(reducer, initialState = {}, stateTransformer = noopStateTransformer, options = {}) {
        this._options = { shouldWarnMutation: true, ...options };
        this._state$ = new BehaviorSubject(initialState);
        this._notification$ = new Subject();
        this._dispatchers = {};
        this._dispatchQueue$ = new Subject()
            .mergeMap((dispatcher$) => dispatcher$.concatMap((action$) => action$))
            .filter((action) => action.type);

        this._dispatchQueue$
            .scan((state, action) => reducer(state, action), initialState)
            .distinctUntilChanged(isEqual)
            .map((state) => this._options.shouldWarnMutation === false ? state : deepFreeze(state))
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
    dispatch(action, options) {
        if (action instanceof Observable) {
            return this._dispatchObservableAction(action, options);
        }

        this._dispatchAction(action);

        return action.error ? Promise.reject(this.getState()) : Promise.resolve(this.getState());
    }

    /**
     * @return {TransformedState}
     */
    getState() {
        return this._state$.getValue();
    }

    /**
     * @return {void}
     */
    notifyState() {
        this._notification$.next(this.getState());
    }

    /**
     * @param {function(state: TransformedState): void} subscriber
     * @param {...function(state: TransformedState): any} [filters]
     * @return {function(): void}
     */
    subscribe(subscriber, ...filters) {
        let state$ = this._state$;

        if (filters.length > 0) {
            state$ = state$.distinctUntilChanged((stateA, stateB) =>
                filters.every((filter) => isEqual(filter(stateA), filter(stateB)))
            );
        }

        const subscriptions = [
            state$.subscribe(subscriber),
            this._notification$.subscribe(subscriber),
        ];

        return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    /**
     * @private
     * @param {Action<T>} action
     * @return {Promise<TransformedState>}
     * @template T
     */
    _dispatchAction(action) {
        this._getDispatcher().next(Observable.of(action));
    }

    /**
     * @private
     * @param {Observable<Action<T>>} action$
     * @param {Object} [options]
     * @return {Promise<TransformedState>}
     * @template T
     */
    _dispatchObservableAction(action$, options = {}) {
        return new Promise((resolve, reject) => {
            let action;
            let error;

            this._getDispatcher(options.queueId).next(
                action$
                    .catch((value) => {
                        error = value;

                        return Observable.of(value);
                    })
                    .do({
                        next: (value) => { action = value; },
                        complete: () => error || action.error ?
                            reject(this.getState()) :
                            resolve(this.getState()),
                    })
            );
        });
    }

    /**
     * @private
     * @param {string} [queueId='default']
     * @return {Subject<Action<T>>}
     */
    _getDispatcher(queueId = 'default') {
        if (!this._dispatchers[queueId]) {
            this._dispatchers[queueId] = new Subject();

            this._dispatchQueue$.next(this._dispatchers[queueId]);
        }

        return this._dispatchers[queueId];
    }
}
