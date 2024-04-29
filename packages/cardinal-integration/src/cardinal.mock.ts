import { PaymentMethod, ThreeDsResult } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCreditCardInstrument,
    getShippingAddress,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    CardinalBinProcessResponse,
    CardinalOrderData,
    CardinalPaymentType,
    CardinalSDK,
    CardinalSignatureVerification,
    CardinalValidatedAction,
    CardinalValidatedData,
    CardinalWindow,
} from '.';

const CardinalWindowMock: CardinalWindow = window;

export function getCardinalScriptMock(): CardinalWindow {
    return {
        ...CardinalWindowMock,
        Cardinal: getCardinalSDK(),
    };
}

export function getCardinalSDK(): CardinalSDK {
    return {
        configure: jest.fn(),
        on: jest.fn(),
        setup: jest.fn(),
        trigger: jest.fn(),
        continue: jest.fn(),
        off: jest.fn(),
        start: jest.fn(),
    };
}

export function getCardinalBinProcessResponse(status: boolean): CardinalBinProcessResponse {
    return {
        Status: status,
    };
}

export function getCardinalValidatedData(
    actionCode: CardinalValidatedAction,
    status: boolean,
    errorNumber?: number,
): CardinalValidatedData {
    return {
        ActionCode: actionCode,
        ErrorDescription: '',
        ErrorNumber: errorNumber || 0,
        Validated: status,
        Payment: {
            ExtendedData: {
                SignatureVerification: CardinalSignatureVerification.Yes,
            },
            ProcessorTransactionId: '',
            Type: CardinalPaymentType.CCA,
        },
    };
}

export function getCardinalThreeDSResult(): ThreeDsResult {
    return {
        acs_url: 'https://',
        payer_auth_request: 'auth_request',
        merchant_data: 'merchant_data',
        callback_url: '',
    };
}

export function getCardinalOrderData(): CardinalOrderData {
    const billingAddress = getBillingAddress();

    billingAddress.address2 = 'Address 2';

    return {
        billingAddress,
        shippingAddress: getShippingAddress(),
        currencyCode: 'USD',
        id: '123-abc',
        amount: 12000,
        paymentData: getCreditCardInstrument(),
    };
}

export function getCybersource(): PaymentMethod {
    return {
        id: 'cybersource',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Cybersource',
            is3dsEnabled: true,
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'cyberToken',
    };
}

export function getBarclays(): PaymentMethod {
    return {
        id: 'barclays',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Barclaycard Smartpay',
            is3dsEnabled: true,
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'barclaysToken',
    };
}
