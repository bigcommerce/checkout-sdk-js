
import { PaymentMethod } from '../../../payment';
import { getGooglePay } from '../../../payment/payment-methods.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import { CheckoutButtonMethodType } from '../checkout-button-method-type';

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
    UndefinedContainer,
    InvalidContainer,
}

export function getCheckoutButtonOptions(mode: Mode = Mode.Full): CheckoutButtonInitializeOptions {
    const methodId = { methodId: CheckoutButtonMethodType.GOOGLEPAY_BRAINTREE };
    const containerId = 'googlePayCheckoutButton';
    const undefinedContainerId = { containerId : '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const googlepay = { googlepaybraintree: { } };

    switch (mode) {
        case Mode.UndefinedContainer: {
            return { ...methodId, ...undefinedContainerId };
        }
        case Mode.InvalidContainer: {
            return { ...methodId, ...invalidContainerId };
        }
        default: {
            return { ...methodId, containerId, ...googlepay };
        }
    }
}
