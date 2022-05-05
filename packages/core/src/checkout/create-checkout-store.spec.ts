
import { createErrorAction, DataStore } from '@bigcommerce/data-store';
import { throwError } from 'rxjs';

import { getErrorResponse } from '../common/http-request/responses.mock';

import createCheckoutStore from './create-checkout-store';

describe('createCheckoutStore()', () => {
    it('returns an instance of CheckoutStore', () => {
        const store = createCheckoutStore();

        expect(store).toEqual(expect.any(DataStore));
    });

    it('creates `CheckoutStore` with action transformer', async () => {
        const store = createCheckoutStore();
        const action$ = throwError(createErrorAction('SUBMIT_ORDER_FAILED', getErrorResponse()));

        try {
            await store.dispatch(action$);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});
