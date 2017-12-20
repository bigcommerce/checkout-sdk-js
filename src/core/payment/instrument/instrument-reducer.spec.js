import { getInstrumentsResponseBody } from './instrument.mock';
import { getErrorResponseBody } from '../../common/error/errors.mock';
import instrumentReducer from './instrument-reducer';
import * as actionTypes from './instrument-action-types';

describe('instrumentReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            data: [],
        };
    });

    afterEach(() => {
        initialState = {
            data: [],
        };
    });

    it('returns new state when loading instruments', () => {
        const action = {
            type: actionTypes.LOAD_INSTRUMENTS_REQUESTED,
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns new state when instruments are loaded', () => {
        const response = getInstrumentsResponseBody();
        const action = {
            type: actionTypes.LOAD_INSTRUMENTS_SUCCEEDED,
            payload: response.data,
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            data: action.payload.vaulted_instruments,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when instruments cannot be loaded', () => {
        const action = {
            type: actionTypes.LOAD_INSTRUMENTS_FAILED,
            payload: getErrorResponseBody(),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
