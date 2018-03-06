import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutAccountInvalidError extends StandardError {
    /**
     * @constructor
     * @param {any} error
     */
    constructor(error) {
        super('Please contact the seller for assistance or choose another checkout method.');

        this.type = 'remote_checkout_account_invalid';
        this.error = error;
    }
}
