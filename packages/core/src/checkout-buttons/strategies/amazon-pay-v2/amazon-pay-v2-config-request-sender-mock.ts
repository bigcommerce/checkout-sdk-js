import { CheckoutConfig } from './amazon-pay-v2-config-request-sender';

export function getCheckoutRequestConfig(): CheckoutConfig {
    return {
        payload: 'payload',
        signature: 'signature',
        public_key: 'public_key',
    };
}
