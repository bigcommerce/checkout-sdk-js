import { Quadpay, QuadpayResponse } from './quadpay';

export function getQuadpayScriptMock(status: string): Quadpay {
    let mockQuadpayResponse: QuadpayResponse;
    switch (status) {
    case 'approved':
        mockQuadpayResponse = {
            checkoutId: 'checkoutId',
            customerId: 'customerId',
            state: 'approved',
        };
        break;

    case 'cancelled':
        mockQuadpayResponse = {
            checkoutId: '',
            customerId: '',
            state: 'cancelled',
        };
        break;

    case 'referred':
        mockQuadpayResponse = {
            checkoutId: 'checkoutId',
            customerId: '',
            state: 'referred',
        };
        break;

    case 'declined':
        mockQuadpayResponse = {
            checkoutId: '',
            customerId: '',
            state: 'declined',
        };
        break;

    case 'noCheckoutId':
        mockQuadpayResponse = {
            checkoutId: '',
            customerId: '',
            state: 'approved',
        };
        break;

    default:
        mockQuadpayResponse = {
            checkoutId: '',
            customerId: '',
            state: 'error',
        };
        break;

    }

    return {
        Checkout: {
            attachButton: jest.fn(),
            init: jest.fn(payload => {
                new Promise(resolve => {
                    payload.onCheckout(resolve);
                })
                    .then(() => payload.onComplete(mockQuadpayResponse));
            }),
        },
    };
}
