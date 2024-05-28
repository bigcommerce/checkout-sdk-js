/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a change shipping button will be bound.
 * When the customer clicks on it, they will be redirected to Amazon to
 * select a different shipping address.
 *
 * ```html
 * <!-- This is the change shipping button that will be bound -->
 * <button id="edit-button">Change shipping</button>
 * ```
 *
 * ```js
 * service.initializeShipping({
 *     methodId: 'amazonpay',
 *     amazonpay: {
 *         editAddressButtonId: 'edit-button',
 *     },
 * });
 * ```
 */
export default interface AmazonPayV2ShippingInitializeOptions {
    /**
     * This editAddressButtonId is used to set an event listener, provide an
     * element ID if you want users to be able to select a different shipping
     * address by clicking on a button. It should be an HTML element.
     */
    editAddressButtonId?: string;
}
