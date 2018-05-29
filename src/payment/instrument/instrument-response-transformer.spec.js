import InstrumentResponseTransformer from './instrument-response-transformer';
import {
    getErrorInstrumentResponseBody,
    getLoadInstrumentsResponseBody,
    getRawInstrumentsResponseBody,
} from './instrument.mock';

describe('InstrumentResponseTransformer', () => {
    let instrumentResponseTransformer;

    beforeEach(() => {
        instrumentResponseTransformer = new InstrumentResponseTransformer();
    });

    describe('#transformResponse()', () => {
        it('transforms the loadInstruments response', () => {
            const response = { data: getRawInstrumentsResponseBody() };
            const result = instrumentResponseTransformer.transformResponse(response);

            expect(result).toEqual(
                expect.objectContaining({ body: getLoadInstrumentsResponseBody() })
            );
        });

        it('transforms an empty loadInstruments response', () => {
            const response = { data: { vaulted_instruments: [] } };
            const result = instrumentResponseTransformer.transformResponse(response);

            expect(result).toEqual(expect.objectContaining({
                body: { vaultedInstruments: [] },
            }));
        });
    });

    describe('#transformErrorResponse()', () => {
        it('transforms loadInstruments errors', () => {
            const response = { data: getErrorInstrumentResponseBody() };
            const result = instrumentResponseTransformer.transformErrorResponse(response);

            expect(result).toEqual(
                expect.objectContaining({ body: getErrorInstrumentResponseBody() })
            );
        });
    });
});
