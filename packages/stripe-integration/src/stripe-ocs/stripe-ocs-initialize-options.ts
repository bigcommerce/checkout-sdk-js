import { StripeElementUpdateOptions, StripeUPEAppearanceValues } from '../stripe-utils';

/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     gateway: 'stripeocs',
 *     id: 'optimized_checkout',
 *     stripeocs {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */

export default interface StripeOCSPaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;

    /**
     * Stripe OCS layout options
     */
    layout?: Record<string, string | number | boolean>;

    /**
     * Checkout styles from store theme
     */
    style?: Record<string, StripeUPEAppearanceValues>;

    onError?(error?: Error): void;

    render(): void;

    initStripeElementUpdateTrigger?(
        updateTriggerFn: (payload: StripeElementUpdateOptions) => void,
    ): void;

    paymentMethodSelect?(id: string): void;

    handleClosePaymentMethod?(collapseElement: () => void): void;
}

export interface WithStripeOCSPaymentInitializeOptions {
    stripeupe?: StripeOCSPaymentInitializeOptions;
    stripeocs?: StripeOCSPaymentInitializeOptions;
}
