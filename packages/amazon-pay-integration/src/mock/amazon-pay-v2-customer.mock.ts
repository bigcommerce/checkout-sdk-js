import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

export enum Mode {
    Full,
    UndefinedMethodId,
    InvalidContainer,
    Incomplete,
}

export function getAmazonPayV2CustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const optionsWithMethodId = { methodId: 'amazonpay' };
    const optionsWithUndefinedMethodId = { methodId: undefined };
    const optionsWithContainer = { container: 'amazonpayCheckoutButton' };
    const optionsWithInvalidContainer = { container: 'invalid_container' };
    const amazonPayV2 = { amazonpay: optionsWithContainer };
    const amazonPayV2WithInvalidContainer = { amazonpay: optionsWithInvalidContainer };

    switch (mode) {
        case Mode.Incomplete:
            return { ...optionsWithMethodId };

        case Mode.UndefinedMethodId:
            return { ...optionsWithUndefinedMethodId, ...amazonPayV2 };

        case Mode.InvalidContainer:
            return { ...optionsWithMethodId, ...amazonPayV2WithInvalidContainer };

        default:
            return { ...optionsWithMethodId, ...amazonPayV2 };
    }
}
