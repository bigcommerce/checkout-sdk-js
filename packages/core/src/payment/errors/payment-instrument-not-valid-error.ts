import { InvalidArgumentError } from '../../common/error/errors';

/**
 * This error should be thrown when the selected instrument is not in the list
 * of valid instruments or the type doesn't match the expected type.
 */
export default class PaymentInstrumentNotValidError extends InvalidArgumentError {
    constructor(message?: string) {
        super(message || 'The selected instrument is either missing or not a valid type.');

        this.name = 'PaymentInstrumentNotValidError';
    }
}
