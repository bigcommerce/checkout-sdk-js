import { Action, DataStore, Filter, ReadableDataStore, Subscriber, SubscribeOptions, Unsubscriber } from '@bigcommerce/data-store';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { isEqual } from '../utility';

export default class DataStoreProjection<TState, TTransformedState = TState> implements ReadableDataStore<TTransformedState> {
    private _state$: BehaviorSubject<TTransformedState>;

    constructor(
        private _store: DataStore<any, Action, TState>,
        private _transformState: (state: TState) => TTransformedState
    ) {
        this._state$ = new BehaviorSubject(this._transformState(this._store.getState()));

        this._store.subscribe(state => {
            this._state$.next(this._transformState(state));
        });
    }

    getState(): TTransformedState {
        return this._state$.getValue();
    }

    subscribe(subscriber: Subscriber<TTransformedState>, ...filters: Array<Filter<TTransformedState>>): Unsubscriber;
    subscribe(subscriber: Subscriber<TTransformedState>, options: SubscribeOptions<TTransformedState>): Unsubscriber;
    subscribe(subscriber: Subscriber<TTransformedState>, ...args: any[]): Unsubscriber {
        const options: SubscribeOptions<TTransformedState> = typeof args[0] === 'object' ? args[0] : undefined;
        const filters: Array<Filter<TTransformedState>> = options ? (options.filters || []) : args;
        const subscription = this._state$
            .pipe(distinctUntilChanged((stateA, stateB) =>
                filters.length > 0 ?
                    filters.every(filterFn => isEqual(filterFn(stateA), filterFn(stateB))) :
                    false
            ))
            .subscribe(subscriber);

        return subscription.unsubscribe;
    }
}
