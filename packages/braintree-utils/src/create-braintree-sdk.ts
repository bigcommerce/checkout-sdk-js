import { getScriptLoader } from '@bigcommerce/script-loader';

import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSdk from './braintree-sdk';

const createBraintreeSdk = () => {
    const braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);

    return new BraintreeSdk(braintreeScriptLoader);
};

export default createBraintreeSdk;
