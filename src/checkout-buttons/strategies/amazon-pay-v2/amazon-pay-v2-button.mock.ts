import { getAmazonPayV2ButtonParamsMock } from '../../../payment/strategies/amazon-pay-v2/amazon-pay-v2.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

export enum Mode {
    Full,
    UndefinedContainer,
    InvalidContainer,
    UndefinedMethodId,
    UndefinedAmazonPay,
}

export function getAmazonPayV2CheckoutButtonOptions(mode: Mode = Mode.Full): CheckoutButtonInitializeOptions {
    const methodId = { methodId: CheckoutButtonMethodType.AMAZON_PAY_V2 };
    const containerId = 'amazonpayCheckoutButton';
    const undefinedContainerId = { containerId: '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const amazonPayV2Options = { containerId, amazonpay: getAmazonPayV2ButtonParamsMock() };

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
        default:
            return { ...methodId, containerId };
    }
}
