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
});
