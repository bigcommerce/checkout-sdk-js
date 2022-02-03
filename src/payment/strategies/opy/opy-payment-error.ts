import { StandardError } from '../../../common/error/errors';

const defaultMessage: string = 'Unable to proceed because cart data is unavailable or payment for this order has already been made';

export default class OpyError extends StandardError {
    constructor(type: string, name: string, message?: string) {
        super(message || defaultMessage);

        this.type = type;
        this.name = name;
    }
}
