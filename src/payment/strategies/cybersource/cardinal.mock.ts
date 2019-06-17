import { OrderPaymentRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import OrderRequestBody from '../../../order/order-request-body';

import { PaymentRequestOptions } from '../../payment-request-options';

import {
    CardinalBinProcessResponse,
    CardinalEventResponse,
    CardinalPaymentStep,
    CardinalPaymentType,
    CardinalSDK,
    CardinalValidatedAction,
    CardinalValidatedData,
    CardinalWindow,
} from './cardinal';

const CardinalWindowMock: CardinalWindow = window;

export function getCardinalScriptMock(): CardinalWindow {
    return {
        ... CardinalWindowMock,
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

export function getCybersourcePaymentRequestBody(): OrderPaymentRequestBody {
    return {
        ...getOrderRequestBody().payment,
        methodId: 'cybersource',
    };
}

export function getCybersourceOrderRequestBody(): OrderRequestBody {
    return {
        ...getOrderRequestBody(),
        payment: getCybersourcePaymentRequestBody(),
    };
}

export function getCybersourcePaymentRequestOptions(): PaymentRequestOptions {
    return {
        methodId: 'cybersource',
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
            ProcessorTransactionId: '',
            Type: CardinalPaymentType.CCA,
        },
    };
}

export function getRejectAuthorizationPromise(): CardinalEventResponse {
    return {
        step: CardinalPaymentStep.AUTHORIZATION,
        jwt: '',
        data: {
            ActionCode: CardinalValidatedAction.SUCCESS,
            ErrorDescription: 'error',
            ErrorNumber: 200,
            Validated: true,
            Payment: {
                ProcessorTransactionId: '',
                Type: CardinalPaymentType.CCA,
            },
        },
        status: true,
    };
}
