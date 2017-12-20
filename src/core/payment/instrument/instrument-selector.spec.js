import InstrumentSelector from './instrument-selector';
import { getErrorResponseBody } from '../../common/error/errors.mock';
import { getInstrumentState } from './instrument.mock';

describe('InstrumentSelector', () => {
    let instrumentSelector;
    let state;

    beforeEach(() => {
        state = {
            instrument: getInstrumentState(),
        };
    });

    describe('#getInstruments()', () => {
        it('returns a list of instruments', () => {
            instrumentSelector = new InstrumentSelector(state.instrument);

            expect(instrumentSelector.getInstruments()).toEqual(state.instrument.data);
        });

        it('returns an empty array if there are no instruments', () => {
            instrumentSelector = new InstrumentSelector({ data: [] });

            expect(instrumentSelector.getInstruments()).toEqual([]);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponseBody();

            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                errors: { loadError },
            });

            expect(instrumentSelector.getLoadError()).toEqual(loadError);
        });

        it('does not return error if able to load', () => {
            instrumentSelector = new InstrumentSelector(state.instrument);

            expect(instrumentSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#getDeleteError()', () => {
        let mockInstrumentId;

        beforeEach(() => {
            mockInstrumentId = '123';
        });

        it('returns error if unable to delete', () => {
            const deleteError = getErrorResponseBody();

            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                errors: { deleteError, failedInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.getDeleteError(mockInstrumentId)).toEqual(deleteError);
        });

        it('does not return error if able to delete', () => {
            instrumentSelector = new InstrumentSelector(state.instrument);

            expect(instrumentSelector.getDeleteError(mockInstrumentId)).toBeUndefined();
        });

        it('does not return error if unable to delete irrelevant instrument', () => {
            const deleteError = getErrorResponseBody();

            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                errors: { deleteError, failedInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.getDeleteError('321')).toBeUndefined();
        });

        it('returns any error if instrument id is not passed', () => {
            const deleteError = getErrorResponseBody();

            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                errors: { deleteError, failedInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.getDeleteError()).toEqual(deleteError);
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading instruments', () => {
            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                statuses: { isLoading: true },
            });

            expect(instrumentSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading instruments', () => {
            instrumentSelector = new InstrumentSelector(state.instrument);

            expect(instrumentSelector.isLoading()).toEqual(false);
        });
    });

    describe('#isDeleting()', () => {
        let mockInstrumentId;

        beforeEach(() => {
            mockInstrumentId = '123';
        });

        it('returns true if deleting an instrument', () => {
            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                statuses: { isDeleting: true, deletingInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.isDeleting(mockInstrumentId)).toEqual(true);
        });

        it('returns false if not deleting an instrument', () => {
            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                statuses: { isDeleting: false, deletingInstrument: undefined },
            });

            expect(instrumentSelector.isDeleting(mockInstrumentId)).toEqual(false);
        });

        it('returns false if not deleting specific instrument', () => {
            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                statuses: { isDeleting: true, deletingInstrument: '321' },
            });

            expect(instrumentSelector.isDeleting(mockInstrumentId)).toEqual(false);
        });

        it('returns any deleting status if instrument id is not passed', () => {
            instrumentSelector = new InstrumentSelector({
                ...state.instrument,
                statuses: { isDeleting: true, deletingInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.isDeleting()).toEqual(true);
        });
    });
});
