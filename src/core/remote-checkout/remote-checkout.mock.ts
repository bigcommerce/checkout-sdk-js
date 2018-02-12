import { getBillingAddress } from '../billing/billing-address.mock';
import { getShippingAddress } from '../shipping/shipping-address.mock';
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
        address: getBillingAddress(),
    };
}

export function getRemoteShippingResponseBody(): any {
    return {
        address: getShippingAddress(),
    };
}

export function getRemotePaymentResponseBody(): any {
    return {
        payment: true,
    };
}
