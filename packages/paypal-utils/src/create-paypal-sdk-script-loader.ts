import { createScriptLoader } from '@bigcommerce/script-loader';

import PaypalSdkScriptLoader from './paypal-sdk-script-loader';

export default function createPaypalSdkScriptLoader(): PaypalSdkScriptLoader {
    return new PaypalSdkScriptLoader(createScriptLoader());
}
