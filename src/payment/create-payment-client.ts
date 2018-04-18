/// <reference path="../payment/bigpay-client.d.ts" />
import { createClient as createBigpayClient } from '@bigcommerce/bigpay-client';

import { CheckoutStore } from '../checkout';

export default function createPaymentClient(store: CheckoutStore): any {
    const paymentClient: any = createBigpayClient(store);

    store.subscribe(
        ({ checkout: { getConfig } }) => {
            const config = getConfig();

            if (config) {
                paymentClient.setHost(config.bigpayBaseUrl);
            }
        },
        ({ checkout: { getConfig } }) => getConfig()
    );

    return paymentClient;
}
