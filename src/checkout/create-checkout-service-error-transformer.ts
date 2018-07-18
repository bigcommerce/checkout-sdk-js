import { ErrorMessageTransformer } from '../common/error';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../common/error/errors';
import { getEnvironment } from '../common/utility';

export type CheckoutServiceErrorType = MissingDataError | NotInitializedError;
export type CheckoutServiceErrorTransformer = ErrorMessageTransformer<CheckoutServiceErrorType | Error>;

export default function createCheckoutServiceErrorTransformer(
    isDevelopment: boolean = getEnvironment() === 'development'
): CheckoutServiceErrorTransformer {
    return new ErrorMessageTransformer(error => {
        if (!isDevelopment || !isCheckoutServiceError(error)) {
            return error.message;
        }

        switch (error.subtype || error.type) {
        case MissingDataErrorType.MissingConsignments:
            return `
                ${error.message}
                The data could be unavailable because no shipping address has been provided.
                To fix this, create a consignment or update the shipping address before performing
                the same action again.
            `;

        case MissingDataErrorType.MissingCart:
        case MissingDataErrorType.MissingCheckout:
            return `
                ${error.message}
                The data could be unavailable because it has not loaded from the server yet.
                To fix this issue, you can try calling \`CheckoutService#loadCheckout\`
                before performing the same action again.
            `;

        case MissingDataErrorType.MissingCheckoutConfig:
            return `
                ${error.message}
                The data could be unavailable because it has not loaded from the server yet.
                To fix this issue, you need to make sure \`CheckoutService\` is initialized
                properly by calling \`CheckoutService#loadCheckout\` before performing any
                other actions.
            `;

        case MissingDataErrorType.MissingOrder:
            return `
                ${error.message}
                The data could be unavailable because it has not loaded from the server yet.
                To fix this issue, you can try calling \`CheckoutService#loadOrder\`
                before performing the same action again.
            `;

        case MissingDataErrorType.MissingOrderId:
            return `
                ${error.message}
                The data could be unavailable because no order has been created yet. You have
                to first create the order before you can perform the action.
            `;

        case MissingDataErrorType.MissingPaymentMethod:
            return `
                ${error.message}
                The data could be unavailable because it has not loaded from the server, or
                configured by the merchant yet. To fix the former issue, you can try calling
                \`CheckoutService#loadPaymentMethods\` before performing the same action again.
            `;

        case NotInitializedErrorType.CustomerNotInitialized:
            return `
                In order to initialize the customer step of checkout, you need to call
                \`CheckoutService#initializeCustomer\`. Afterwards, you should be able to
                submit customer details.
            `;

        case NotInitializedErrorType.PaymentNotInitialized:
            return `
                ${error.message}
                In order to initialize the payment step of checkout, you need to call
                \`CheckoutService#initializePayment\`. Afterwards, you should be able to
                submit payment details.
            `;

        case NotInitializedErrorType.ShippingNotInitialized:
            return `
                ${error.message}
                In order to initialize the shipping step of checkout, you need to call
                \`CheckoutService#initializeShipping\`. Afterwards, you should be able to
                submit shipping details.
            `;

        default:
            return error.message;
        }
    });
}

function isCheckoutServiceError(error: any): error is CheckoutServiceErrorType {
    return !!(error.subtype || error.type);
}
