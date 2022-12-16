import { CardClassSelectors } from '@square/web-payments-sdk-types';

/**
 * A set of options that are required to initialize the Square payment method.
 *
 * Once Square payment is initialized, an iframed payment element will be
 * inserted into the current page. These options provide a location, styling,
 * and a callback function that advises when it's safe to pay.
 *
 * @example
 *
 * ```html
 * <!-- These container is where the hosted (iframed) payment method element will be inserted -->
 * <div id="card-payment"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'squarev2',
 *     squarev2: {
 *         containerId: 'card-payment',
 *         style: {
 *             input: {
 *                 backgroundColor: '#F7F8F9',
 *                 color: '#373F4A',
 *                 fontFamily: 'Helvetica Neue',
 *                 fontSize: '16px',
 *                 fontWeight: 'normal'
 *             }
 *         },
 *         onValidationChange: (isReadyToPay: boolean) => {
 *             if (isReadyToPay) {
 *                 // Show or hide some component or message...
 *             }
 *         }
 *     },
 * });
 * ```
 */
export default interface SquareV2PaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    containerId: string;

    /**
     * A map of .css classes and values that customize the style of the
     * input fields from the card element.
     *
     * For more information about applying custom styles to the card form, see
     * the available [CardClassSelectors](https://developer.squareup.com/reference/sdks/web/payments/objects/CardClassSelectors)
     * for styling.
     */
    style?: CardClassSelectors;

    /**
     * A callback that gets called when the validity of the
     * payment component changes.
     */
    onValidationChange?: (isReadyToPay: boolean) => void;
}

export interface WithSquareV2PaymentInitializeOptions {
    /**
     * The options that are required to initialize the Square payment method.
     * They can be omitted unless you need to support Square.
     */
    squarev2?: SquareV2PaymentInitializeOptions;
}
