import { StandardError } from '../../common/error/errors';

export default class InvalidShippingAddressError extends StandardError {
    constructor(message: string) {
        super(message);

        this.name = 'InvalidShippingAddressError';
        this.type = 'invalid_shipping_address';
    }
}
