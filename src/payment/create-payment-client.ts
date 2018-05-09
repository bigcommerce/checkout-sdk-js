/// <reference path="../payment/bigpay-client.d.ts" />
import { createClient as createBigpayClient } from '@bigcommerce/bigpay-client';

import { CheckoutStore } from '../checkout';

export default function createPaymentClient(store: CheckoutStore) {
    const paymentClient = createBigpayClient();

    store.subscribe(
        state => {
            const config = state.config.getConfig();

            if (config) {
                paymentClient.setHost(config.paymentSettings.bigpayBaseUrl);
            }
        },
        state => state.config.getConfig()
    );

    return paymentClient;
}
