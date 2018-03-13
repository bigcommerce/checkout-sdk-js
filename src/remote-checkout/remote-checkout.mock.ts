import { getBillingAddress } from '../billing/internal-billing-addresses.mock';
import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import RemoteCheckoutState from './remote-checkout-state';
import RemoteCheckout from './remote-checkout';
import RemoteCheckoutMeta from './remote-checkout-meta';

export function getRemoteCheckoutState(): RemoteCheckoutState {
    return {
        data: {
            billingAddress: getBillingAddress(),
            shippingAddress: getShippingAddress(),
            isPaymentInitialized: true,
        },
        errors: {},
        meta: getRemoteCheckoutMeta(),
        statuses: {},
    };
}

export function getEmptyRemoteCheckoutState(): RemoteCheckoutState {
    return {
        errors: {},
        statuses: {},
    };
}

export function getRemoteCheckoutMeta(): RemoteCheckoutMeta {
    return {
        amazon: {
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
