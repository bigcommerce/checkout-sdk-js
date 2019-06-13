import { OrderPaymentRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import OrderRequestBody from '../../../order/order-request-body';

import { PaymentRequestOptions } from '../../payment-request-options';

import {
    CardinalBinProcessResponse,
    CardinalEventAction,
    CardinalEventResponse,
    CardinalPaymentStep,
    CardinalValidatedAction,
    CardinalValidatedData,
    CardinalWindow,
    CyberSourceCardinal,
    PaymentType,
} from './cybersource';

const CardinalWindowMock: CardinalWindow = window;

export function getCyberSourceScriptMock(): CardinalWindow {
    return {
        ... CardinalWindowMock,
        Cardinal: {
            configure: jest.fn(),
            on: jest.fn(),
            setup: jest.fn(),
            trigger: jest.fn(),
            continue: jest.fn(),
        },
    };
}

export function getCybersourceCardinal(): CyberSourceCardinal {
    return {
        configure: jest.fn(),
        on: jest.fn(),
        setup: jest.fn(),
        trigger: jest.fn(),
        continue: jest.fn(),
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
            Type: PaymentType.CCA,
        },
    };
}

export function getRejectAuthorizationPromise(): CardinalEventResponse {
    return {
        type: {
            step: CardinalPaymentStep.AUTHORIZATION,
            action: CardinalEventAction.OK,
        },
        jwt: '',
        data: {
            ActionCode: CardinalValidatedAction.SUCCESS,
            ErrorDescription: 'error',
            ErrorNumber: 200,
            Validated: true,
            Payment: {
                ProcessorTransactionId: '',
                Type: PaymentType.CCA,
            },
        },
        status: true,
    };
}
