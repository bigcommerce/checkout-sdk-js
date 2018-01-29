import { isEqual, merge } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import Action from './action';
import deepFreeze from './deep-freeze';
import DispatchableDataStore, { DispatchOptions } from './dispatchable-data-store';
import noopActionTransformer from './noop-action-transformer';
import noopStateTransformer from './noop-state-transformer';
import ReadableDataStore, { Filter, Subscriber, Unsubscriber } from './readable-data-store';
import Reducer from './reducer';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/scan';

export default class DataStore<TState, TAction extends Action, TTransformedState = TState> implements ReadableDataStore<TTransformedState>, DispatchableDataStore<TTransformedState, TAction> {
    private _reducer: Reducer<Partial<TState>, TAction>;
    private _options: DataStoreOptions<TState, TAction, TTransformedState>;
    private _notification$: Subject<TTransformedState>;
    private _dispatchers: { [key: string]: Dispatcher<TAction> };
    private _dispatchQueue$: Subject<Dispatcher<TAction>>;
    private _state$: BehaviorSubject<TTransformedState>;
    private _errors: { [key: string]: Subject<Error> };

    constructor(
        reducer: Reducer<Partial<TState>, TAction>,
        initialState: Partial<TState> = {},
        options?: DataStoreOptions<TState, TAction, TTransformedState>
    ) {
        this._reducer = reducer;
        this._options = {
            shouldWarnMutation: true,
            stateTransformer: noopStateTransformer,
            actionTransformer: noopActionTransformer,
            ...options,
        };
        this._state$ = new BehaviorSubject(this._options.stateTransformer(initialState));
        this._notification$ = new Subject();
        this._dispatchers = {};
        this._dispatchQueue$ = new Subject();
        this._errors = {};

        this._dispatchQueue$
            .mergeMap((dispatcher$) => dispatcher$.concatMap((action$) => action$))
            .filter((action) => !!action.type)
            .scan(
                (states, action) => this._transformStates(states, action),
                { state: initialState, transformedState: this._state$.getValue() }
            )
            .map(({ transformedState }) => transformedState)
            .distinctUntilChanged(isEqual)
            .subscribe(this._state$);

        this.dispatch({ type: 'INIT' } as TAction);
    }

    dispatch<TDispatchAction extends TAction>(
        action: TDispatchAction | Observable<TDispatchAction>,
        options?: DispatchOptions
    ): Promise<TTransformedState> {
        if (action instanceof Observable) {
            return this._dispatchObservableAction(action, options);
        }

        return this._dispatchAction(action);
    }

    getState(): TTransformedState {
        return this._state$.getValue();
    }

    notifyState(): void {
        this._notification$.next(this.getState());
    }

    subscribe(
        subscriber: Subscriber<TTransformedState>,
        ...filters: Array<Filter<TTransformedState>>
    ): Unsubscriber {
        let state$: Observable<any> = this._state$;

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

    private _transformStates(
        states: StateTuple<Partial<TState>, TTransformedState>,
        action: TAction
    ): StateTuple<Partial<TState>, TTransformedState> {
        const { state, transformedState } = states;

        try {
            const newState = this._reducer(state, action);
            const transformedState = this._options.shouldWarnMutation === false ?
                this._options.stateTransformer(newState) :
                this._options.stateTransformer(deepFreeze(newState));

            return { state: newState, transformedState };
        } catch (error) {
            this._getDispatchError(action.meta && action.meta.queueId).next(error);

            return { state, transformedState };
        }
    }

    private _dispatchAction<TDispatchAction extends TAction>(
        action: TDispatchAction
    ): Promise<TTransformedState> {
        return this._dispatchObservableAction(
            action.error ?
                Observable.throw(action) :
                Observable.of(action)
        );
    }

    private _dispatchObservableAction<TDispatchAction extends TAction>(
        action$: Observable<TDispatchAction>,
        options: DispatchOptions = {}
    ): Promise<TTransformedState> {
        return new Promise((resolve, reject) => {
            const error$ = this._getDispatchError(options.queueId);
            const transformedAction$ = this._options.actionTransformer(
                action$.map((action) =>
                    options.queueId ? merge({}, action, { meta: { queueId: options.queueId } }) : action
                )
            );

            this._getDispatcher(options.queueId).next(
                transformedAction$
                    .map((action, index) => {
                        if (index === 0) {
                            error$.first().subscribe(reject);
                        }

                        if (action.error) {
                            reject(action.payload);
                        }

                        return action;
                    })
                    .catch((action) => {
                        reject(action instanceof Error ? action : action.payload);

                        return Observable.of(action);
                    })
                    .do({
                        complete: () => {
                            resolve(this.getState());
                        },
                    })
            );
        });
    }

    private _getDispatcher(queueId: string = 'default'): Dispatcher<TAction> {
        if (!this._dispatchers[queueId]) {
            this._dispatchers[queueId] = new Subject();

            this._dispatchQueue$.next(this._dispatchers[queueId]);
        }

        return this._dispatchers[queueId];
    }

    private _getDispatchError(queueId: string = 'default'): Subject<Error> {
        if (!this._errors[queueId]) {
            this._errors[queueId] = new Subject();
        }

        return this._errors[queueId];
    }
}

export interface DataStoreOptions<TState, TAction, TTransformedState> {
    shouldWarnMutation?: boolean;
    actionTransformer?: (action: Observable<TAction>) => Observable<TAction>;
    stateTransformer?: (state: Partial<TState>) => TTransformedState;
}

interface StateTuple<TState, TTransformedState> {
    state: TState;
    transformedState: TTransformedState;
}

type Dispatcher<TAction> = Subject<Observable<TAction>>;
