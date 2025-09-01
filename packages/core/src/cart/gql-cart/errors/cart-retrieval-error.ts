import { StandardError } from '../../../common/error/errors';

export default class CartRetrievalError extends StandardError {
    constructor(message?: string) {
        super(message || 'Cart not available.');

        this.name = 'CartRetrievalError';
        this.type = 'cart_retrieval';
    }
}
