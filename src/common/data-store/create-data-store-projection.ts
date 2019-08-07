import { createAction, createDataStore, Action, DataStore, ReadableDataStore } from '@bigcommerce/data-store';

enum ProjectionActionType {
    Synchronize = 'SYNCHRONIZE',
}

interface SynchronizeAction<TState> extends Action<TState> {
    type: ProjectionActionType.Synchronize;
    payload: TState;
}

export interface DataStoreProjection<TTransformedState> extends ReadableDataStore<TTransformedState> {
    notifyState(): void;
}

export default function createDataStoreProjection<TState, TTransformedState = TState>(
    store: DataStore<any, Action, TState>,
    stateTransformer: (state: TState) => TTransformedState
): DataStoreProjection<TTransformedState> {
    const projection = createDataStore<TState | undefined, SynchronizeAction<TState>, TTransformedState>(
        (state, action) => action.type === ProjectionActionType.Synchronize ?
            action.payload :
            state,
        store.getState(),
        { stateTransformer }
    );

    store.subscribe(state => {
        projection.dispatch(createAction(ProjectionActionType.Synchronize, state) as SynchronizeAction<TState>);
    }, { initial: false });

    return projection;
}
