import { StandardError } from '../../../common/error/errors';

const defaultMessage =
    'There was an error while processing your payment. Please try again or contact us.';

export default class DigitalRiverError extends StandardError {
    constructor(type: string, name: string, message?: string) {
        super(message || defaultMessage);

        this.type = type;
        this.name = name;
    }
}
