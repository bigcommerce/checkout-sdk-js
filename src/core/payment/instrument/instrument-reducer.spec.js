import { getInstruments, getInstrumentsResponseBody, vaultInstrumentResponseBody, deleteInstrumentResponseBody } from './instrument.mock';
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
        const response = getInstrumentsResponseBody();
        const action = {
            type: actionTypes.LOAD_INSTRUMENTS_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            data: action.payload.vaulted_instruments,
            meta: response.meta,
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

    it('returns new state when vaulting an instrument', () => {
        const action = {
            type: actionTypes.VAULT_INSTRUMENT_REQUESTED,
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isVaulting: true },
        });
    });

    it('returns new state when instruments are vaulted', () => {
        const response = vaultInstrumentResponseBody();
        const action = {
            type: actionTypes.VAULT_INSTRUMENT_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            data: expect.arrayContaining([action.payload.vaulted_instrument]),
            meta: response.meta,
            errors: { vaultError: undefined },
            statuses: { isVaulting: false },
        });
    });

    it('returns new state when instruments cannot be vaulted', () => {
        const action = {
            type: actionTypes.VAULT_INSTRUMENT_FAILED,
            payload: getErrorResponse(),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { vaultError: action.payload },
            statuses: { isVaulting: false },
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
        const response = deleteInstrumentResponseBody();
        const initialInstruments = getInstruments();
        initialState.data = initialInstruments;

        const action = {
            type: actionTypes.DELETE_INSTRUMENT_SUCCEEDED,
            meta: response.meta,
            payload: {
                instrumentId: initialInstruments[0].bigpay_token,
            },
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            data: [initialInstruments[1]],
            meta: response.meta,
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
