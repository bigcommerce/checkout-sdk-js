import { StandardError } from '../../common/error/errors';
import { BraintreeError } from '../../payment/strategies/braintree';
import { PaypalButtonStyleOptions } from '../../payment/strategies/paypal';

export interface BraintreePaypalButtonInitializeOptions {
    /**
     * @internal
     * This is an internal property and therefore subject to change. DO NOT USE.
     */
    shouldProcessPayment?: boolean;

    container: string;
    style?: Pick<PaypalButtonStyleOptions, 'color' | 'shape' | 'size'>;
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    onPaymentError?(error: BraintreeError | StandardError): void;
}
