import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { ThreeDsResult } from '../../payment-response-body';
import { getCreditCardInstrument } from '../../payments.mock';

import { CardinalBinProcessResponse, CardinalOrderData, CardinalPaymentType, CardinalSignatureVerification, CardinalSDK, CardinalValidatedAction, CardinalValidatedData, CardinalWindow } from '.';

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

export function getCardinalValidatedData(actionCode: CardinalValidatedAction, status: boolean, errorNumber?: number): CardinalValidatedData {
    return {
        ActionCode: actionCode,
        ErrorDescription: '',
        ErrorNumber: errorNumber ? errorNumber : 0,
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
