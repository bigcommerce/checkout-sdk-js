import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, Checkout, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import StoreCreditActionCreator from './store-credit-action-creator';
import { StoreCreditActionType } from './store-credit-actions';
import StoreCreditRequestSender from './store-credit-request-sender';

describe('StoreCreditActionCreator', () => {
    let storeCreditActionCreator: StoreCreditActionCreator;
    let errorResponse: Response<Error>;
    let response: Response<Checkout>;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let requestSender: StoreCreditRequestSender;

    beforeEach(() => {
        response = getResponse(getCheckout());
        errorResponse = getErrorResponse();
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        requestSender = new StoreCreditRequestSender(createRequestSender());

        storeCreditActionCreator = new StoreCreditActionCreator(requestSender);

        jest.spyOn(requestSender, 'applyStoreCredit').mockReturnValue(Promise.resolve(response));
        jest.spyOn(requestSender, 'removeStoreCredit').mockReturnValue(Promise.resolve(response));
    });

    describe('#applyStoreCredit(true)', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits ApplyStoreCreditSucceeded actions if able to apply store credit', () => {
            from(storeCreditActionCreator.applyStoreCredit(true)(store))
                .pipe(toArray())
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: StoreCreditActionType.ApplyStoreCreditRequested },
                        { type: StoreCreditActionType.ApplyStoreCreditSucceeded, payload: getCheckout() },
                    ]);
                });
        });

        it('emits ApplyStoreCreditFailed actions if unable to apply store credit', () => {
            jest.spyOn(requestSender, 'applyStoreCredit').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            from(storeCreditActionCreator.applyStoreCredit(true)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: StoreCreditActionType.ApplyStoreCreditRequested },
                        { type: StoreCreditActionType.ApplyStoreCreditFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
