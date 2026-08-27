import StandardError from './standard-error';

/**
 * This error should be thrown when a shopper's bank declines 3DS
 * authentication (e.g.: a PayPal `liabilityShift` of `NO` or `UNKNOWN`).
 * The decline is issuer-side, so retrying with the same card in the same
 * session will not succeed and the shopper should use a different card.
 */
export default class PaymentMethodBankDeclinedAuthenticationError extends StandardError {
    constructor() {
        super('Your bank declined authentication, please use a different card.');

        this.name = 'PaymentMethodBankDeclinedAuthenticationError';
        this.type = 'bank_declined_authentication';
    }
}
