import { createRequestErrorFactory } from '../../common/error';
import { getErrorResponse } from '../../common/http-request/responses.mock';

import { InstrumentAction, InstrumentActionType } from './instrument-actions';
import instrumentReducer from './instrument-reducer';
import InstrumentState from './instrument-state';
import { deleteInstrumentResponseBody, getInstruments, getInstrumentsMeta, getLoadInstrumentsResponseBody } from './instrument.mock';

describe('instrumentReducer()', () => {
    let initialState: InstrumentState;

    beforeEach(() => {
        initialState = {
            data: [],
            errors: {},
            statuses: {},
        };
    });

    it('returns new state when loading instruments', () => {
        const action: InstrumentAction = {
            type: InstrumentActionType.LoadInstrumentsRequested,
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns new state when instruments are loaded', () => {
        const action: InstrumentAction = {
            type: InstrumentActionType.LoadInstrumentsSucceeded,
            meta: getInstrumentsMeta(),
            payload: getLoadInstrumentsResponseBody(),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            // tslint:disable-next-line:no-non-null-assertion
            data: action.payload!.vaultedInstruments,
            meta: action.meta,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when instruments cannot be loaded', () => {
        const action: InstrumentAction = {
            type: InstrumentActionType.LoadInstrumentsFailed,
            payload: createRequestErrorFactory().createError(getErrorResponse()),
        };

        expect(instrumentReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when deleting instruments', () => {
        const action: InstrumentAction = {
            type: InstrumentActionType.DeleteInstrumentRequested,
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

        const action: InstrumentAction = {
            type: InstrumentActionType.DeleteInstrumentSucceeded,
            meta: {
                ...getInstrumentsMeta(),
                instrumentId: initialInstruments[0].bigpayToken,
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
        const action: InstrumentAction = {
            type: InstrumentActionType.DeleteInstrumentFailed,
            meta: { instrumentId: '123' },
            payload: createRequestErrorFactory().createError(getErrorResponse()),
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
