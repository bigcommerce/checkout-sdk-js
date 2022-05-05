import { StandardError } from '../../../common/error/errors';
import { AmazonPayOrderReference, AmazonPayWidgetError } from '../../../payment/strategies/amazon-pay';

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Amazon Pay.
 *
 * When Amazon Pay is initialized, a widget will be inserted into the DOM. The
 * widget has a list of shipping addresses for the customer to choose from.
 */
export default interface AmazonPayShippingInitializeOptions {
    /**
     * The ID of a container which the address widget should insert into.
     */
    container: string;

    /**
     * A callback that gets called when the customer selects an address option.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onAddressSelect?(reference: AmazonPayOrderReference): void;

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure of the initialization.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;

    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onReady?(reference: AmazonPayOrderReference): void;
}
