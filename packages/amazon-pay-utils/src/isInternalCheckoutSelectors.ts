import { InternalCheckoutSelectors } from './amazon-pay-v2';

export function isInternalCheckoutSelectors(
    checkoutSelectors: unknown,
): checkoutSelectors is InternalCheckoutSelectors {
    return (
        typeof checkoutSelectors === 'object' &&
        checkoutSelectors !== null &&
        'cart' in checkoutSelectors &&
        'checkout' in checkoutSelectors &&
        'config' in checkoutSelectors &&
        'paymentMethods' in checkoutSelectors
    );
}
