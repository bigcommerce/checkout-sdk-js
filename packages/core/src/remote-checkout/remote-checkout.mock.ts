import { omit } from 'lodash';

import { InternalAddress } from '../address';
import { getBillingAddress } from '../billing/internal-billing-addresses.mock';
import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';

import RemoteCheckoutState, { RemoteCheckoutStateData } from './remote-checkout-state';

export function getRemoteCheckoutState(): RemoteCheckoutState {
    return {
        data: getRemoteCheckoutStateData(),
    };
}

export function getEmptyRemoteCheckoutState(): RemoteCheckoutState {
    return {
        data: {},
    };
}

export function getRemoteCheckoutStateData(): RemoteCheckoutStateData {
    return {
        amazon: {
            billing: {
                address: getBillingAddress(),
            },
            shipping: {
                address: omit(getShippingAddress(), 'id') as InternalAddress,
            },
            referenceId: '511ed7ed-221c-418c-8286-f5102e49220b',
        },
    };
}

export function getRemoteBillingResponseBody(): any {
    return {
        billing: {
            address: getBillingAddress(),
        },
    };
}

export function getRemoteShippingResponseBody(): any {
    return {
        shipping: {
            address: getShippingAddress(),
        },
    };
}

export function getRemotePaymentResponseBody(): any {
    return {
        payment: true,
    };
}

export function getRemoteTokenResponseBody(): any {
    return {
        token: 'cb5eda6a-ab78-4bf1-b849-4a0ab0b0c5a0',
    };
}
