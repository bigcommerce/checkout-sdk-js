
import PaymentMethod from '../../../payment/payment-method';
import { getGooglePay } from '../../../payment/payment-methods.mock';
import { CustomerInitializeOptions } from '../../customer-request-options';

export function getPaymentMethod(): PaymentMethod {
    return {
        ...getGooglePay(),
        initializationData: {
            checkoutId: 'checkoutId',
            allowedCardTypes: ['visa', 'amex', 'mastercard'],
        },
    };
}

export enum Mode {
    Full,
    UndefinedMethodId,
    InvalidContainer,
    Incomplete,
}

export function getCustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepaybraintree' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayBraintree = { googlepaybraintree: { ...container } };
    const googlepayBraintreeWithInvalidContainer = { googlepaybraintree: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete: {
            return { ...methodId };
        }
        case Mode.UndefinedMethodId: {
            return { ...undefinedMethodId, ...googlepayBraintree };
        }
        case Mode.InvalidContainer: {
            return { ...methodId, ...googlepayBraintreeWithInvalidContainer };
        }
        default: {
            return { ...methodId, ...googlepayBraintree };
        }
     }
}
