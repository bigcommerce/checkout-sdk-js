import {
    BraintreeClient,
    BraintreeConnect,
    BraintreeConnectAuthenticationState,
    BraintreeConnectProfileData,
    BraintreeDataCollector,
    BraintreeModule,
    BraintreeModuleCreator,
    BraintreePaypalCheckout,
    BraintreePaypalCheckoutCreator,
    BraintreeShippingAddressOverride,
    BraintreeTokenizePayload,
    LocalPaymentInstance,
} from '../types';

export function getClientMock(): BraintreeClient {
    return {
        request: jest.fn(),
        getVersion: jest.fn(),
    };
}

export function getBraintreeConnectProfileDataMock(): BraintreeConnectProfileData {
    return {
        connectCustomerAuthAssertionToken: 'some_token',
        connectCustomerId: 'asdasd',
        addresses: [
            {
                id: '123123',
                company: undefined,
                extendedAddress: undefined,
                firstName: 'John',
                lastName: 'Doe',
                streetAddress: 'Hello World Address',
                locality: 'Bellingham',
                region: 'WA',
                postalCode: '98225',
                countryCodeNumeric: 0,
                countryCodeAlpha2: 'US',
                countryCodeAlpha3: '',
            },
        ],
        cards: [
            {
                id: 'pp-vaulted-instrument-id',
                paymentSource: {
                    card: {
                        brand: 'VISA',
                        expiry: '02/2037',
                        lastDigits: '1111',
                        billingAddress: {
                            id: '321',
                            company: undefined,
                            extendedAddress: undefined,
                            firstName: undefined,
                            lastName: undefined,
                            streetAddress: 'Hello World Address',
                            locality: 'Bellingham',
                            region: 'WA',
                            postalCode: '98225',
                            countryCodeNumeric: 0,
                            countryCodeAlpha2: 'US',
                            countryCodeAlpha3: '',
                        },
                    },
                },
            },
        ],
        name: {
            given_name: 'John',
            surname: 'Doe',
        },
    };
}

export function getConnectMock(): BraintreeConnect {
    return {
        identity: {
            lookupCustomerByEmail: () => Promise.resolve({ customerContextId: 'customerId' }),
            triggerAuthenticationFlow: () =>
                Promise.resolve({
                    authenticationState: BraintreeConnectAuthenticationState.SUCCEEDED,
                    profileData: getBraintreeConnectProfileDataMock(),
                }),
        },
        ConnectCardComponent: jest.fn(),
    };
}

export function getDataCollectorMock(): BraintreeDataCollector {
    return {
        deviceData: getDeviceDataMock(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getBraintreeLocalPaymentMock(): LocalPaymentInstance {
    return {
        startPayment: jest.fn(
            (_options: unknown, onPaymentStart: (payload: { paymentId: string }) => void) => {
                onPaymentStart({ paymentId: '123456' });
            },
        ),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getDeviceDataMock(): string {
    return '{"device_session_id": "my_device_session_id", "fraud_merchant_id": "we_dont_use_this_field"}';
}

export function getModuleCreatorMock<T>(
    module?: BraintreeModule | BraintreeClient | BraintreeConnect,
): BraintreeModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve(module || {})),
    };
}

export function getPaypalCheckoutMock(): BraintreePaypalCheckout {
    return {
        loadPayPalSDK: jest.fn((_config, callback: () => void) => callback()),
        createPayment: jest.fn(() => Promise.resolve()),
        teardown: jest.fn(),
        tokenizePayment: jest.fn(() => Promise.resolve(getTokenizePayload())),
    };
}

// TODO: this method can be removed because we can mock 'shouldThrowError: true' flow in other way
export function getPayPalCheckoutCreatorMock(
    braintreePaypalCheckoutMock: BraintreePaypalCheckout,
    shouldThrowError?: boolean,
): BraintreePaypalCheckoutCreator {
    return {
        create: shouldThrowError
            ? jest.fn(
                  (
                      _config,
                      callback: (
                          err: Error,
                          braintreePaypalCheckout: BraintreePaypalCheckout | undefined,
                      ) => void,
                  ) => callback(new Error('test'), undefined),
              )
            : jest.fn(
                  (
                      _config,
                      callback: (
                          _err: Error | undefined,
                          braintreePaypalCheckout: BraintreePaypalCheckout,
                      ) => void,
                  ) => callback(undefined, braintreePaypalCheckoutMock),
              ),
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
            },
            shippingAddress: {
                recipientName: 'Hello World',
                line1: '12345 Testing Way',
                line2: 'Level 1',
                city: 'Some City',
                state: 'California',
                countryCode: 'US',
                postalCode: '95555',
            },
        },
    };
}

export function getBraintreeAddress(): BraintreeShippingAddressOverride {
    return {
        line1: '12345 Testing Way',
        line2: '',
        city: 'Some City',
        state: 'CA',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        recipientName: 'Test Tester',
    };
}
