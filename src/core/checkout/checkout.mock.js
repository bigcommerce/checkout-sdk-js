import { getRemoteCheckoutMeta } from '../remote-checkout/remote-checkout.mock';

export function getCheckoutMeta() {
    return {
        remoteCheckout: getRemoteCheckoutMeta(),
    };
}
