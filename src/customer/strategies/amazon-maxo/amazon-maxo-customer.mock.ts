import { CustomerInitializeOptions } from '../../customer-request-options';

export enum Mode {
    Full,
    UndefinedMethodId,
    InvalidContainer,
    Incomplete,
}

export function getAmazonMaxoCustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
    const methodId = { methodId: 'amazonmaxo' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'amazonmaxoCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const amazonMaxo = { amazonmaxo: { ...container } };
    const amazonMaxoWithInvalidContainer = { amazonmaxo: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };
        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...amazonMaxo };
        case Mode.InvalidContainer:
            return { ...methodId, ...amazonMaxoWithInvalidContainer };
        default:
            return { ...methodId, ...amazonMaxo };
     }
}
