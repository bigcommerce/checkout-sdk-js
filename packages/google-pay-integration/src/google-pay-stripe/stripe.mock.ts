import { StripeUPEClient } from './types';

export function getStripeUPEJsMock(): StripeUPEClient {
    return {
        confirmCardPayment: jest.fn(),
        retrievePaymentIntent: jest.fn(),
    };
}
