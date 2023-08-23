import { getScriptLoader } from '@bigcommerce/script-loader';

import GooglePayScriptLoader from '../google-pay-script-loader';

export default function createGooglePayScriptLoader() {
    return new GooglePayScriptLoader(getScriptLoader());
}
