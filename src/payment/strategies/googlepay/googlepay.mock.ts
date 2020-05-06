import { Cart } from '../../../cart';
import { Checkout } from '../../../checkout';
import { Coupon, GiftCertificate } from '../../../coupon';
import { Customer } from '../../../customer';
import { Discount } from '../../../discount';
import { OrderRequestBody } from '../../../order';
import { Consignment } from '../../../shipping';
import { Tax } from '../../../tax';
import PaymentMethod from '../../payment-method';
import PaymentMethodConfig from '../../payment-method-config';
import { GooglePayBraintreeSDK } from '../braintree';

import { BillingAddressFormat, GooglePaymentData, GooglePayAddress, GooglePayPaymentDataRequestV2, GooglePaySDK, TokenizePayload } from './googlepay';
import { GooglePayBraintreePaymentDataRequestV1 } from './googlepay-braintree';

export function getGooglePaySDKMock(): GooglePaySDK {
    return {
        payments: {
            api: {
                PaymentsClient: jest.fn(),
            },
        },
    };
}

export function getGooglePayBraintreeMock(): GooglePayBraintreeSDK {
    return {
        createPaymentDataRequest: jest.fn(() => getGooglePayBraintreePaymentDataRequest()),
        parseResponse: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getGooglePayBraintreePaymentDataRequest(): GooglePayBraintreePaymentDataRequestV1 {
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
            totalPriceStatus: '',
        },
    };
}

export function getCheckoutMock(): Checkout {
    return {
        id: '1',
        cart: {
            currency: {
                code: 'USD',
            },
        } as Cart,
        customer: {} as Customer,
        customerMessage: '',
        consignments: [{}] as Consignment[],
        taxes: [{}] as Tax[],
        discounts: [{}] as Discount[],
        coupons: [{}] as Coupon[],
        isStoreCreditApplied: false,
        shippingCostTotal: 0,
        shippingCostBeforeDiscount: 0,
        shouldExecuteSpamCheck: false,
        handlingCostTotal: 0,
        outstandingBalance: 1,
        taxTotal: 0,
        subtotal: 0,
        grandTotal: 1,
        giftCertificates: [{}] as GiftCertificate[],
        balanceDue: 0,
        createdTime: '',
        updatedTime: '',
    };
}

export function getPaymentMethodMock(): PaymentMethod {
    return {
        id: 'id',
        config: {} as PaymentMethodConfig,
        method: 'method',
        supportedCards: [] as string[],
        type: '',
        clientToken: 'token',
        nonce: 'nonce',
        initializationData: {
            platformToken: 'platformToken',
            googleMerchantId: '123',
            googleMerchantName: 'name',
            paymentGatewayId: '7654321',
        },
    };
}

export function getGooglePaymentDataPayload() {
    return {
        cardRequirements: {
            billingAddressFormat: 'FULL',
            billingAddressRequired: true,
        },
        emailRequired: true,
        merchantInfo: {
            authJwt: 'platformToken',
            merchantId: '123',
            merchantName: 'name',
        },
        phoneNumberRequired: true,
        shippingAddressRequired: true,
        transactionInfo: {
            currencyCode: 'USD',
            totalPrice: '1.00',
            totalPriceStatus: 'FINAL',
        },
    };
}

export function getGooglePaymentDataMock(): GooglePaymentData {
    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        email: 'carlos.lopez@bigcommerce.com',
        paymentMethodData: {
            description: 'Mastercard •••• 0304',
            info: {
                billingAddress: getGooglePayAddressMock(),
                cardDetails: '0304',
                cardNetwork: 'MASTERCARD',
            },
            tokenizationData: {
                token: `{"androidPayCards": [{"nonce": "nonce", "type": "AndroidPayCard", "description": "", "details": {"cardType": "type", "lastFour": "", "lastTwo": ""}}]}`,
                type: 'PAYMENT_GATEWAY',
            },
            type: 'CARD',
        },
        shippingAddress: getGooglePayAddressMock(),
    };
}

export function getGoogleOrderRequestBody(): OrderRequestBody {
    return {
        useStoreCredit: true,
    };
}

export function getGooglePayAddressMock(): GooglePayAddress {
    return {
        address1: 'mock',
        address2: 'mock',
        address3: 'mock',
        administrativeArea: 'mock',
        companyName: 'mock',
        countryCode: 'mock',
        locality: 'mock',
        name: 'mock',
        postalCode: 'mock',
        sortingCode: 'mock',
        phoneNumber: 'mock',
    };
}

export function getGooglePayPaymentDataRequestMock(): GooglePayPaymentDataRequestV2 {
    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: { },
        allowedPaymentMethods: [{
            type: 'type',
            parameters: {
                allowedAuthMethods: [
                    'dummy',
                ],
                allowedCardNetworks: [
                    'dummy',
                ],
            },
        }],
        transactionInfo: {
            currencyCode: 'USD',
            totalPriceStatus: 'FINAL',
        },
    };
}

// AdyenV2
export function getAdyenV2PaymentDataMock(): GooglePaymentData {
    const googlePaymentDataMock = getGooglePaymentDataMock();
    googlePaymentDataMock.paymentMethodData.tokenizationData.token = '{"signature":"foo","protocolVersion":"ECv1","signedMessage":"{"encryptedMessage":"foo","ephemeralPublicKey":"foo"}"}';

    return googlePaymentDataMock;
}

