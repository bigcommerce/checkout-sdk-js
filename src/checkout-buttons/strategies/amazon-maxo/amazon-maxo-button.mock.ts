import { getAmazonMaxoButtonParamsMock } from '../../../payment/strategies/amazon-maxo/amazon-maxo.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

export enum Mode {
    Full,
    UndefinedContainer,
    InvalidContainer,
}

export function getAmazonMaxoCheckoutButtonOptions(mode: Mode = Mode.Full): CheckoutButtonInitializeOptions {
    const methodId = { methodId: CheckoutButtonMethodType.AMAZON_MAXO };
    const containerId = 'amazonmaxoCheckoutButton';
    const undefinedContainerId = { containerId: '' };
    const invalidContainerId = { containerId: 'invalid_container' };
    const amazonMaxoOptions = { containerId, getAmazonMaxoButtonParamsMock };

    switch (mode) {
        case Mode.UndefinedContainer:
            return { ...methodId, ...undefinedContainerId };
        case Mode.InvalidContainer:
            return { ...methodId, ...invalidContainerId };
        case Mode.Full:
            return { ...methodId, ...amazonMaxoOptions };
        default:
            return { ...methodId, containerId };
    }
}
