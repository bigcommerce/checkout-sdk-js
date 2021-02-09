import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { OrderRequestBody } from '../../../order';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { IndividualCardElementOptions, StripeV3PaymentInitializeOptions } from './index';
import { PaymentMethodCreateParams, StripeBillingDetails, StripeConfirmCardPaymentData, StripeElementType, StripeShippingAddress, StripeV3Client } from './stripev3';

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
                getElement: jest.fn().mockReturnValue(null),
            };
        }),
        confirmAlipayPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        confirmIdealPayment: jest.fn(),
        confirmSepaDebitPayment: jest.fn(),
        createPaymentMethod: jest.fn(),
        handleCardAction: jest.fn(),
    };
}

export function getFailingStripeV3JsMock(): StripeV3Client {
    return {
        elements: jest.fn(() => {
            return {
                create: jest.fn(() => {
                    return {
                        mount: jest.fn(() => {
                            throw new Error();
                        }),
                        unmount: jest.fn(),
                    };
                }),
                getElement: jest.fn().mockReturnValue(null),
            };
        }),
        confirmAlipayPayment: jest.fn(),
        confirmCardPayment: jest.fn(),
        confirmIdealPayment: jest.fn(),
        confirmSepaDebitPayment: jest.fn(),
        createPaymentMethod: jest.fn(),
        handleCardAction: jest.fn(),
    };
}

export function getStripeV3InitializeOptionsMock(stripeElementType: StripeElementType = StripeElementType.CreditCard): PaymentInitializeOptions {
    return {
        methodId: stripeElementType,
        stripev3: {
            containerId: `stripe-${stripeElementType}-component-field`,
            options: {
                classes: {
                    base: 'form-input optimizedCheckout-form-input',
                },
            },
        },
    };
}

export function getStripeV3InitializeOptionsMockSingleElements(includeZipCode: boolean = false): PaymentInitializeOptions {
    const paymentInitializeOptions: PaymentInitializeOptions = {
        methodId: 'card',
    };

    const stripeV3PaymentInitializeOptions: StripeV3PaymentInitializeOptions = {
        containerId: 'stripe-card-component-field',
    };

    const individualCardElementOptions: IndividualCardElementOptions = {
        cardCvcElementOptions: {
            containerId: 'stripe-cvc-component-field',
            classes: {
                base: 'form-input optimizedCheckout-form-input',
            },
            placeholder: 'CVV',
        },
        cardExpiryElementOptions: {
            containerId: 'stripe-expiry-component-field',
            classes: {
                base: 'form-input optimizedCheckout-form-input',
            },
            placeholder: 'MM / YY',
        },
        cardNumberElementOptions: {
            containerId: 'stripe-number-component-field',
            classes: {
                base: 'form-input optimizedCheckout-form-input',
            },
            placeholder: 'Card number',
            showIcon: true,
        },
    };

    if (includeZipCode) {
        return {
            ...paymentInitializeOptions,
            stripev3: {
                ...stripeV3PaymentInitializeOptions,
                options: {
                    ...individualCardElementOptions,
                    zipCodeElementOptions: { containerId: 'stripe-postal-code-component-field' },
                },
            },
        };
    }

    return {
        ...paymentInitializeOptions,
        stripev3: {
            ...stripeV3PaymentInitializeOptions,
            options: individualCardElementOptions,
        },
    };
}

export function getStripeV3OrderRequestBodyMock(stripeElementType: StripeElementType = StripeElementType.CreditCard, shouldSaveInstrument: boolean = false): OrderRequestBody {
    return {
        payment: {
            methodId: stripeElementType,
            paymentData: {
                shouldSaveInstrument,
            },
        },
    };
}

export function getStripeV3OrderRequestBodyVaultMock(stripeElementType: StripeElementType = StripeElementType.CreditCard, shouldSetAsDefaultInstrument: boolean = false): OrderRequestBody {
    return {
        payment: {
            methodId: stripeElementType,
            paymentData: {
                instrumentId: 'token',
                shouldSetAsDefaultInstrument,
            },
        },
    };
}

export function getConfirmPaymentResponse(): unknown {
    return {
        paymentIntent: {
            id: 'pi_1234',
        },
    };
}

export function getWrongPaymentResponse(): unknown {
    return {
        paymentIntent: {
            otherKey: 'other_value',
        },
    };
}

export function getWrongPaymentMethodResponse(): unknown {
    return {
        paymentMethod: {
            otherKey: 'other_value',
        },
    };
}

export function getPaymentMethodResponse(): unknown {
    return {
        paymentMethod: {
            id: 'pm_1234',
        },
    };
}

export function getStripePaymentMethodOptionsWithGuestUserWithoutAddress(): PaymentMethodCreateParams {
    return {
        billing_details: {
            address: { line1: '' },
            name: 'Guest',
        },
    };
}

export function getStripeShippingAddress(): StripeShippingAddress {
    const shippingAddress = getShippingAddress();

    return {
        address: {
            city: shippingAddress.city,
            country: shippingAddress.countryCode,
            line1: shippingAddress.address1,
            line2: shippingAddress.address2,
            postal_code: shippingAddress.postalCode,
            state: shippingAddress.stateOrProvinceCode,
        },
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        phone: shippingAddress.phone,
    };
}

export function getStripeBillingAddress(): StripeBillingDetails {
    const billingAddress = getBillingAddress();

    return {
        address: {
            city: billingAddress.city,
            country: billingAddress.countryCode,
            line1: billingAddress.address1,
            line2: billingAddress.address2,
            postal_code: billingAddress.postalCode,
            state: billingAddress.stateOrProvinceCode,
        },
        name: `${billingAddress.firstName} ${billingAddress.lastName}`,
        email: billingAddress.email,
        phone: billingAddress.phone,
    };
}

export function getStripeBillingAddressWithoutPhone(): StripeBillingDetails {
    const billingAddress = getBillingAddress();

    return {
        address: {
            city: billingAddress.city,
            country: billingAddress.countryCode,
            line1: billingAddress.address1,
            line2: billingAddress.address2,
            postal_code: billingAddress.postalCode,
            state: billingAddress.stateOrProvinceCode,
        },
        name: `${billingAddress.firstName} ${billingAddress.lastName}`,
        email: billingAddress.email,
    };
}

export function getStripeShippingAddressGuestUserWithoutAddress(): StripeConfirmCardPaymentData {
    return {
        shipping: {
            address: { line1: '' },
            name: 'Guest',
        },
    };
}
