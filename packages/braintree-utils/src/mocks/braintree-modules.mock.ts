import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeFastlane,
    BraintreeModule,
    BraintreeModuleCreator,
    BraintreePaypal,
    BraintreeUsBankAccount,
} from '../types';

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
        | BraintreeUsBankAccount,
): BraintreeModuleCreator<T> {
    return {
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
 * Braintree US Bank Account
 *
 */
export function getUsBankAccountMock(): BraintreeUsBankAccount {
    return {
        tokenize: jest.fn(() => Promise.resolve({ nonce: 'token', details: {} })),
    };
}
