import { createDataStore, Action, DataStore, Reducer } from '@bigcommerce/data-store';

import createDataStoreProjection from './create-data-store-projection';

interface TestState {
    count?: number;
    message: string;
}

interface TransformedTestState {
    count?: number;
    transformedMessage: string;
}

describe('DataStoreProjection', () => {
    let store: DataStore<TestState>;
    let transformer: (state: TestState) => TransformedTestState;

    beforeEach(() => {
        const initialState: TestState = {
            message: 'foobar',
        };

        const reducer: Reducer<TestState, Action> = (state = initialState, action) => {
            switch (action.type) {
            case 'MESSAGE':
                return { ...state, message: action.payload };

            case 'COUNT':
                return { ...state, count: action.payload };

            default:
                return state;
            }
        };

        store = createDataStore(reducer, initialState);

        transformer = (state: TestState) => {
            return {
                count: state.count,
                transformedMessage: `${state.message}!`,
            };
        };
    });

    it('projects state of data store to into different shape', () => {
        const projection = createDataStoreProjection(store, transformer);

        expect(projection.getState())
            .toEqual({
                transformedMessage: 'foobar!',
            });
    });

    it('passes projected data to subscriber', () => {
        const projection = createDataStoreProjection(store, transformer);
        const subscriber = jest.fn();

        projection.subscribe(subscriber);
        subscriber.mockReset();
        store.dispatch({ type: 'MESSAGE', payload: 'new message' });

        expect(subscriber)
            .toHaveBeenCalledWith({ transformedMessage: 'new message!' });
        expect(subscriber)
            .toHaveBeenCalledTimes(1);
    });

    it('triggers subscriber if projected data matches filter', () => {
        const projection = createDataStoreProjection(store, transformer);
        const subscriber = jest.fn();
        const filter = jest.fn(state => state.transformedMessage);

        projection.subscribe(subscriber, filter);
        subscriber.mockReset();
        store.dispatch({ type: 'COUNT', payload: 10 });

        expect(subscriber)
            .not.toHaveBeenCalled();

        store.dispatch({ type: 'MESSAGE', payload: 'new message' });

        expect(subscriber)
            .toHaveBeenCalledTimes(1);
    });

    it('can be unsubscribed', () => {
        const projection = createDataStoreProjection(store, transformer);
        const subscriber = jest.fn();
        const unsubscribe = projection.subscribe(subscriber);

        subscriber.mockReset();
        unsubscribe();
        store.dispatch({ type: 'MESSAGE', payload: 'new message' });

        expect(subscriber)
            .toHaveBeenCalledTimes(0);
    });

    it('can directly trigger subscriber without changing state', () => {
        const projection = createDataStoreProjection(store, transformer);
        const subscriber = jest.fn();

        projection.subscribe(subscriber);
        subscriber.mockReset();
        projection.notifyState();

        expect(subscriber)
            .toHaveBeenCalledTimes(1);
    });
});
