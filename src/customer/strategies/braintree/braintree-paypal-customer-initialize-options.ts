import { BraintreePaypalButtonStyles } from '../../../checkout-buttons/strategies/braintree';
import { StandardError } from '../../../common/error/errors';
import { BraintreeError } from '../../../payment/strategies/braintree';

export default interface BraintreePaypalCustomerInitializeOptions {
    /**
     * The ID of a container which the button(-s) should insert into.
     */
    container: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: BraintreePaypalButtonStyles;

    /**
     * Whether or not to show a credit button.
     */
    allowCredit?: boolean;

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
}
