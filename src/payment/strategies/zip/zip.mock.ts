import { Zip, ZipResponse } from './zip';

export function getZipScriptMock(status: string): Zip {
    let mockZipResponse: ZipResponse;
    switch (status) {
    case 'approved':
        mockZipResponse = {
            checkoutId: 'checkoutId',
            customerId: 'customerId',
            state: 'approved',
        };
        break;

    case 'cancelled':
        mockZipResponse = {
            checkoutId: '',
            customerId: '',
            state: 'cancelled',
        };
        break;

    case 'referred':
        mockZipResponse = {
            checkoutId: 'checkoutId',
            customerId: '',
            state: 'referred',
        };
        break;

    case 'declined':
        mockZipResponse = {
            checkoutId: '',
            customerId: '',
            state: 'declined',
        };
        break;

    case 'noCheckoutId':
        mockZipResponse = {
            checkoutId: '',
            customerId: '',
            state: 'approved',
        };
        break;

    default:
        mockZipResponse = {
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
                    .then(() => payload.onComplete(mockZipResponse));
            }),
        },
    };
}
