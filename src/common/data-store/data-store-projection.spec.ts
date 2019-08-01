import { createDataStore } from '@bigcommerce/data-store';

import DataStoreProjection from './data-store-projection';

describe('DataStoreProjection', () => {
    interface TestState {
        message: string;
    }

    it('projects state of data store to into different shape', () => {
        const store = createDataStore(() => ({ message: 'foobar' }));
        const projection = new DataStoreProjection(store, (state: TestState) => {
            return {
                ...state,
                transformed: true,
            };
        });

        expect(projection.getState())
            .toEqual({
                message: 'foobar',
                transformed: true,
            });
    });

    it('passes projected data to subscriber', () => {
        const subscriber = jest.fn();
        const filter = jest.fn(state => state.message);
        const store = createDataStore(() => ({ message: 'foobar' }));
        const projection = new DataStoreProjection(store, (state: TestState) => {
            return {
                ...state,
                transformed: true,
            };
        });

        projection.subscribe(subscriber, filter);
        store.notifyState();

        expect(subscriber)
            .toHaveBeenCalledWith(projection.getState());
        expect(filter)
            .toHaveBeenCalledWith(projection.getState());
    });
});
