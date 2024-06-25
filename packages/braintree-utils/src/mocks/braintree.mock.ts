// TODO: separate mock in this file to different files by group
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeFastlane,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlaneProfileData,
    BraintreeHostedFields,
    BraintreePaypal,
    BraintreePaypalCheckout,
    BraintreePaypalCheckoutCreator,
    BraintreeShippingAddressOverride,
    BraintreeThreeDSecure,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
    BraintreeVisaCheckout,
    GooglePayBraintreePaymentDataRequestV1,
    GooglePayBraintreeSDK,
    LocalPaymentInstance,
    TotalPriceStatusType,
    VisaCheckoutInitOptions,
} from '../types';

import { getVisaCheckoutTokenizedPayload } from './visacheckout.mock';

export function getBraintree(): PaymentMethod {
    return {
        id: 'braintree',
        clientToken: 'clientToken',
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
                },
            },
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBraintreeFastlaneProfileDataMock(): BraintreeFastlaneProfileData {
    return {
        fastlaneCustomerAuthAssertionToken: 'some_token',
        fastlaneCustomerId: 'asdasd',
        shippingAddress: {
            id: '123123',
            company: undefined,
            extendedAddress: undefined,
            firstName: 'John',
            lastName: 'Doe',
            streetAddress: 'Hello World Address',
            locality: 'Bellingham',
            region: 'WA',
            postalCode: '98225',
            phoneNumber: '14085551234',
            countryCodeNumeric: 0,
            countryCodeAlpha2: 'US',
            countryCodeAlpha3: '',
        },
        card: {
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
        name: {
            firstName: 'John',
            lastName: 'Doe',
        },
    };
}

export function getVisaCheckoutMock(): BraintreeVisaCheckout {
    return {
        createInitOptions: jest.fn((options: VisaCheckoutInitOptions) => options),
        tokenize: jest.fn(() => Promise.resolve(getVisaCheckoutTokenizedPayload())),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getHostedFieldsMock(): BraintreeHostedFields {
    return {
        getState: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
        tokenize: jest.fn(() => Promise.resolve(getTokenizePayload())),
        on: jest.fn(),
    };
}

export function getVenmoCheckoutMock(): BraintreeVenmoCheckout {
    return {
        teardown: jest.fn(() => Promise.resolve()),
        tokenize: jest.fn(() => Promise.resolve()),
        isBrowserSupported: jest.fn(),
    };
}

export function getFastlaneMock(): BraintreeFastlane {
    return {
        profile: {
            showCardSelector: jest.fn(),
            showShippingAddressSelector: jest.fn(),
        },
        identity: {
            lookupCustomerByEmail: () => Promise.resolve({ customerContextId: 'customerId' }),
            triggerAuthenticationFlow: () =>
                Promise.resolve({
                    authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                    profileData: getBraintreeFastlaneProfileDataMock(),
                }),
        },
        FastlaneCardComponent: jest.fn(),
        events: {
            apmSelected: jest.fn(),
            emailSubmitted: jest.fn(),
            orderPlaced: jest.fn(),
        },
    };
}

export function getBraintreeFastlaneAuthenticationResultMock() {
    return {
        authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
        profileData: {
            name: {
                fullName: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
            },
            shippingAddress: {
                address: {
                    company: 'BigCommerce',
                    addressLine1: 'addressLine1',
                    addressLine2: 'addressLine2',
                    adminArea1: 'addressState',
                    adminArea2: 'addressCity',
                    postalCode: '03004',
                    countryCode: 'US',
                },
                name: {
                    fullName: 'John Doe',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                phoneNumber: {
                    nationalNumber: '5551113344',
                    countryCode: '1',
                },
            },
            card: {
                id: 'nonce/token',
                paymentSource: {
                    card: {
                        brand: 'Visa',
                        expiry: '2030-12',
                        lastDigits: '1111',
                        name: 'John Doe',
                        billingAddress: {
                            firstName: 'John',
                            lastName: 'Doe',
                            company: 'BigCommerce',
                            addressLine1: 'addressLine1',
                            addressLine2: 'addressLine2',
                            adminArea1: 'addressState',
                            adminArea2: 'addressCity',
                            postalCode: '03004',
                            countryCode: 'US',
                            phone: {
                                nationalNumber: '5551113344',
                                countryCode: '1',
                            },
                        },
                    },
                },
            },
        },
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

export function getGooglePayMock(): GooglePayBraintreeSDK {
    return {
        createPaymentDataRequest: jest.fn(() => getBraintreePaymentDataRequest()),
        teardown: jest.fn(),
    };
}

export function getBraintreePaypalMock(): BraintreePaypal {
    return {
        closeWindow: jest.fn(),
        focusWindow: jest.fn(),
        tokenize: jest.fn(() => Promise.resolve(getBraintreePaypalTokenizePayloadMock())),
        Buttons: jest.fn(() => ({
            render: jest.fn(),
            isEligible: jest.fn(() => true),
        })),
    };
}

export function getBraintreePaypalTokenizePayloadMock(): BraintreeTokenizePayload {
    return {
        nonce: 'nonce',
        type: 'PaypalAccount',
        details: {
            email: 'test@test.com',
        },
    };
}

export function getBraintreePaypal(): PaymentMethod {
    return {
        id: 'braintreepaypal',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
        initializationData: {
            isBrainteeVenmoEnabled: false,
            enableCheckoutPaywallBanner: false,
        },
    };
}

export function getThreeDSecureMock(): BraintreeThreeDSecure {
    return {
        verifyCard: jest.fn(),
        cancelVerifyCard: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getBraintreePaymentDataRequest(): GooglePayBraintreePaymentDataRequestV1 {
    return {
        allowedPaymentMethods: [],
        apiVersion: 1,
        cardRequirements: {
            allowedCardNetworks: [],
            billingAddressFormat: '',
            billingAddressRequired: true,
        },
        environment: '',
        i: {
            googleTransactionId: '',
            startTimeMs: 1,
        },
        merchantInfo: {
            authJwt: '',
            merchantId: '',
            merchantName: '',
        },
        paymentMethodTokenizationParameters: {
            parameters: {
                'braintree:apiVersion': '',
                'braintree:authorizationFingerprint': '',
                'braintree:merchantId': '',
                'braintree:metadata': '',
                'braintree:sdkVersion': '',
                gateway: '',
            },
            tokenizationType: '',
        },
        shippingAddressRequired: true,
        phoneNumberRequired: true,
        transactionInfo: {
            currencyCode: '',
            totalPrice: '',
            totalPriceStatus: TotalPriceStatusType.FINAL,
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
