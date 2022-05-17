import { StandardError } from '../../common/error/errors';

/**
 * Checkout prevents consumers from placing their orders when a merchant wishes
 * to be able to block transactions if the automated tax provider cannot be reached.
 */
export default class OrderTaxProviderUnavailableError extends StandardError {
    constructor(message?: string) {
        super(message || 'The tax provider is unavailable.');

        this.name = 'OrderTaxProviderUnavailableError';
        this.type = 'tax_provider_unavailable';
    }
}
