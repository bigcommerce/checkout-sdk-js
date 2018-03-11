import { StandardError } from '../../common/error/errors';

export default class CartUnavailableError extends StandardError {
    /**
     * @constructor
     */
    constructor() {
        super('There is no available shopping cart.');

        this.type = 'cart_unavailable';
    }
}
