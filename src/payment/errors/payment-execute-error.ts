import { StandardError } from '../../common/error/errors';

const defaultMessage: string = 'Payment cannot be processed for this order, please select another payment method';

export default class PaymentExecuteError extends StandardError {
    type = 'custom_provider_execute_error';
    subtype: string;

    constructor(subtype: string, name: string, message?: string) {
        super(message || defaultMessage);

        this.name = name;
        this.subtype = subtype;
    }
}
