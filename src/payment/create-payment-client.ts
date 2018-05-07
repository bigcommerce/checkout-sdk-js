/// <reference path="../payment/bigpay-client.d.ts" />
import { createClient as createBigpayClient } from '@bigcommerce/bigpay-client';

import { CheckoutStore } from '../checkout';

export default function createPaymentClient(store: CheckoutStore): any {
    const paymentClient: any = createBigpayClient();

    store.subscribe(
        ({ checkout: { getConfig } }) => {
            const config = getConfig();

            if (config) {
                paymentClient.setHost(config.paymentSettings.bigpayBaseUrl);
            }
        },
        ({ checkout: { getConfig } }) => getConfig()
    );

    return paymentClient;
}
