import { PaymentMethod } from '../../../payment';
import { getGooglePay } from '../../../payment/payment-methods.mock';
import { ButtonType } from '../../../payment/strategies/googlepay';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

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
    GooglePayBraintree,
    GooglePayStripe,
}

export function getCheckoutButtonOptions(mode: Mode = Mode.Full): CheckoutButtonInitializeOptions {
    const methodId = { methodId: CheckoutButtonMethodType.GOOGLEPAY_BRAINTREE };
    const containerId = 'googlePayCheckoutButton';
    const undefinedContainerId = { containerId: '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const googlepaybraintree = { googlepaybraintree: { buttonType: ButtonType.Short } };
    const googlepaystripe = { googlepaystripe: { buttonType: ButtonType.Short } };

    switch (mode) {
        case Mode.UndefinedContainer: {
            return { ...methodId, ...undefinedContainerId };
        }
        case Mode.InvalidContainer: {
            return { ...methodId, ...invalidContainerId };
        }
        case Mode.GooglePayBraintree: {
            return { ...methodId, containerId, ...googlepaybraintree };
        }
        case Mode.GooglePayStripe: {
            return { ...methodId, containerId, ...googlepaystripe };
        }
        default: {
            return { ...methodId, containerId };
        }
    }
}
