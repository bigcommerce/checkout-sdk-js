/// <reference path="../payment/bigpay-client.d.ts" />
import { createClient as createBigpayClient } from '@bigcommerce/bigpay-client';

import { CheckoutStore } from '../checkout';
import LegacyConfig from '../config/legacy-config';

export default function createPaymentClient(store: CheckoutStore): any {
    const paymentClient: any = createBigpayClient(store);

    store.subscribe(
        ({ checkout: { getConfig } }) => {
            const config: LegacyConfig = getConfig()!;

            if (config) {
                paymentClient.setHost(config.bigpayBaseUrl);
            }
        },
        ({ checkout: { getConfig } }) => getConfig()
    );

    return paymentClient;
}
