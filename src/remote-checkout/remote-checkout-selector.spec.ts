import { getErrorResponse } from '../common/http-request/responses.mock';

import RemoteCheckoutSelector from './remote-checkout-selector';
import { getEmptyRemoteCheckoutState, getRemoteCheckoutState } from './remote-checkout.mock';

describe('RemoteCheckoutSelector', () => {
    it('returns remote checkout data', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout('amazon')).toEqual(remoteCheckout.data.amazon);
    });

    it('returns undefined if checkout data is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout('amazon')).toBeUndefined();
    });
});
