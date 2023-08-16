import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeBankAccount,
    BraintreeClient,
    BraintreeConnect,
    BraintreeConnectProfileData,
    BraintreeDataCollector,
    BraintreeLocalPayment,
    BraintreeModule,
    BraintreeModuleCreator,
    BraintreePaypalCheckout,
    BraintreePaypalCheckoutCreator,
    BraintreeShippingAddressOverride,
    BraintreeTokenizePayload,
} from '../braintree';

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
    };
}

export function getConnectMock(): BraintreeConnect {
    const connectMock = {
        identity: {
            lookupCustomerByEmail: () => Promise.resolve({ customerId: 'customerId' }),
            triggerAuthenticationFlow: () =>
                Promise.resolve({
                    authenticationState: 'succeeded',
                    profileData: getBraintreeConnectProfileDataMock(),
                }),
        },
        ConnectCardComponent: jest.fn(),
    };

    return connectMock;
}

export function getDataCollectorMock(): BraintreeDataCollector {
    return {
        deviceData: getDeviceDataMock(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getBraintreeLocalPaymentMock(): BraintreeLocalPayment {
    return {
        create: jest.fn(),
    };
}

export function getBankAccountMock(): BraintreeBankAccount {
    return {
        teardown: jest.fn(() => Promise.resolve()),
        tokenize: jest.fn(() => Promise.resolve({ nonce: 'NONCE', details: {} })),
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

export function getModuleCreatorNewMock<T>(
    module: BraintreeDataCollector,
): BraintreeModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve({ ...module })),
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

export function getPayPalCheckoutCreatorMock(
    braintreePaypalCheckoutMock: BraintreePaypalCheckout,
    shouldThrowError: boolean,
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

export function getBraintree(): PaymentMethod {
    return {
        id: 'braintree',
        logoUrl:
            'https://cdn.bcapp.dev/rHEAD/modules/checkout/braintree/images/paypal_powered_braintree_horizontal.png',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
        config: {
            displayName: 'Credit Card',
            cardCode: true,
            enablePaypal: true,
            merchantId: '',
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
            paymentButtonStyles: {
                checkoutTopButtonStyles: {
                    color: 'blue',
                    label: 'checkout',
                    height: 40,
                },
            },
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBraintreeAcceleratedCheckoutPaymentMethod(): PaymentMethod {
    return {
        id: 'braintreeacceleratedcheckout',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
        config: {
            displayName: 'Credit Card',
            testMode: false,
        },
        clientToken: 'asdasd',
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBraintreeAch(): PaymentMethod {
    return {
        id: 'braintreeach',
        logoUrl: '',
        method: 'paypal-ach',
        supportedCards: [],
        config: {
            displayName: 'Braintree ACH',
            isVaultingEnabled: true,
        },
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBraintreeLocalMethodsInitializationOptions() {
    return {
        container: '#checkout-payment-continue',
        onRenderButton: jest.fn(),
        submitForm: jest.fn(),
        onValidate: jest.fn(),
        onError: jest.fn(),
    };
}

export function getBraintreeLocalMethods() {
    return {
        id: 'braintreelocalmethods',
        logoUrl: '',
        method: 'giropay',
        supportedCards: [],
        config: {
            displayName: 'Giropay',
        },
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
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
