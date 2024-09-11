import { CheckoutConfig } from '../amazon-pay-v2-request-sender';

export function getAmazonPayV2RequestSenderMock() {
    return {
        createCheckoutConfig: jest.fn(() => Promise.resolve({ body: getCheckoutRequestConfig() })),
    };
}

export function getCheckoutRequestConfig(): CheckoutConfig {
    return {
        payload: 'payload',
        signature: 'signature',
        public_key: 'public_key',
    };
}
