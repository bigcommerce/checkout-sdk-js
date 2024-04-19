import { objectFlatten, objectWithSortedKeys } from '../common/utility';

import { LoadPickupOptionsAction, PickupOptionActionType } from './pickup-option-actions';
import pickupOptionReducer from './pickup-option-reducer';
import PickupOptionState from './pickup-option-state';
import { getPickupOptions, getQueryForPickupOptions } from './pickup-option.mock';

describe('pickupOptionReducer()', () => {
    let initialState: PickupOptionState;

    beforeEach(() => {
        initialState = {
            errors: {},
            statuses: {},
        };
    });

    it('returns a new state when fetching pickup options', () => {
        const action: LoadPickupOptionsAction = {
            type: PickupOptionActionType.LoadPickupOptionsRequested,
        };

        expect(pickupOptionReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns a new state when pickup options are fetched', () => {
        const query = getQueryForPickupOptions();
        const action: LoadPickupOptionsAction = {
            type: PickupOptionActionType.LoadPickupOptionsSucceeded,
            meta: query,
            payload: [getPickupOptions()],
        };

        const codedKey = btoa(`${JSON.stringify(objectWithSortedKeys(objectFlatten(query)))}`);

        expect(pickupOptionReducer(initialState, action)).toEqual({
            data: {
                [codedKey]: action.payload,
            },
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns a new state when pickup options cannot be fetched', () => {
        const action: LoadPickupOptionsAction = {
            type: PickupOptionActionType.LoadPickupOptionsFailed,
        };

        expect(pickupOptionReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
