import { createScriptLoader } from '@bigcommerce/script-loader';

import BigCommercePaymentsSdk from './bigcommerce-payments-sdk';

export default function createBigCommercePaymentsSdk(): BigCommercePaymentsSdk {
    return new BigCommercePaymentsSdk(createScriptLoader());
}
