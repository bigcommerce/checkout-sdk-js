import {
    Braintree3DSVerifyCardCallback,
    BraintreeClient,
    BraintreeHostedFieldsTokenizePayload,
    BraintreeModule,
    BraintreeModuleCreator,
    BraintreeThreeDSecure,
    BraintreeThreeDSecureOptions,
    PaypalButtonStyleColorOption,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import {
    DefaultCheckoutButtonHeight,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getBraintreeAcceleratedCheckoutPaymentMethod(): PaymentMethod {
    return {
        skipRedirectConfirmationAlert: true,
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

export function getThreeDSecureMock(): BraintreeThreeDSecure {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        verifyCard: (_options, callback: Braintree3DSVerifyCardCallback) => {
            if (callback) {
                callback({ code: '' }, { nonce: 'fastlane_token_mock' });
            }

            return Promise.resolve('fastlane_token_mock');
        },
        cancelVerifyCard: jest.fn(),
        on: jest.fn(),
        teardown: jest.fn(),
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
        method: 'ideal',
        supportedCards: [],
        config: {
            displayName: 'Ideal',
            merchantId: 'someMerchantId',
        },
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
            paymentButtonStyles: {
                checkoutTopButtonStyles: {
                    color: PaypalButtonStyleColorOption.BLUE,
                    label: 'checkout',
                    height: DefaultCheckoutButtonHeight,
                },
            },
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export interface BraintreeTokenizeResponse {
    creditCards: BraintreeHostedFieldsTokenizePayload[];
}

export function getTokenizeResponseBody(): BraintreeTokenizeResponse {
    return {
        creditCards: [
            {
                nonce: 'demo_nonce',
                details: {
                    bin: 'demo_bin',
                    cardType: 'Visa',
                    expirationMonth: '01',
                    expirationYear: '2025',
                    lastFour: '0001',
                    lastTwo: '01',
                },
                description: 'ending in 01',
                type: 'CreditCard',
                binData: {
                    commercial: 'bin_data_commercial',
                    countryOfIssuance: 'bin_data_country_of_issuance',
                    debit: 'bin_data_debit',
                    durbinRegulated: 'bin_data_durbin_regulated',
                    healthcare: 'bin_data_healthcare',
                    issuingBank: 'bin_data_issuing_bank',
                    payroll: 'bin_data_payroll',
                    prepaid: 'bin_data_prepaid',
                    productId: 'bin_data_product_id',
                },
            },
        ],
    };
}

export function getThreeDSecureOptionsMock(): BraintreeThreeDSecureOptions {
    return {
        nonce: 'nonce',
        amount: 225,
        addFrame: jest.fn(),
        removeFrame: jest.fn(),
        additionalInformation: {
            acsWindowSize: '01',
        },
    };
}

export function getModuleCreatorMock<T>(
    module: BraintreeModule | BraintreeClient,
): BraintreeModuleCreator<T> {
    return {
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        create: jest.fn(() => Promise.resolve(module)),
    };
}

export function getBillingAddress() {
    return {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        email: 'test@bigcommerce.com',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        shouldSaveAddress: true,
        phone: '555-555-5555',
        customFields: [],
    };
}
