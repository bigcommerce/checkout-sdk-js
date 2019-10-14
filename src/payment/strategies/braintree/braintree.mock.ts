import { OrderPaymentRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';

import { BraintreeClient, BraintreeDataCollector, BraintreeModule, BraintreeModuleCreator, BraintreePaypalCheckout, BraintreeRequestData, BraintreeThreeDSecure, BraintreeTokenizePayload, BraintreeTokenizeResponse, BraintreeVerifyPayload, BraintreeVisaCheckout, GooglePayBraintreeSDK } from './braintree';
import { BraintreeThreeDSecureOptions } from './braintree-payment-options';

export function getClientMock(): BraintreeClient {
    return {
        request: jest.fn(),
        getVersion: jest.fn(),
    };
}

export function getDataCollectorMock(): BraintreeDataCollector {
    return {
        deviceData: getDeviceDataMock(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getDeviceDataMock(): string {
    return '{"device_session_id": "my_device_session_id", "fraud_merchant_id": "we_dont_use_this_field"}';
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

export function getPaypalCheckoutMock(): BraintreePaypalCheckout {
    return {
        createPayment: jest.fn((() => Promise.resolve())),
        teardown: jest.fn(),
        tokenizePayment: jest.fn(() => Promise.resolve(getTokenizePayload())),
    };
}

export function getModuleCreatorMock<T>(module: BraintreeModule | BraintreeClient): BraintreeModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve(module)),
    };
}

export function getModuleCreatorNewMock<T>(module: BraintreeDataCollector): BraintreeModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve({ ...module })),
    };
}

export function getTokenizeResponseBody(): BraintreeTokenizeResponse {
    return {
        creditCards: [
            { nonce: 'demo_nonce' },
        ],
    };
}

export function getGooglePayMock(): GooglePayBraintreeSDK {
    return {
        createPaymentDataRequest: jest.fn((() => Promise.resolve())),
        parseResponse: jest.fn((() => Promise.resolve())),
        teardown: jest.fn(),
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

export function getTokenizePayload(): BraintreeTokenizePayload {
    return {
        nonce: 'NONCE',
        type: 'PaypalAccount',
        details: {
            email: 'foo@bar.com',
            payerId: 'PAYER_ID',
            firstName: 'Foo',
            lastName: 'Bar',
            billingAddress: {
                line1: '56789 Testing Way',
                line2: 'Level 2',
                city: 'Some Other City',
                state: 'Arizona',
                countryCode: 'US',
                postalCode: '96666',
                phone: '123456789',
            },
            shippingAddress: {
                recipientName: 'Hello World',
                line1: '12345 Testing Way',
                line2: 'Level 1',
                city: 'Some City',
                state: 'California',
                countryCode: 'US',
                postalCode: '95555',
                phone: '987654321',
            },
        },
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

export function getBraintreePaymentData(): OrderPaymentRequestBody {
    return {
        ...getOrderRequestBody().payment,
        methodId: 'braintree',
    };
}

export function getThreeDSecureOptionsMock(): BraintreeThreeDSecureOptions {
    return {
        addFrame: jest.fn(),
        removeFrame: jest.fn(),
    };
}
