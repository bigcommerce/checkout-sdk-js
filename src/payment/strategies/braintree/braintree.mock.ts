import { Payment } from '../..';
import { getPayment } from '../../payments.mock';

import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeModule,
    BraintreeModuleCreator,
    BraintreeRequestData,
    BraintreeThreeDSecure,
    BraintreeTokenizeResponse,
    BraintreeVerifyPayload,
    BraintreeVisaCheckout,
} from './braintree';
import { BraintreeThreeDSecureOptions } from './braintree-payment-options';

export function getClientMock(): BraintreeClient {
    return {
        request: jest.fn(),
        getVersion: jest.fn(),
    };
}

export function getDataCollectorMock(): BraintreeDataCollector {
    return {
        deviceData: 'my_device_session_id',
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getThreeDSecureMock(): BraintreeThreeDSecure {
    return {
        verifyCard: jest.fn(),
        cancelVerifyCard: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getVisaCheckoutMock(): BraintreeVisaCheckout {
    return {
        createInitOptions: jest.fn(),
        tokenize: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getModuleCreatorMock<T>(module: BraintreeModule | BraintreeClient): BraintreeModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve(module)),
    };
}

export function getTokenizeResponseBody(): BraintreeTokenizeResponse {
    return {
        creditCards: [
            { nonce: 'demo_nonce' },
        ],
    };
}

export function getVerifyPayload(): BraintreeVerifyPayload {
    return {
        nonce: 'demo_nonce',
        details: {
            cardType: 'visa',
            lastFour: '0001',
            lastTwo: '01',
        },
        description: '',
        liabilityShiftPossible: false,
        liabilityShifted: false,
    };
}

export function getBraintreeRequestData(): BraintreeRequestData {
    return {
        data: {
            creditCard: {
                billingAddress: {
                    countryName: 'United States',
                    postalCode: '95555',
                    streetAddress: '12345 Testing Way',
                },
                cardholderName: 'BigCommerce',
                cvv: '123',
                expirationDate: '10/20',
                number: '4111111111111111',
                options: {
                    validate: false,
                },
            },
        },
        endpoint: 'payment_methods/credit_cards',
        method: 'post',
    };
}

export function getBraintreePaymentData(): Payment {
    return {
        ...getPayment(),
        methodId: 'braintree',
    };
}

export function getThreeDSecureOptionsMock(): BraintreeThreeDSecureOptions {
    return {
        addFrame: jest.fn(),
        removeFrame: jest.fn(),
    };
}
