import StandardError from './standard-error';

/**
 * This error should be thrown when a shopper tries to sign in as a guest but
 * they are already signed in as a registered customer.
 */
export default class BuyNowCartCreationError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'An unexpected error has occurred during buy now cart creation process. Please try again later.',
        );

        this.name = 'BuyNowCartCreationError';
        this.type = 'buy_now_cart_creation_error';
    }
}
