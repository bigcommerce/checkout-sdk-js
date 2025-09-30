import { StandardError } from '../../common/error/errors';

/**
 * This error is thrown when cart is removed or empty.
 */
export default class EmptyCartError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'Your checkout could not be processed because your cart is empty. Please add items to your cart and try again.',
        );

        this.name = 'EmptyCartError';
        this.type = 'empty_cart';
    }
}
