import { createRemoteCheckoutSelectorFactory } from './remote-checkout-selector';
import { getEmptyRemoteCheckoutState, getRemoteCheckoutState } from './remote-checkout.mock';

describe('RemoteCheckoutSelector', () => {
    const createRemoteCheckoutSelector = createRemoteCheckoutSelectorFactory();

    it('returns remote checkout data', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = createRemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout('amazon')).toEqual(remoteCheckout.data.amazon);
    });

    it('returns undefined if checkout data is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = createRemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout('amazon')).toBeUndefined();
    });
});
