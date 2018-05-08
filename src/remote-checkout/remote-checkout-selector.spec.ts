import { getErrorResponse } from '../common/http-request/responses.mock';
import { getCustomerState, getRemoteCustomer } from '../customer/internal-customers.mock';

import RemoteCheckoutSelector from './remote-checkout-selector';
import { getEmptyRemoteCheckoutState, getRemoteCheckoutState } from './remote-checkout.mock';

describe('RemoteCheckoutSelector', () => {
    it('returns remote checkout data', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout, getCustomerState());

        expect(selector.getCheckout()).toEqual(remoteCheckout.data);
    });

    it('returns undefined if checkout data is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout, getCustomerState());

        expect(selector.getCheckout()).toBeUndefined();
    });

    it('returns remote checkout meta', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout, getCustomerState());

        expect(selector.getCheckoutMeta()).toEqual(remoteCheckout.meta);
    });

    it('returns undefined if checkout meta is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout, getCustomerState());

        expect(selector.getCheckoutMeta()).toBeUndefined();
    });

    it('returns remote checkout provider id', () => {
        const selector = new RemoteCheckoutSelector(getRemoteCheckoutState(), { ...getCustomerState(), data: getRemoteCustomer() });

        expect(selector.getProviderId()).toEqual('amazon');
    });
});
