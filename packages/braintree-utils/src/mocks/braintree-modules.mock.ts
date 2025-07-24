import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeFastlane,
    BraintreeGooglePayment,
    BraintreeModule,
    BraintreeModuleCreator,
    BraintreePaypal,
    BraintreeThreeDSecure,
    BraintreeUsBankAccount,
} from '../types';

import { getBraintreePaymentDataRequest } from './braintree.mock';

/**
 *
 * Braintree Module Creator Generic Mock
 *
 */
export function getModuleCreatorMock<T>(
    // TODO: this option should not be optional (check braintreeLocalMethods implementation to fix that)
    module?:
        | BraintreeModule
        | BraintreeClient
        | BraintreePaypal
        | BraintreeFastlane
        | BraintreeUsBankAccount
        | BraintreeThreeDSecure
        | BraintreeGooglePayment,
): BraintreeModuleCreator<T> {
    return {
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        create: jest.fn(() => Promise.resolve(module)),
    };
}

/**
 *
 * Braintree Client
 *
 */
export function getClientMock(): BraintreeClient {
    return {
        getVersion: jest.fn(),
        request: jest.fn(),
    };
}

/**
 *
 * Braintree Data Collector
 *
 */
export function getDataCollectorMock(): BraintreeDataCollector {
    return {
        deviceData: getDeviceDataMock(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

// TODO: it is not necessary to have a function for static return value, so we can update it with constant variable in the future
export function getDeviceDataMock(): string {
    return '{"device_session_id": "my_device_session_id", "fraud_merchant_id": "we_dont_use_this_field"}';
}

/**
 *
 * Braintree 3D Secure
 *
 */
export function getThreeDSecureMock(): BraintreeThreeDSecure {
    return {
        verifyCard: jest.fn(),
        cancelVerifyCard: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
    };
}

/**
 *
 * Braintree Google Payment
 *
 */
export function getGooglePaymentMock(): BraintreeGooglePayment {
    return {
        createPaymentDataRequest: jest.fn(() => getBraintreePaymentDataRequest()),
        teardown: jest.fn(),
    };
}

/**
 *
 * Braintree US Bank Account
 *
 */
export function getUsBankAccountMock(): BraintreeUsBankAccount {
    return {
        tokenize: jest.fn(() => Promise.resolve({ nonce: 'token', details: {} })),
    };
}
