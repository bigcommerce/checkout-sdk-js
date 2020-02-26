import { RequestError } from '../../common/error/errors';

/**
 * This error should be thrown when the customer fails to be updated
 */
export default class UpdateCustomerError extends RequestError {
    constructor(response?: Response) {
        super(response);

        this.name = 'UpdateCustomerError';
        this.type = 'update_customer';
    }
}
