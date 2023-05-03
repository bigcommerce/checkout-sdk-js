import { PaymentMethod } from '../../../payment';
import { getGooglePay } from '../../../payment/payment-methods.mock';
import { CustomerInitializeOptions } from '../../customer-request-options';

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
    UndefinedMethodId,
    InvalidContainer,
    Incomplete,
}

export function getAdyenV2CustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepayadyenv2' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayAdyenV2 = { googlepayadyenv2: { ...container } };
    const googlepayAdyenV2WithInvalidContainer = { googlepayadyenv2: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete: {
            return { ...methodId };
        }

        case Mode.UndefinedMethodId: {
            return { ...undefinedMethodId, ...googlepayAdyenV2 };
        }

        case Mode.InvalidContainer: {
            return { ...methodId, ...googlepayAdyenV2WithInvalidContainer };
        }

        default: {
            return { ...methodId, ...googlepayAdyenV2 };
        }
    }
}

export function getAdyenV3CustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepayadyenv3' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayAdyenV3 = { googlepayadyenv3: { ...container } };
    const googlepayAdyenV3WithInvalidContainer = { googlepayadyenv3: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete: {
            return { ...methodId };
        }

        case Mode.UndefinedMethodId: {
            return { ...undefinedMethodId, ...googlepayAdyenV3 };
        }

        case Mode.InvalidContainer: {
            return { ...methodId, ...googlepayAdyenV3WithInvalidContainer };
        }

        default: {
            return { ...methodId, ...googlepayAdyenV3 };
        }
    }
}

export function getAuthNetCustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepayauthorizenet' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayAuthNet = { googlepayauthorizenet: { ...container } };
    const googlepayAuthNetWithInvalidContainer = { googlepayauthorizenet: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };

        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...googlepayAuthNet };

        case Mode.InvalidContainer:
            return { ...methodId, ...googlepayAuthNetWithInvalidContainer };

        default:
            return { ...methodId, ...googlepayAuthNet };
    }
}

export function getBNZCustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepaybnz' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayBNZ = { googlepaybnz: { ...container } };
    const googlepayBNZWithInvalidContainer = { googlepaybnz: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };

        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...googlepayBNZ };

        case Mode.InvalidContainer:
            return { ...methodId, ...googlepayBNZWithInvalidContainer };

        default:
            return { ...methodId, ...googlepayBNZ };
    }
}

export function getBraintreeCustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepaybraintree' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayBraintree = { googlepaybraintree: { ...container } };
    const googlepayBraintreeWithInvalidContainer = { googlepaybraintree: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete: {
            return { ...methodId };
        }

        case Mode.UndefinedMethodId: {
            return { ...undefinedMethodId, ...googlepayBraintree };
        }

        case Mode.InvalidContainer: {
            return { ...methodId, ...googlepayBraintreeWithInvalidContainer };
        }

        default: {
            return { ...methodId, ...googlepayBraintree };
        }
    }
}

export function getCheckoutcomCustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepaycheckoutcom' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayCheckoutcom = { googlepaycheckoutcom: { ...container } };
    const googlepayCheckoutcomWithInvalidContainer = {
        googlepaycheckoutcom: { ...invalidContainer },
    };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };

        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...googlepayCheckoutcom };

        case Mode.InvalidContainer:
            return { ...methodId, ...googlepayCheckoutcomWithInvalidContainer };

        default:
            return { ...methodId, ...googlepayCheckoutcom };
    }
}

export function getCybersourceV2CustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepaycybersourcev2' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayCybersourceV2 = { googlepaycybersourcev2: { ...container } };
    const googlepayCyberSourceV2WithInvalidContainer = {
        googlepaycybersourcev2: { ...invalidContainer },
    };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };

        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...googlepayCybersourceV2 };

        case Mode.InvalidContainer:
            return { ...methodId, ...googlepayCyberSourceV2WithInvalidContainer };

        default:
            return { ...methodId, ...googlepayCybersourceV2 };
    }
}

export function getOrbitalCustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepayorbital' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayOrbital = { googlepayorbital: { ...container } };
    const googlepayOrbitalWithInvalidContainer = { googlepayorbital: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete:
            return { ...methodId };

        case Mode.UndefinedMethodId:
            return { ...undefinedMethodId, ...googlepayOrbital };

        case Mode.InvalidContainer:
            return { ...methodId, ...googlepayOrbitalWithInvalidContainer };

        default:
            return { ...methodId, ...googlepayOrbital };
    }
}

export function getStripeCustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepaystripe' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayStripe = { googlepaystripe: { ...container } };
    const googlepayStripeWithInvalidContainer = { googlepaystripe: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete: {
            return { ...methodId };
        }

        case Mode.UndefinedMethodId: {
            return { ...undefinedMethodId, ...googlepayStripe };
        }

        case Mode.InvalidContainer: {
            return { ...methodId, ...googlepayStripeWithInvalidContainer };
        }

        default: {
            return { ...methodId, ...googlepayStripe };
        }
    }
}

export function getStripeUPECustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepaystripeupe' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayStripeUPE = { googlepaystripeupe: { ...container } };
    const googlepayStripeUPEWithInvalidContainer = { googlepaystripeupe: { ...invalidContainer } };

    switch (mode) {
        case Mode.Incomplete: {
            return { ...methodId };
        }

        case Mode.UndefinedMethodId: {
            return { ...undefinedMethodId, ...googlepayStripeUPE };
        }

        case Mode.InvalidContainer: {
            return { ...methodId, ...googlepayStripeUPEWithInvalidContainer };
        }

        default: {
            return { ...methodId, ...googlepayStripeUPE };
        }
    }
}

export function getWorldpayAccessCustomerInitializeOptions(
    mode: Mode = Mode.Full,
): CustomerInitializeOptions {
    const methodId = { methodId: 'googlepayworldpayaccess' };
    const undefinedMethodId = { methodId: undefined };
    const container = { container: 'googlePayCheckoutButton' };
    const invalidContainer = { container: 'invalid_container' };
    const googlepayWorldpayAccess = { googlepayworldpayaccess: { ...container } };
    const googlepayWorldpayAccessWithInvalidContainer = {
        googlepayworldpayaccess: { ...invalidContainer },
    };

    switch (mode) {
        case Mode.Incomplete: {
            return { ...methodId };
        }

        case Mode.UndefinedMethodId: {
            return { ...undefinedMethodId, ...googlepayWorldpayAccess };
        }

        case Mode.InvalidContainer: {
            return { ...methodId, ...googlepayWorldpayAccessWithInvalidContainer };
        }

        default: {
            return { ...methodId, ...googlepayWorldpayAccess };
        }
    }
}
