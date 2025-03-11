import { StandardError } from '../../common/error/errors';

export default class MissingShippingMethodError extends StandardError {
    constructor(message: string) {
        super(message);

        this.name = 'MissingShippingMethodError';
        this.type = 'missing_shipping_method';
    }
}
