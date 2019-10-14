import { getPaymentResponse, getResponse } from '../../common/http-request/responses.mock';

import InstrumentResponseTransformer from './instrument-response-transformer';
import { getErrorInstrumentResponseBody, getInternalInstrumentsResponseBody, getLoadInstrumentsResponseBody, getVaultAccessToken, getVaultAccessTokenResponseBody } from './instrument.mock';

describe('InstrumentResponseTransformer', () => {
    let instrumentResponseTransformer: InstrumentResponseTransformer;

    beforeEach(() => {
        instrumentResponseTransformer = new InstrumentResponseTransformer();
    });

    describe('#transformResponse()', () => {
        it('transforms the loadInstruments response', () => {
            const response = getPaymentResponse(getInternalInstrumentsResponseBody());
            const result = instrumentResponseTransformer.transformResponse(response);

            expect(result).toEqual(
                expect.objectContaining({ body: getLoadInstrumentsResponseBody() })
            );
        });

        it('transforms an empty loadInstruments response', () => {
            const response = getPaymentResponse({ vaulted_instruments: [] });
            const result = instrumentResponseTransformer.transformResponse(response);

            expect(result).toEqual(expect.objectContaining({
                body: { vaultedInstruments: [] },
            }));
        });
    });

    describe('#transformVaultAccessResponse()', () => {
        it('transforms loadInstruments errors', () => {
            const response = getResponse(getVaultAccessTokenResponseBody());
            const result = instrumentResponseTransformer.transformVaultAccessResponse(response);

            expect(result).toEqual(
                expect.objectContaining({ body: getVaultAccessToken() })
            );
        });
    });

    describe('#transformErrorResponse()', () => {
        it('transforms loadInstruments errors', () => {
            const response = getPaymentResponse(getErrorInstrumentResponseBody());
            const result = instrumentResponseTransformer.transformErrorResponse(response);

            expect(result).toEqual(
                expect.objectContaining({ body: getErrorInstrumentResponseBody() })
            );
        });
    });
});
