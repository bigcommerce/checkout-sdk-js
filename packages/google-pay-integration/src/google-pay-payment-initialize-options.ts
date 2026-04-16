import { GooglePayButtonColor, GooglePayButtonType } from './types';

/**
 * A set of options that are required to initialize the GooglePay payment method
 *
 * If the customer chooses to pay with GooglePay, they will be asked to
 * enter their payment details via a modal. You can hook into events emitted by
 * the modal by providing the callbacks listed below.
 *
 * ```html
 * <!-- This is where the GooglePay button will be inserted -->
 * <div id="wallet-button"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     // Using GooglePay provided by Braintree as an example
 *     methodId: 'googlepaybraintree',
 *     googlepaybraintree: {
 *         walletButton: 'wallet-button'
 *     },
 * });
 * ```
 *
 * Additional event callbacks can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'googlepaybraintree',
 *     googlepaybraintree: {
 *         walletButton: 'wallet-button',
 *         onError(error) {
 *             console.log(error);
 *         },
 *         onPaymentSelect() {
 *             console.log('Selected');
 *         },
 *     },
 * });
 * ```
 *
 * Alternatively, a container-based Google Pay button can be rendered directly
 * in the payment step (replacing the Place Order button):
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'googlepaybraintree',
 *     googlepaybraintree: {
 *         container: 'checkout-payment-continue',
 *         onInit(renderButton) {
 *             // Hide Place Order, then render the button once container is in DOM
 *             renderButton();
 *         },
 *         onError(error) {
 *             console.log(error);
 *         },
 *     },
 * });
 * ```
 */
export default interface GooglePayPaymentInitializeOptions {
    /**
     * A container for loading spinner.
     */
    loadingContainerId?: string;

    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the GooglePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;

    /**
     * The ID of the container element where the Google Pay button will be rendered.
     * When provided, a branded Google Pay button is created inside this container.
     * Clicking the button opens the Google Pay payment sheet and, on success, submits
     * the order and redirects to the order confirmation page directly — no separate
     * "Place Order" step is needed.
     *
     * Either `walletButton` or `container` must be supplied.
     */
    container?: string;

    /**
     * The color of the Google Pay button rendered into `container`.
     * Defaults to `'default'`.
     */
    buttonColor?: GooglePayButtonColor;

    /**
     * The type/label of the Google Pay button rendered into `container`.
     * Defaults to `'pay'`.
     */
    buttonType?: GooglePayButtonType;

    /**
     * Called after the Google Pay processor is fully initialized, with a
     * `renderButton` function that — when invoked — creates the Google Pay
     * button inside `container`.  Use this callback to control timing: hide
     * the Place Order button first, then call `renderButton()` once the
     * container element is present in the DOM.
     *
     * Only relevant when `container` is provided.
     */
    onInit?(renderButton: () => void): void;

    /**
     * A callback that gets called when GooglePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}

/**
 * The recognized keys to pass the initialization options for Google Pay.
 */
export enum GooglePayKey {
    ADYEN_V2 = 'googlepayadyenv2',
    ADYEN_V3 = 'googlepayadyenv3',
    AUTHORIZE_NET = 'googlepayauthorizenet',
    BNZ = 'googlepaybnz',
    BRAINTREE = 'googlepaybraintree',
    PAYPAL_COMMERCE = 'googlepaypaypalcommerce',
    BIGCOMMERCE_PAYMENTS = 'googlepay_bigcommerce_payments',
    CHECKOUT_COM = 'googlepaycheckoutcom',
    CYBERSOURCE_V2 = 'googlepaycybersourcev2',
    ORBITAL = 'googlepayorbital',
    STRIPE = 'googlepaystripe',
    STRIPE_UPE = 'googlepaystripeupe',
    STRIPE_OCS = 'googlepaystripeocs',
    WORLDPAY_ACCESS = 'googlepayworldpayaccess',
    TD_ONLINE_MART = 'googlepaytdonlinemart',
}

/**
 * The options that are required to initialize the GooglePay payment method.
 * They can be omitted unless you need to support GooglePay.
 */
export type WithGooglePayPaymentInitializeOptions = {
    [k in GooglePayKey]?: GooglePayPaymentInitializeOptions;
};
