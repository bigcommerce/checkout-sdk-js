import { createScriptLoader } from '@bigcommerce/script-loader';

import PayPalSdkHelper from './paypal-sdk-helper';

export default function createBigCommercePaymentsSdk(): PayPalSdkHelper {
    return new PayPalSdkHelper(createScriptLoader());
}
