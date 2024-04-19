import { StandardError } from '../../../common/error/errors';
import { BraintreeError } from '../../../payment/strategies/braintree';

export default interface BraintreePaypalCreditCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;

    buttonHeight?: number;

    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;

    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}
