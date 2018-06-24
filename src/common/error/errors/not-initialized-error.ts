import StandardError from './standard-error';

export enum NotInitializedErrorType {
    CustomerNotInitialized,
    PaymentNotInitialized,
    ShippingNotInitialized,
}

export default class NotInitializedError extends StandardError {
    constructor(
        public subtype: NotInitializedErrorType
    ) {
        super(getErrorMessage(subtype));

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
