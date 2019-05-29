import { OrderPaymentRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentRequestOptions } from '../../payment-request-options';

import {
    CardinalBinProccessResponse,
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

export function getCybersourcePaymentData(): OrderPaymentRequestBody {
    return {
        ...getOrderRequestBody().payment,
        methodId: 'cybersource',
    };
}

export function getCybersourcePaymentRequestOptions(): PaymentRequestOptions {
    return {
        methodId: 'cybersource',
    };
}

export function getCardinalBinProccessResponse(): CardinalBinProccessResponse {
    return {
        Status: true,
    };
}

export function getCardinalValidatedData(): CardinalValidatedData {
    return {
        ActionCode: CardinalValidatedAction.NOACTION,
        ErrorDescription: 'error',
        ErrorNumber: 12,
        Validated: true,
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
            ActionCode: CardinalValidatedAction.SUCCCESS,
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
