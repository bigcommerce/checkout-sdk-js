import { StandardError } from '../../common/error/errors';

export default class CartConflictError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'Your checkout could not be processed because the cart has been modified. Please review your order and try again.',
        );

        this.name = 'CartConflictError';
        this.type = 'cart_conflict';
    }
}
