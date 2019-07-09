import { InvalidArgumentError } from '../../common/error/errors';

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
