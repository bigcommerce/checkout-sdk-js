import { CustomerInitializeOptions } from '../../customer-request-options';

export enum Mode {
    Full,
    UndefinedMethodId,
    InvalidContainer,
    Incomplete,
}

export function getAmazonPayv2CustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
    const methodId = { methodId: 'amazonpay' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'amazonpayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const amazonPayv2 = { amazonpay: { ...container } };
    const amazonPayv2WithInvalidContainer = { amazonpay: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };
        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...amazonPayv2 };
        case Mode.InvalidContainer:
            return { ...methodId, ...amazonPayv2WithInvalidContainer };
        default:
            return { ...methodId, ...amazonPayv2 };
     }
}
