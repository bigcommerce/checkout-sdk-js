import { StandardError } from '../../common/error/errors';

/**
 * Checkout prevents consumers from placing their orders when a merchant wishes
 * to be able to block transactions if the automated tax provider cannot be reached.
 */
export default class MissingShippingMethodError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'A shipping method is required for your order. Please review your shipping details and select a shipping option.',
        );

        this.name = 'MissingShippingMethodError';
        this.type = 'missing_shipping_method';
    }
}
