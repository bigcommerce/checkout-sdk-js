import {
    AmazonPayV2LedgerCurrency,
    AmazonPayV2Placement,
    getAmazonPayV2ButtonParamsMock,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    BuyNowCartRequestBody,
    CartSource,
    CheckoutButtonInitializeOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

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
    const methodId = { methodId: 'amazonpay' };
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
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return { ...amazonPayV2Options } as unknown as CheckoutButtonInitializeOptions;

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
