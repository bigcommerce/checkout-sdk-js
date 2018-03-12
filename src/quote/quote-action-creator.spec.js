import { Observable } from 'rxjs';
import { getQuoteResponseBody } from './internal-quotes.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './quote-action-types';
import QuoteActionCreator from './quote-action-creator';

describe('QuoteActionCreator', () => {
    let checkoutClient;
    let quoteActionCreator;
    let errorResponse;
    let response;

    beforeEach(() => {
        response = getResponse(getQuoteResponseBody());
        errorResponse = getErrorResponse();

        checkoutClient = {
            loadCheckout: jest.fn(() => Promise.resolve(response)),
        };

        quoteActionCreator = new QuoteActionCreator(checkoutClient);
    });

    describe('#loadQuote()', () => {
        it('emits actions if able to load quote', () => {
            quoteActionCreator.loadQuote()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_QUOTE_REQUESTED },
                        { type: actionTypes.LOAD_QUOTE_SUCCEEDED, meta: response.body.meta, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load quote', () => {
            const errorHandler = jest.fn((action) => Observable.of(action));

            checkoutClient.loadCheckout.mockReturnValue(Promise.reject(errorResponse));

            quoteActionCreator.loadQuote()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_QUOTE_REQUESTED },
                        { type: actionTypes.LOAD_QUOTE_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
