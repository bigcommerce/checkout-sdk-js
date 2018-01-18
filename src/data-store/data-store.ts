import { isEqual } from 'lodash';
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
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/scan';

export default class DataStore<TState, TAction extends Action, TTransformedState = TState> implements ReadableDataStore<TTransformedState>, DispatchableDataStore<TTransformedState, TAction> {
    private _options: DataStoreOptions<TState, TAction, TTransformedState>;
    private _notification$: Subject<TTransformedState>;
    private _dispatchers: { [key: string]: Dispatcher<TAction> };
    private _dispatchQueue$: Subject<Dispatcher<TAction>>;
    private _state$: BehaviorSubject<TTransformedState>;

    constructor(
        reducer: Reducer<Partial<TState>, TAction>,
        initialState: Partial<TState> = {},
        options?: DataStoreOptions<TState, TAction, TTransformedState>
    ) {
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

        this._dispatchQueue$
            .mergeMap((dispatcher$) => dispatcher$.concatMap((action$) => action$))
            .filter((action) => !!action.type)
            .scan((state, action) => reducer(state, action), initialState)
            .distinctUntilChanged(isEqual)
            .map((state) => this._options.shouldWarnMutation === false ? state : deepFreeze(state))
            .map((state) => this._options.stateTransformer(state))
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
            let action: TDispatchAction;
            let error: any;

            this._getDispatcher(options.queueId).next(
                this._options.actionTransformer(action$)
                    .catch((value) => {
                        error = value;

                        return Observable.of(value);
                    })
                    .do({
                        next: (value) => {
                            action = value;
                        },
                        complete: () => {
                            if (error) {
                                reject(error instanceof Error ? error : error.payload);
                            } else if (action.error) {
                                reject(action.payload);
                            } else {
                                resolve(this.getState());
                            }
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
}

export interface DataStoreOptions<TState, TAction, TTransformedState> {
    shouldWarnMutation?: boolean;
    actionTransformer?: (action: Observable<TAction>) => Observable<TAction>;
    stateTransformer?: (state: Partial<TState>) => TTransformedState;
}

type Dispatcher<TAction> = Subject<Observable<TAction>>;
