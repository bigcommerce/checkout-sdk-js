import { RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions } from '../../payment-request-options';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { AdyenCardState, AdyenCheckout, AdyenConfiguration, ResultCode, ThreeDSRequiredErrorResponse } from './adyenv2';

export function getAdyenCheckout(): AdyenCheckout {
    return {
        create: jest.fn(() => {
            return {
                mount: jest.fn(),
                unmount: jest.fn(),
            };
        }),
    };
}

export function getAdyenConfiguration(): AdyenConfiguration {
    return {
        environment: 'test',
        originKey: 'YOUR_ORIGIN_KEY',
    };
}

export function getAdyenInitializeOptions(): PaymentInitializeOptions {
    return {
        methodId: 'adyenv2',
        adyenv2: {
            containerId: 'adyen-component-field',
            threeDS2ContainerId: 'adyen-component-field-3ds',
            options: {
                hasHolderName: true,
                styles: {},
                placeholders: {},
            },
            threeDS2Options: {
                widgetSize: '1',
                onComplete: jest.fn(),
                onLoad: jest.fn(),
            },
        },
    };
}

export function getAdyenOrderRequestBody(): OrderRequestBody {
    return {
        payment: {
            methodId: 'adyenv2',
        },
    };
}

function getCardState() {
    return {
        data: {
            paymentMethod: {
                encryptedCardNumber: 'CARD_NUMBER',
                encryptedExpiryMonth: 'EXPIRY_MONTH',
                encryptedExpiryYear: 'EXPIRY_YEAR',
                encryptedSecurityCode: 'CVV',
                type: 'scheme',
            },
        },
    };
}

export function getValidCardState(): AdyenCardState {
    return {
        ...getCardState(),
        isValid: true,
    };
}

export function getInvalidCardState(): AdyenCardState {
    return {
        ...getCardState(),
        isValid: false,
    };
}

export function getValidChallengeResponse(): any {
    return {
        threeDS2Token: 'token',
        paymentData: 'paymentData',
    };
}

function getChallengeShopperErrorResponse(): ThreeDSRequiredErrorResponse {
    return {
        errors: [
            { code: 'three_d_secure_required' },
        ],
        three_ds_result: {
            result_code: ResultCode.ChallengeShopper,
            token: 'token',
            payment_data: 'paymentData',
        },
        status: 'error',
    };
}

export function getChallengeShopperError(): RequestError {
    return new RequestError(getResponse({
        ...getErrorPaymentResponseBody(),
        ...getChallengeShopperErrorResponse(),
    }));
}

export function getIdentifyShopperErrorResponse(): ThreeDSRequiredErrorResponse {
    return {
        errors: [
            { code: 'three_d_secure_required' },
        ],
        three_ds_result: {
            result_code: ResultCode.IdentifyShopper,
            token: 'token',
            payment_data: 'paymentData',
        },
        status: 'error',
    };
}
export function getIdentifyShopperError(): RequestError {
    return new RequestError(getResponse({
        ...getErrorPaymentResponseBody(),
        ...getIdentifyShopperErrorResponse(),
    }));
}

function getRedirectShopperErrorResponse(): ThreeDSRequiredErrorResponse {
    return {
        errors: [
            { code: 'three_d_secure_required' },
        ],
        three_ds_result: {
            result_code: ResultCode.RedirectShopper,
            acs_url: 'https://acs/url',
            callback_url: 'https://callback/url',
            payer_auth_request: 'payer_auth_request',
            merchant_data: 'merchant_data',
        },
        status: 'error',
    };
}

export function getRedirectShopperError(): RequestError {
    return new RequestError(getResponse({
        ...getErrorPaymentResponseBody(),
        ...getRedirectShopperErrorResponse(),
    }));
}
