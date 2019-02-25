import {getScriptLoader} from '@bigcommerce/script-loader';

import {StripeScriptLoader} from '../stripe';

import ThreeDSecureProcessor from './threedsecure-processor';

export default function createThreeDSecureProcessor() {
    const scriptLoader = getScriptLoader();

    return new ThreeDSecureProcessor(
        new StripeScriptLoader(scriptLoader)
    );
}
