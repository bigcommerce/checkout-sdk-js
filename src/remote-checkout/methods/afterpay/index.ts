import { createScriptLoader } from '@bigcommerce/script-loader';

import AfterpayScriptLoader from './afterpay-script-loader';

export default AfterpayScriptLoader;

export function createAfterpayScriptLoader(): AfterpayScriptLoader {
    const scriptLoader = createScriptLoader();
    return new AfterpayScriptLoader(scriptLoader);
}
