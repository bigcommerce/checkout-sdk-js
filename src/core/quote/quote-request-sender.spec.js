import { createTimeout } from '../../http-request';
import { getQuoteResponseBody } from './quotes.mock';
import { getResponse } from '../../http-request/responses.mock';
import QuoteRequestSender from './quote-request-sender';

describe('QuoteRequestSender', () => {
    let quoteRequestSender;
    let response;
    let requestSender;

    beforeEach(() => {
        response = getResponse(getQuoteResponseBody());

        requestSender = {
            get: jest.fn(() => Promise.resolve(response)),
        };

        quoteRequestSender = new QuoteRequestSender(requestSender);
    });

    describe('#loadQuote()', () => {
        it('sends request to load quote', async () => {
            const output = await quoteRequestSender.loadQuote();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/quote', {
                params: {
                    includes: 'cart,customer,shippingOptions,order',
                },
            });
        });

        it('sends request to load quote with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await quoteRequestSender.loadQuote(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/quote', {
                ...options,
                params: {
                    includes: 'cart,customer,shippingOptions,order',
                },
            });
        });
    });
});
