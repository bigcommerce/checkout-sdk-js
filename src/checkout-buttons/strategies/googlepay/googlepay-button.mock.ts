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
    GooglePayAdyenV2,
    GooglePayAuthorizeNet,
    GooglePayBraintree,
    GooglePayCheckoutcom,
    GooglePayStripe,
}

export function getCheckoutButtonOptions(methodId: CheckoutButtonMethodType, mode: Mode = Mode.Full): CheckoutButtonInitializeOptions {
    const containerId = 'googlePayCheckoutButton';
    const undefinedContainerId = { containerId: '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const googlepayadyenv2 = { googlepayadyenv2: { buttonType: ButtonType.Short } };
    const googlepayauthorizenet = { googlepaybraintree: { buttonType: ButtonType.Short } };
    const googlepaybraintree = { googlepaybraintree: { buttonType: ButtonType.Short } };
    const googlepaycheckoutcom = { googlepaycheckoutcom: { buttonType: ButtonType.Short } };
    const googlepaystripe = { googlepaystripe: { buttonType: ButtonType.Short } };

    switch (mode) {
        case Mode.UndefinedContainer: {
            return { methodId, ...undefinedContainerId };
        }
        case Mode.InvalidContainer: {
            return { methodId, ...invalidContainerId };
        }
        case Mode.GooglePayAdyenV2: {
            return { methodId, containerId, ...googlepayadyenv2 };
        }
        case Mode.GooglePayAuthorizeNet: {
            return { methodId, containerId, ...googlepayauthorizenet };
        }
        case Mode.GooglePayBraintree: {
            return { methodId, containerId, ...googlepaybraintree };
        }
        case Mode.GooglePayCheckoutcom: {
            return { methodId, containerId, ...googlepaycheckoutcom };
        }
        case Mode.GooglePayStripe: {
            return { methodId, containerId, ...googlepaystripe };
        }
        default: {
            return { methodId, containerId };
        }
    }
}
