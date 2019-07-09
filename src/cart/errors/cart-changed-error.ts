import { StandardError } from '../../common/error/errors';

export default class CartChangedError extends StandardError {
    constructor() {
        super('An update to your shopping cart has been detected and your available shipping costs have been updated.');

        this.name = 'CartChangedError';
        this.type = 'cart_changed';
    }
}
