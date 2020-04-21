import { CustomerInitializeOptions } from '../../customer-request-options';

export enum Mode {
    Full,
    UndefinedMethodId,
    InvalidContainer,
    Incomplete,
}

export function getAmazonPayV2CustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
    const methodId = { methodId: 'amazonpay' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'amazonpayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const amazonPayV2 = { amazonpay: { ...container } };
    const amazonPayV2WithInvalidContainer = { amazonpay: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };
        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...amazonPayV2 };
        case Mode.InvalidContainer:
            return { ...methodId, ...amazonPayV2WithInvalidContainer };
        default:
            return { ...methodId, ...amazonPayV2 };
     }
}
