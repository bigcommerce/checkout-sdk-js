
import { StandardError } from '../../../common/error/errors';
import { AmazonPayWidgetError } from '../../../payment/strategies/amazon-pay';

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support Amazon Pay.
 *
 * When AmazonPay is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, they will be redirected to Amazon to
 * sign in.
 */
export default interface AmazonPayCustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;

    /**
     * The colour of the sign-in button.
     */
    color?: 'Gold' | 'LightGray' | 'DarkGray';

    /**
     * The size of the sign-in button.
     */
    size?: 'small' | 'medium' | 'large' | 'x-large';

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;
}
