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

export function getAdyenV2CustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
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

export function getAuthNetCustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
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

export function getBraintreeCustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
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

export function getStripeCustomerInitializeOptions(mode: Mode = Mode.Full): CustomerInitializeOptions {
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
