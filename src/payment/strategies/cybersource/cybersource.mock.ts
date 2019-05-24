import { OrderPaymentRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentRequestOptions } from '../../payment-request-options';

import { CardinalWindow, CyberSourceCardinal } from './cybersource';

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

export function getCyberSourceCardinal(): CyberSourceCardinal {
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
