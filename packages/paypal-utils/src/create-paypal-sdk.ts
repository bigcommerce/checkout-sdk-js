import { createScriptLoader } from '@bigcommerce/script-loader';

import PaypalSdk from './paypal-sdk';

export default function createPaypalSdk(): PaypalSdk {
    return new PaypalSdk(createScriptLoader());
}
