import {Cart} from '../../../cart';
import { Checkout } from '../../../checkout';
import {Coupon} from '../../../coupon';
import { GiftCertificate } from '../../../coupon';
import {Customer} from '../../../customer';
import {Discount} from '../../../discount';
import { OrderRequestBody } from '../../../order';
import {Consignment} from '../../../shipping';
import {Tax} from '../../../tax';
import PaymentMethod from '../../payment-method';
import PaymentMethodConfig from '../../payment-method-config';

import {
    GooglePaymentData,
    GooglePayAddress,
    GooglePayBraintreeSDK,
    GooglePayPaymentDataRequestV1,
    GooglePaySDK
} from './googlepay';

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
        createPaymentDataRequest: jest.fn(dataRequest => Promise.resolve(dataRequest as GooglePayPaymentDataRequestV1)),
        parseResponse: jest.fn(),
        teardown: jest.fn(() => Promise.resolve()),
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
        shippingCostTotal: 0,
        shippingCostBeforeDiscount: 0,
        handlingCostTotal: 0,
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
        },
        phoneNumberRequired: true,
        shippingAddressRequired: true,
        transactionInfo: {
            currencyCode: 'USD',
            totalPrice: '1',
            totalPriceStatus: 'FINAL',
        },
    };
}

export function getGooglePaymentDataMock(): GooglePaymentData {
    return {
        cardInfo: {
            cardClass: 'cardClass',
            cardDescription: 'cardDescription',
            cardDetails: 'cardDetails',
            cardImageUri: 'cardImageUri',
            cardNetwork: 'cardNetwork',
            billingAddress: {} as GooglePayAddress,
        },
        paymentMethodToken: {
            token: 'token',
            tokenizationType: 'tokenizationType',
        },
        shippingAddress: {} as GooglePayAddress,
        email: 'email',
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
        address4: 'mock',
        address5: 'mock',
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

export function getGooglePayPaymentDataRequestMock(): GooglePayPaymentDataRequestV1 {
    return {
        allowedPaymentMethods: [
            'CreditCard',
        ],
        apiVersion: 1,
        cardRequirements: {
            allowedCardNetworks: [''],
            billingAddressRequired: true,
            billingAddressFormat: '',
        },
        enviroment: '',
        i: {
            googleTransactionId: '',
            startTimeMs: 1,
        },
        merchantInfo: {
            merchantId: '',
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
        transactionInfo: {
            currencyCode: '',
            totalPrice: '',
            totalPriceStatus: '',
        },
    };
}
