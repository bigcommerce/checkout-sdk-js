import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { getCustomer } from '../../../customer/customers.mock';
import { OrderRequestBody } from '../../../order';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';

import {
    StripeHandleCardPaymentOptions,
    StripePaymentIntentResponse,
    StripePaymentMethodData,
    StripeV3Client
} from './stripev3';

export function getStripeV3JsMock(): StripeV3Client {
    return {
        elements: jest.fn(() => {
            return {
                create: jest.fn(() => {
                    return {
                        mount: jest.fn(),
                        unmount: jest.fn(),
                    };
                }),
            };
        }),
        handleCardPayment: jest.fn(),
        createPaymentMethod: jest.fn(),
    };
}

export function getStripeV3InitializeOptionsMock(): PaymentInitializeOptions {
    return {
        methodId: 'stripev3',
        stripev3: {
            containerId: 'stripeContainerId',
            style: {
                base: {
                    color: '#32325D',
                    fontWeight: 500,
                    fontFamily: 'Inter UI, Open Sans, Segoe UI, sans-serif',
                    fontSize: '16px',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                        color: '#CFD7DF',
                    },
                },
                invalid: {
                    color: '#E25950',
                },
            },
        },
    };
}

export function getStripeV3OrderRequestBodyMock(): OrderRequestBody {
    return {
        payment: {
            methodId: 'stripev3',
            paymentData: {
                shouldSaveInstrument: false,
            },
        },
    };
}

export function getStripeV3HandleCardResponse(): StripePaymentIntentResponse {
    return {
        paymentIntent: {
            id: 'pi_1234',
        },
    };
}

export function getStripePaymentMethodOptionsWithSignedUser(): StripePaymentMethodData {
    const billingAddress = getBillingAddress();
    const customer = getCustomer();

    return {
        billing_details: {
            address: {
                city: billingAddress.city,
                country: billingAddress.countryCode,
                line1: billingAddress.address1,
                line2: billingAddress.address2,
                postal_code: billingAddress.postalCode,
                state: billingAddress.stateOrProvinceCode,
            },
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
        },
    };
}

export function getStripePaymentMethodOptionsWithGuestUser(): StripePaymentMethodData {
    const billingAddress = getBillingAddress();

    return {
        billing_details: {
            address: {
                city: billingAddress.city,
                country: billingAddress.countryCode,
                line1: billingAddress.address1,
                line2: billingAddress.address2,
                postal_code: billingAddress.postalCode,
                state: billingAddress.stateOrProvinceCode,
            },
            email: billingAddress.email,
            name: `${billingAddress.firstName} ${billingAddress.lastName}`,
        },
    };
}

export function getStripePaymentMethodOptionsWithGuestUserWithoutAddress(): StripePaymentMethodData {
    return {
        billing_details: {
            name: 'Guest',
        },
    };
}

export function getStripeCardPaymentOptionsWithSignedUser(): StripeHandleCardPaymentOptions {
    const customer = getCustomer();
    const shippingAddress = getShippingAddress();

    return {
        shipping: {
            address: {
                city: shippingAddress.city,
                country: shippingAddress.countryCode,
                line1: shippingAddress.address1,
                line2: shippingAddress.address2,
                postal_code: shippingAddress.postalCode,
                state: shippingAddress.stateOrProvinceCode,
            },
            name: `${customer.firstName} ${customer.lastName}`,
        },
        receipt_email: customer.email,
        save_payment_method: false,
    };
}

export function getStripeCardPaymentOptionsWithGuestUser(): StripeHandleCardPaymentOptions {
    const shippingAddress = getShippingAddress();

    return {
        shipping: {
            address: {
                city: shippingAddress.city,
                country: shippingAddress.countryCode,
                line1: shippingAddress.address1,
                line2: shippingAddress.address2,
                postal_code: shippingAddress.postalCode,
                state: shippingAddress.stateOrProvinceCode,
            },
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        },
    };
}

export function getStripeCardPaymentOptionsWithGuestUserWithoutAddress(): StripeHandleCardPaymentOptions {
    return {
        shipping: {
            address: { },
            name: 'Guest',
        },
    };
}
