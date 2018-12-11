import { StandardError } from '../../../common/error/errors';

import AmazonPayOrderReference from './amazon-pay-order-reference';
import AmazonPayWidgetError from './amazon-pay-widget-error';

/**
 * A set of options that are required to initialize the Amazon Pay payment
 * method.
 *
 * When AmazonPay is initialized, a widget will be inserted into the DOM. The
 * widget has a list of payment options for the customer to choose from.
 */
export default interface AmazonPayPaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the payment options.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;

    /**
     * A callback that gets called when the customer selects one of the payment
     * options provided by the widget.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onPaymentSelect?(reference: AmazonPayOrderReference): void;

    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onReady?(reference: AmazonPayOrderReference): void;
}
