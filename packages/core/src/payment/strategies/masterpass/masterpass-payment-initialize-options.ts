/**
 * A set of options that are required to initialize the Masterpass payment method.
 *
 * ```html
 * <!-- This is where the Masterpass button will be inserted -->
 * <div id="wallet-button"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'masterpass',
 *     masterpass: {
 *         walletButton: 'wallet-button'
 *     },
 * });
 * ```
 */
export default interface MasterpassPaymentInitializeOptions {
    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the ChasePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;
}
