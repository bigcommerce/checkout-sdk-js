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
