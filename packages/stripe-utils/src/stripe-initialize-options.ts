import { StripeAppearanceValues } from './stripe';

export default interface StripePaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;

    /**
     * Checkout styles from store theme
     */
    style?: Record<string, StripeAppearanceValues>;

    onError?(error?: Error): void;

    render(): void;
}

/**
 * A capability for multi-method widgets (e.g. Stripe OCS/CS) to report the
 * shopper's currently selected sub-method back to the host.
 */
export interface WithSelectedSubMethod {
    /**
     * Called by a multi-method widget when the shopper selects a sub-method.
     *
     * @param methodId - The widget's payment method id (e.g. `stripeocs-optimized_checkout`).
     * @param selectedSubMethod - The raw provider sub-method type (e.g. `card`,
     * `us_bank_account`, `link`). Optional for backward compatibility.
     */
    paymentMethodSelect?(methodId: string, selectedSubMethod?: string): void;
}
