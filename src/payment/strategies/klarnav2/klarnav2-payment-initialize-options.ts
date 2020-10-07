import { KlarnaLoadResponse } from './klarna-payments';

/**
 * A set of options that are required to initialize the KlarnaV2 payment method.
 *
 * When KlarnaV2 is initialized, a list of payment options will be displayed for the customer to choose from.
 * Each one with its own widget.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container'
 *     },
 * });
 * ```
 *
 * An additional event callback can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container',
 *         onLoad(response) {
 *             console.log(response);
 *         },
 *     },
 * });
 * ```
 */
export default interface KlarnaV2PaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;

    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param response - The result of the initialization. It indicates whether
     * or not the widget is loaded successfully.
     */
    onLoad?(response: KlarnaLoadResponse): void;
}
