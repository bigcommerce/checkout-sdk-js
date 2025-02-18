import { CheckoutSettings } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isExperimentEnabled(
    checkoutSettings: CheckoutSettings | undefined,
    experimentName: string,
): boolean {
    return Boolean(checkoutSettings?.features[experimentName] ?? true);
}
