import { createScriptLoader } from '@bigcommerce/script-loader';

import PayPalSdkScriptLoader from './paypal-sdk-script-loader';

export default function createPayPalSdkScriptLoader(): PayPalSdkScriptLoader {
    return new PayPalSdkScriptLoader(createScriptLoader());
}
