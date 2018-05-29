import {
    deleteInstrumentResponseBody,
    getInstruments,
    getInstrumentsMeta,
    getLoadInstrumentsResponseBody,
} from './instrument.mock';

import { getErrorResponse } from '../../common/http-request/responses.mock';
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
        const action = {
            type: actionTypes.LOAD_INSTRUMENTS_SUCCEEDED,
            meta: getInstrumentsMeta(),
            payload: getLoadInstrumentsResponseBody(),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            data: action.payload.vaulted_instruments,
            meta: action.meta,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when instruments cannot be loaded', () => {
        const action = {
            type: actionTypes.LOAD_INSTRUMENTS_FAILED,
            payload: getErrorResponse(),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when deleting instruments', () => {
        const action = {
            type: actionTypes.DELETE_INSTRUMENT_REQUESTED,
            meta: { instrumentId: '123' },
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: {
                isDeleting: true,
                deletingInstrument: '123',
            },
        });
    });

    it('returns new state when instruments are deleted', () => {
        const initialInstruments = getInstruments();
        initialState.data = initialInstruments;

        const action = {
            type: actionTypes.DELETE_INSTRUMENT_SUCCEEDED,
            meta: {
                ...getInstrumentsMeta(),
                instrumentId: initialInstruments[0].bigpay_token,
            },
            payload: deleteInstrumentResponseBody(),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            data: [initialInstruments[1]],
            meta: action.meta,
            errors: { deleteError: undefined },
            statuses: {
                isDeleting: false,
                deletingInstrument: undefined,
            },
        });
    });

    it('returns new state when instruments cannot be deleted', () => {
        const action = {
            type: actionTypes.DELETE_INSTRUMENT_FAILED,
            meta: { instrumentId: '123' },
            payload: getErrorResponse(),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {
                deleteError: action.payload,
                failedInstrument: '123',
            },
            statuses: {
                isDeleting: false,
                deletingInstrument: undefined,
            },
        });
    });
});