export function getAdyenV2PaymentDataRequest(): GooglePayPaymentDataRequestV2 {
    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
                    billingAddressRequired: true,
                    billingAddressParameters: {
                        format: BillingAddressFormat.Full,
                        phoneNumberRequired: true,
                    },
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'adyen',
                        gatewayMerchantId: '7654321',
                    },
                },
            },
        ],
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: '1.00',
            currencyCode: 'USD',
        },
        merchantInfo: {
            merchantName: 'name',
            merchantId: '123',
            authJwt: 'platformToken',
        },
        emailRequired: true,
        shippingAddressRequired: true,
        shippingAddressParameters: { phoneNumberRequired: true },
    };
}

export function getAdyenV2PaymentMethodMock(): PaymentMethod {
    const paymentMethodMock = getPaymentMethodMock();
    paymentMethodMock.supportedCards = ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];
    paymentMethodMock.initializationData.gatewayMerchantId = '7654321';

    return paymentMethodMock;
}

export function getAdyenV2TokenizedPayload(): TokenizePayload {
    return {
        type: 'CARD',
        nonce: '{"signature":"foo","protocolVersion":"ECv1","signedMessage":"{"encryptedMessage":"foo","ephemeralPublicKey":"foo"}"}',
        details: {
            cardType: 'MASTERCARD',
            lastFour: '0304',
        },
    };
}

// Auth.Net
export function getAuthorizeNetPaymentDataRequest(): GooglePayPaymentDataRequestV2 {
    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: [
                        'VISA',
                        'AMEX',
                        'MASTERCARD',
                    ],
                    billingAddressRequired: true,
                    billingAddressParameters: {
                        format: BillingAddressFormat.Full,
                        phoneNumberRequired: true,
                    },
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'authorizenet',
                        gatewayMerchantId: '7654321',
                    },
                },
            },
        ],
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: '1.00',
            currencyCode: 'USD',
            countryCode: 'US',
        },
        merchantInfo: {
            merchantName: 'name',
            merchantId: '123',
            authJwt: 'platformToken',
        },
        emailRequired: true,
        shippingAddressRequired: true,
        shippingAddressParameters: { phoneNumberRequired: true },
    };
}

export function getAuthorizeNetPaymentDataMock(): GooglePaymentData {
    const googlePaymentDataMock = getGooglePaymentDataMock();
    googlePaymentDataMock.paymentMethodData.tokenizationData.token = '{"signature":"foo","protocolVersion":"ECv1","signedMessage":"{"encryptedMessage":"foo","ephemeralPublicKey":"foo"}"}';

    return googlePaymentDataMock;
}

export function getAuthorizeNetPaymentMethodMock(): PaymentMethod {
    const paymentMethodMock = getPaymentMethodMock();
    paymentMethodMock.supportedCards = ['VISA', 'AMEX', 'MC'];
    paymentMethodMock.initializationData.storeCountry = 'US';

    return paymentMethodMock;
}

export function getAuthorizeNetTokenizedPayload(): TokenizePayload {
    return {
        type: 'CARD',
        nonce: btoa('{"signature":"foo","protocolVersion":"ECv1","signedMessage":"{"encryptedMessage":"foo","ephemeralPublicKey":"foo"}"}'),
        details: {
            cardType: 'MASTERCARD',
            lastFour: '0304',
        },
    };
}

// Stripe
export function getStripePaymentDataRequest(): GooglePayPaymentDataRequestV2 {
    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
            authJwt: 'platformToken',
            merchantId: '123',
            merchantName: 'name',
        },
        allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
                billingAddressRequired: true,
                billingAddressParameters: {
                    format: BillingAddressFormat.Full,
                    phoneNumberRequired: true,
                },
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'stripe',
                    'stripe:version': undefined,
                    'stripe:publishableKey': undefined,
                },
            },
        }],
        transactionInfo: {
            currencyCode: 'USD',
            totalPriceStatus: 'FINAL',
            totalPrice: '1.00',
        },
        emailRequired: true,
        shippingAddressRequired: true,
        shippingAddressParameters: {
            phoneNumberRequired: true,
        },
    };
}

export function getStripePaymentDataMock(): GooglePaymentData {
    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        email: 'carlos.lopez@bigcommerce.com',
        paymentMethodData: {
            description: 'Mastercard •••• 0304',
            info: {
                billingAddress: getGooglePayAddressMock(),
                cardDetails: '0304',
                cardNetwork: 'MASTERCARD',
            },
            tokenizationData: {
                token: `{"id": "nonce", "type": "AndroidPayCard", "card": {"brand": "MasterCard", "last4": "1234"}}`,
                type: 'PAYMENT_GATEWAY',
            },
            type: 'CARD',
        },
        shippingAddress: getGooglePayAddressMock(),
    };
}

export function getStripeTokenizedPayload(): TokenizePayload {
    return {
        nonce: 'nonce',
        type: 'AndroidPayCard',
        details: {
            cardType: 'MasterCard',
            lastFour: '1234',
        },
    };
}
