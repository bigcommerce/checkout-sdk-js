import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BuyNowCartRequestBody } from '../../../cart';
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
    GooglePayAdyenV3,
    GooglePayAuthorizeNet,
    GooglePayBNZ,
    GooglePayBraintree,
    GooglePayCheckoutcom,
    GooglePayCybersourceV2,
    GooglePayOrbital,
    GooglePayStripe,
    GooglePayStripeUPE,
    GooglePayBraintreeWithBuyNow,
    GooglePayWorldpayAccess,
}

const buyNowCartRequestBody: BuyNowCartRequestBody = {
    source: CartSource.BuyNow,
    lineItems: [
        {
            productId: 1,
            quantity: 2,
            optionSelections: {
                optionId: 11,
                optionValue: 11,
            },
        },
    ],
};

const buyNowOptions = {
    buyNowInitializeOptions: {
        getBuyNowCartRequestBody: () => buyNowCartRequestBody,
    },
};

export function getCheckoutButtonOptions(
    methodId: CheckoutButtonMethodType,
    mode: Mode = Mode.Full,
): CheckoutButtonInitializeOptions {
    const containerId = 'googlePayCheckoutButton';
    const undefinedContainerId = { containerId: '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const googlepayadyenv2 = { googlepayadyenv2: { buttonType: ButtonType.Short } };
    const googlepayadyenv3 = { googlepayadyenv3: { buttonType: ButtonType.Short } };
    const googlepayauthorizenet = { googlepayauthorizenet: { buttonType: ButtonType.Short } };
    const googlepaybnz = { googlepaybnz: { buttonType: ButtonType.Short } };
    const googlepaybraintree = { googlepaybraintree: { buttonType: ButtonType.Short } };
    const googlepaybraintreeWithBuyNow = {
        googlepaybraintree: { buttonType: ButtonType.Short, ...buyNowOptions },
        currencyCode: 'USD',
    };
    const googlepaycheckoutcom = { googlepaycheckoutcom: { buttonType: ButtonType.Short } };
    const googlepaycybersourcev2 = { googlepaycybersourcev2: { buttonType: ButtonType.Short } };
    const googlepayorbital = { googlepayorbital: { buttonType: ButtonType.Short } };
    const googlepaystripe = { googlepaystripe: { buttonType: ButtonType.Short } };
    const googlepaystripeupe = { googlepaystripeupe: { buttonType: ButtonType.Short } };
    const googlepayworldpayaccess = { googlepayworldpayaccess: { buttonType: ButtonType.Short } };

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

        case Mode.GooglePayAdyenV3: {
            return { methodId, containerId, ...googlepayadyenv3 };
        }

        case Mode.GooglePayAuthorizeNet: {
            return { methodId, containerId, ...googlepayauthorizenet };
        }

        case Mode.GooglePayBNZ: {
            return { methodId, containerId, ...googlepaybnz };
        }

        case Mode.GooglePayBraintree: {
            return { methodId, containerId, ...googlepaybraintree };
        }

        case Mode.GooglePayBraintreeWithBuyNow: {
            return { methodId, containerId, ...googlepaybraintreeWithBuyNow };
        }

        case Mode.GooglePayCheckoutcom: {
            return { methodId, containerId, ...googlepaycheckoutcom };
        }

        case Mode.GooglePayCybersourceV2: {
            return { methodId, containerId, ...googlepaycybersourcev2 };
        }

        case Mode.GooglePayOrbital: {
            return { methodId, containerId, ...googlepayorbital };
        }

        case Mode.GooglePayStripe: {
            return { methodId, containerId, ...googlepaystripe };
        }

        case Mode.GooglePayStripeUPE: {
            return { methodId, containerId, ...googlepaystripeupe };
        }

        case Mode.GooglePayWorldpayAccess: {
            return { methodId, containerId, ...googlepayworldpayaccess };
        }

        default: {
            return { methodId, containerId };
        }
    }
}
