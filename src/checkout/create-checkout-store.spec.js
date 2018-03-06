import { Observable } from 'rxjs';
import { createErrorAction, DataStore } from '@bigcommerce/data-store';
import { getErrorResponse } from '../common/http-request/responses.mock';
import createCheckoutStore from './create-checkout-store';

describe('createCheckoutStore()', () => {
    it('returns an instance of CheckoutStore', () => {
        const store = createCheckoutStore();

        expect(store).toEqual(expect.any(DataStore));
    });

    it('creates CheckoutStore with expected reducers', () => {
        const store = createCheckoutStore();

        expect(store.getState()).toEqual({
            checkout: expect.any(Object),
            errors: expect.any(Object),
            statuses: expect.any(Object),
        });
    });

    it('creates `CheckoutStore` with action transformer', async () => {
        const store = createCheckoutStore();
        const action$ = Observable.throw(createErrorAction('SUBMIT_ORDER_FAILED', getErrorResponse()));

        try {
            await store.dispatch(action$);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});
