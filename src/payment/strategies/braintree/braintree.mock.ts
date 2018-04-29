import { Payment } from '../..';
import { getPayment } from '../../payments.mock';

import * as Braintree from './braintree';
import { BraintreeThreeDSecureOptions } from './braintree-payment-options';

export function getClientMock(): Braintree.Client {
    return {
        request: jest.fn(),
        getVersion: jest.fn(),
    };
}

export function getDataCollectorMock(): Braintree.DataCollector {
    return {
        deviceData: 'my_device_session_id',
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getThreeDSecureMock(): Braintree.ThreeDSecure {
    return {
        verifyCard: jest.fn(),
        cancelVerifyCard: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getModuleCreatorMock<T>(module: Braintree.Module): Braintree.ModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve(module)),
    };
}

export function getTokenizeResponseBody(): Braintree.TokenizeResponse {
    return {
        creditCards: [
            { nonce: 'demo_nonce' },
        ],
    };
}

export function getVerifyPayload(): Braintree.VerifyPayload {
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

export function getBraintreeRequestData(): Braintree.RequestData {
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
        name: 'braintree',
    };
}

export function getThreeDSecureOptionsMock(): BraintreeThreeDSecureOptions {
    return {
        addFrame: jest.fn(),
        removeFrame: jest.fn(),
    };
}
