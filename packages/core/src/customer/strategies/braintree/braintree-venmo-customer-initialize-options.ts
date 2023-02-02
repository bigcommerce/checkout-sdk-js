import { StandardError, UnsupportedBrowserError } from '../../../common/error/errors';
import { BraintreeError } from '../../../payment/strategies/braintree';

export default interface BraintreeVenmoCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;

    /**
     * A callback that gets called on any error.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | UnsupportedBrowserError | StandardError): void;
}
