import { StandardError } from '../../common/error/errors';

/**
 * This error is thrown when the server detects inconsistency in cart data since it is last requested,
 * for example, product prices or eligible discounts have changed.
 */
export default class CartConsistencyError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'Your checkout could not be processed because some details have changed. Please review your order and try again.',
        );

        this.name = 'CartConsistencyError';
        this.type = 'cart_consistency';
    }
}
