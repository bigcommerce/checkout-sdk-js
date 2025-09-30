import { createScriptLoader } from '@bigcommerce/script-loader';

import PaypalSdkScriptLoader from './paypal-sdk-script-loader';

export default function createPaypalSdk(): PaypalSdkScriptLoader {
    return new PaypalSdkScriptLoader(createScriptLoader());
}
