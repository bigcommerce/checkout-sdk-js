import CheckoutSelector from './checkout-selector';
import { getCheckout, getCheckoutState } from './checkouts.mock';

describe('CheckoutSelector', () => {
    it('returns checkout', () => {
        const selector = new CheckoutSelector(getCheckoutState());

        expect(selector.getCheckout()).toEqual(getCheckout());
    });

    it('returns load error', () => {
        const loadError = new Error();
        const selector = new CheckoutSelector({
            ...getCheckoutState(),
            errors: { loadError },
        });

        expect(selector.getLoadError()).toEqual(loadError);
    });

    it('returns loading status', () => {
        const selector = new CheckoutSelector({
            ...getCheckoutState(),
            statuses: { isLoading: true },
        });

        expect(selector.isLoading()).toEqual(true);
    });
});
