import { getAmazonPayv2ButtonParamsMock } from '../../../payment/strategies/amazon-payv2/amazon-payv2.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

export enum Mode {
    Full,
    UndefinedContainer,
    InvalidContainer,
}

export function getAmazonPayv2CheckoutButtonOptions(mode: Mode = Mode.Full): CheckoutButtonInitializeOptions {
    const methodId = { methodId: CheckoutButtonMethodType.AMAZON_PAY_V2 };
    const containerId = 'amazonpayCheckoutButton';
    const undefinedContainerId = { containerId: '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const amazonPayv2Options = { containerId, getAmazonPayv2ButtonParamsMock };

    switch (mode) {
        case Mode.UndefinedContainer:
            return { ...methodId, ...undefinedContainerId };
        case Mode.InvalidContainer:
            return { ...methodId, ...invalidContainerId };
        case Mode.Full:
            return { ...methodId, ...amazonPayv2Options };
        default:
            return { ...methodId, containerId };
    }
}
