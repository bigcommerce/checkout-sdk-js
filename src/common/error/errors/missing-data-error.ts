import { getEnvironment, toSingleLine } from '../../utility';

import StandardError from './standard-error';

export enum MissingDataErrorType {
    MissingBillingAddress,
    MissingCart,
    MissingCheckout,
    MissingConfig,
    MissingOrder,
    MissingPaymentMethod,
    MissingShippingAddress,
}

export default class MissingDataError extends StandardError {
    constructor(
        type: MissingDataErrorType,
        isDevelopment = getEnvironment() === 'development'
    ) {
        const debugMessage = isDevelopment && getDebugMessage(type);
        const message = debugMessage ? `${getErrorMessage(type)}\n\n${debugMessage}` : getErrorMessage(type);

        super(message);

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

    case MissingDataErrorType.MissingConfig:
        return 'Unable to proceed because configuration data is unavailable.';

    case MissingDataErrorType.MissingOrder:
        return 'Unable to proceed because order data is unavailable.';

    case MissingDataErrorType.MissingPaymentMethod:
        return 'Unable to proceed because payment method data is unavailable or not properly configured.';

    case MissingDataErrorType.MissingShippingAddress:
        return 'Unable to proceed because shipping address data is unavailable or not provided.';

    default:
        return 'Unable to proceed because the required data is unavailable.';
    }
}

function getDebugMessage(type: MissingDataErrorType): string | undefined {
    switch (type) {
    case MissingDataErrorType.MissingBillingAddress:
    case MissingDataErrorType.MissingShippingAddress:
        return toSingleLine(`
            The data could be unavailable because it has not loaded from the server, or
            provided by the customer yet. To fix the former issue, you can try calling
            \`CheckoutService#loadCheckout\` before performing the same action again.
        `);

    case MissingDataErrorType.MissingCart:
    case MissingDataErrorType.MissingCheckout:
        return toSingleLine(`
            The data could be unavailable because it has not loaded from the server yet.
            To fix this issue, you can try calling \`CheckoutService#loadCheckout\`
            before performing the same action again.
        `);

    case MissingDataErrorType.MissingConfig:
        return toSingleLine(`
            The data could be unavailable because it has not loaded from the server yet.
            To fix this issue, you need to make sure \`CheckoutService\` is initialized
            properly before performing any other actions.
        `);

    case MissingDataErrorType.MissingOrder:
        return toSingleLine(`
            The data could be unavailable because it has not loaded from the server yet.
            To fix this issue, you can try calling \`CheckoutService#loadOrder\`
            before performing the same action again.
        `);

    case MissingDataErrorType.MissingPaymentMethod:
        return toSingleLine(`
            The data could be unavailable because it has not loaded from the server, or
            configured by the merchant yet. To fix the former issue, you can try calling
            \`CheckoutService#loadPaymentMethods\` before performing the same action again.
        `);
    }
}
