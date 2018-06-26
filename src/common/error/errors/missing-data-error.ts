import StandardError from './standard-error';

export enum MissingDataErrorType {
    MissingBillingAddress,
    MissingCart,
    MissingCheckout,
    MissingCheckoutConfig,
    MissingOrder,
    MissingOrderConfig,
    MissingOrderId,
    MissingPaymentMethod,
    MissingShippingAddress,
}

export default class MissingDataError extends StandardError {
    constructor(
        public subtype: MissingDataErrorType
    ) {
        super(getErrorMessage(subtype));

        this.type = 'missing_data';
    }
}

function getErrorMessage(type: MissingDataErrorType): string {
    switch (type) {
    case MissingDataErrorType.MissingBillingAddress:
        return 'Unable to proceed because billing address data is unavailable or not provided.';

    case MissingDataErrorType.MissingCart:
        return 'Unable to proceed because cart data is unavailable.';

    case MissingDataErrorType.MissingCheckout:
        return 'Unable to proceed because checkout data is unavailable.';

    case MissingDataErrorType.MissingCheckoutConfig:
    case MissingDataErrorType.MissingOrderConfig:
        return 'Unable to proceed because configuration data is unavailable.';

    case MissingDataErrorType.MissingOrder:
        return 'Unable to proceed because order data is unavailable.';

    case MissingDataErrorType.MissingOrderId:
        return 'Unable to proceed because order ID is unavailable or not generated yet.';

    case MissingDataErrorType.MissingPaymentMethod:
        return 'Unable to proceed because payment method data is unavailable or not properly configured.';

    case MissingDataErrorType.MissingShippingAddress:
        return 'Unable to proceed because shipping address data is unavailable or not provided.';

    default:
        return 'Unable to proceed because the required data is unavailable.';
    }
}
