import { InvalidArgumentError } from '../../common/error/errors';

/**
 * This error should be thrown when we are unable to submit a payment because
 * the caller has not provided all the required fields, i.e.: if an argument is
 * missing or it is not the expected data type.
 */
export default class PaymentArgumentInvalidError extends InvalidArgumentError {
    constructor(invalidFields?: string[]) {
        let message = 'Unable to submit payment for the order because the payload is invalid.';

        if (invalidFields) {
            message = `${message} Make sure the following fields are provided correctly: ${invalidFields.join(', ')}.`;
        }

        super(message);

        this.name = 'PaymentArgumentInvalidError';
    }
}
