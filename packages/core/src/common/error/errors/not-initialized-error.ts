import StandardError from './standard-error';

export enum NotInitializedErrorType {
    CheckoutButtonNotInitialized,
    CustomerNotInitialized,
    PaymentNotInitialized,
    ShippingNotInitialized,
    SpamProtectionNotInitialized,
}

/**
 * Throw this error if a method requires a certain initialization call to be
 * made first. Some objects can be constructed but they cannot be used until a
 * separate initialization call is made.
 */
export default class NotInitializedError extends StandardError {
    constructor(
        public subtype: NotInitializedErrorType
    ) {
        super(getErrorMessage(subtype));

        this.name = 'NotInitializedError';
        this.type = 'not_initialized';
    }
}

function getErrorMessage(type: NotInitializedErrorType): string {
    switch (type) {
    case NotInitializedErrorType.CustomerNotInitialized:
        return 'Unable to proceed because the customer step of checkout has not been initialized.';

    case NotInitializedErrorType.PaymentNotInitialized:
        return 'Unable to proceed because the payment step of checkout has not been initialized.';

    case NotInitializedErrorType.ShippingNotInitialized:
        return 'Unable to proceed because the shipping step of checkout has not been initialized.';

    case NotInitializedErrorType.SpamProtectionNotInitialized:
        return 'Unable to proceed because the checkout spam protection has not been initialized.';

    default:
        return 'Unable to proceed because the required component has not been initialized.';
    }
}
