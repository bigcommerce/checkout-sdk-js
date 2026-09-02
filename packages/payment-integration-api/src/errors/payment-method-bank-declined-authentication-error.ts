import StandardError from './standard-error';

export default class PaymentMethodBankDeclinedAuthenticationError extends StandardError {
    constructor() {
        super('Your bank declined authentication, please use a different card.');

        this.name = 'PaymentMethodBankDeclinedAuthenticationError';
        this.type = 'bank_declined_authentication';
    }
}
