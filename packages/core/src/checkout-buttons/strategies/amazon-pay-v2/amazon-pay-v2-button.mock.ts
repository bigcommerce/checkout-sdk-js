import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BuyNowCartRequestBody from '../../../cart/buy-now-cart-request-body';
import {
    AmazonPayV2LedgerCurrency,
    AmazonPayV2Placement,
} from '../../../payment/strategies/amazon-pay-v2';
import { getAmazonPayV2ButtonParamsMock } from '../../../payment/strategies/amazon-pay-v2/amazon-pay-v2.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

export enum Mode {
    Full,
    BuyNowFlow,
    UndefinedContainer,
    InvalidContainer,
    UndefinedMethodId,
    UndefinedAmazonPay,
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

export function getAmazonPayV2CheckoutButtonOptions(
    mode: Mode = Mode.Full,
): CheckoutButtonInitializeOptions {
    const methodId = { methodId: CheckoutButtonMethodType.AMAZON_PAY_V2 };
    const containerId = 'amazonpayCheckoutButton';
    const undefinedContainerId = { containerId: '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const amazonPayV2Options = { containerId, amazonpay: getAmazonPayV2ButtonParamsMock() };

    const amazonPayV2BuyNowOptions = {
        buyNowInitializeOptions: {
            getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
        },
    };

    switch (mode) {
        case Mode.UndefinedContainer:
            return { ...methodId, ...undefinedContainerId };

        case Mode.InvalidContainer:
            return { ...methodId, ...invalidContainerId };

        case Mode.Full:
            return { ...methodId, ...amazonPayV2Options };

        case Mode.UndefinedMethodId:
            return { ...amazonPayV2Options } as CheckoutButtonInitializeOptions;

        case Mode.UndefinedAmazonPay:
            return { ...getAmazonPayV2CheckoutButtonOptions(Mode.Full), amazonpay: undefined };

        case Mode.BuyNowFlow:
            return {
                ...methodId,
                containerId,
                amazonpay: {
                    ...amazonPayV2BuyNowOptions,
                    merchantId: '',
                    placement: AmazonPayV2Placement.Checkout,
                    ledgerCurrency: AmazonPayV2LedgerCurrency.USD,
                },
            };

        default:
            return { ...methodId, containerId };
    }
}
