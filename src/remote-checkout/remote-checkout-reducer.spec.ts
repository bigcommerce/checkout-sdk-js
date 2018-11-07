import { getResponse } from '../common/http-request/responses.mock';

import { RemoteCheckoutAction, RemoteCheckoutActionType } from './remote-checkout-actions';
import remoteCheckoutReducer from './remote-checkout-reducer';
import RemoteCheckoutState from './remote-checkout-state';
import { getRemoteBillingResponseBody, getRemoteShippingResponseBody } from './remote-checkout.mock';

describe('remoteCheckoutReducer', () => {
    let initialState: RemoteCheckoutState;

    beforeEach(() => {
        initialState = {
            data: {},
        };
    });

    it('returns state with billing address', () => {
        const response = getResponse(getRemoteBillingResponseBody());
        const action: RemoteCheckoutAction = {
            type: RemoteCheckoutActionType.InitializeRemoteBillingSucceeded,
            payload: response.body,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer(initialState, action))
            .toEqual(expect.objectContaining({
                data: {
                    amazon: {
                        billing: {
                            address: response.body.billing.address,
                        },
                    },
                },
            }));
    });

    it('returns state with shipping address', () => {
        const response = getResponse(getRemoteShippingResponseBody());
        const action: RemoteCheckoutAction = {
            type: RemoteCheckoutActionType.InitializeRemoteShippingSucceeded,
            payload: response.body,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer(initialState, action))
            .toEqual(expect.objectContaining({
                data: {
                    amazon: {
                        shipping: {
                            address: response.body.shipping.address,
                        },
                    },
                },
            }));
    });
});
