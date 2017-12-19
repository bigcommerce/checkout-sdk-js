import createCheckoutStore from './create-checkout-store';
import DataStore from '../data-store/data-store';

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
});
