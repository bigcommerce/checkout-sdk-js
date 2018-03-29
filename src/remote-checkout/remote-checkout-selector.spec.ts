import { getErrorResponse } from '../common/http-request/responses.mock';
import { getRemoteCheckoutState, getEmptyRemoteCheckoutState } from './remote-checkout.mock';
import RemoteCheckoutSelector from './remote-checkout-selector';

describe('RemoteCheckoutSelector', () => {
    it('returns remote checkout data', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout()).toEqual(remoteCheckout.data);
    });

    it('returns undefined if checkout data is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout()).toBeUndefined();
    });

    it('returns remote checkout meta', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckoutMeta()).toEqual(remoteCheckout.meta);
    });

    it('returns undefined if checkout meta is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckoutMeta()).toBeUndefined();
    });
});
