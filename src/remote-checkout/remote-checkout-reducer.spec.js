import { getResponse } from '../common/http-request/responses.mock';
import { getRemoteBillingResponseBody, getRemoteShippingResponseBody } from './remote-checkout.mock';
import * as actionTypes from './remote-checkout-action-types';
import remoteCheckoutReducer from './remote-checkout-reducer';

describe('remoteCheckoutReducer', () => {
    it('returns state with billing address', () => {
        const response = getResponse(getRemoteBillingResponseBody());
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED,
            payload: response.body,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                data: {
                    billingAddress: response.body.billing.address,
                },
            }));
    });

    it('returns state with shipping address', () => {
        const response = getResponse(getRemoteShippingResponseBody());
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED,
            payload: response.body,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                data: {
                    shippingAddress: response.body.shipping.address,
                },
            }));
    });
});
