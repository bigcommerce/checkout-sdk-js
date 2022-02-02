import { LoadPickupOptionsAction, PickupOptionActionType } from './pickup-option-actions';
import pickupOptionReducer from './pickup-option-reducer';
import PickupOptionState from './pickup-option-state';
import { getPickupOptions } from './pickup-option.mock';

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
        const action: LoadPickupOptionsAction = {
            type: PickupOptionActionType.LoadPickupOptionsSucceeded,
            payload: [getPickupOptions()],
        };

        expect(pickupOptionReducer(initialState, action)).toEqual({
            data: action.payload,
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
