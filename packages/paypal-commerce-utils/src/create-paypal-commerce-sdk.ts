import { createScriptLoader } from '@bigcommerce/script-loader';

import PayPalCommerceSdk from './paypal-commerce-sdk';

export default function createPayPalCommerceSdk(): PayPalCommerceSdk {
    return new PayPalCommerceSdk(createScriptLoader());
}
