import { Checkout } from '@bigcommerce/checkout-sdk/payment-integration-api';

import HeadlessCheckoutResponse from './headless-checkout';

export default function mapToCheckout(
    headlessCartResponse: HeadlessCheckoutResponse,
): Checkout | undefined {
    const { checkout } = headlessCartResponse;

    if (!checkout) {
        return;
    }

    // TODO:: here will be mapped all checkout data related fields
    // eslint-disable-next-line
    // @ts-ignore
    return {
        id: checkout.entityId,
    };
}
