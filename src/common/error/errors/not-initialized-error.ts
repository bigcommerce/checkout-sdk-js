import { getEnvironment, toSingleLine } from '../../utility';

import StandardError from './standard-error';

export enum NotInitializedErrorType {
    CustomerNotInitialized,
    PaymentNotInitialized,
    ShippingNotInitialized,
}

export default class NotInitializedError extends StandardError {
    constructor(
        type: NotInitializedErrorType,
        isDevelopment = getEnvironment() === 'development'
    ) {
        const debugMessage = isDevelopment && getDebugMessage(type);
        const message = debugMessage ? `${getErrorMessage(type)}\n\n${debugMessage}` : getErrorMessage(type);

        super(message);

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

    default:
        return 'Unable to proceed because the required component has not been initialized.';
    }
}

function getDebugMessage(type: NotInitializedErrorType): string | undefined {
    switch (type) {
    case NotInitializedErrorType.CustomerNotInitialized:
        return toSingleLine(`
            In order to initialize the customer step of checkout, you need to call
            \`CheckoutService#initializeCustomer\`. Afterwards, you should be able to
            submit customer details.
        `);

    case NotInitializedErrorType.PaymentNotInitialized:
        return toSingleLine(`
            In order to initialize the payment step of checkout, you need to call
            \`CheckoutService#initializePayment\`. Afterwards, you should be able to
            submit payment details.
        `);

    case NotInitializedErrorType.ShippingNotInitialized:
        return toSingleLine(`
            In order to initialize the shipping step of checkout, you need to call
            \`CheckoutService#initializeShipping\`. Afterwards, you should be able to
            submit shipping details.
        `);
    }
}
