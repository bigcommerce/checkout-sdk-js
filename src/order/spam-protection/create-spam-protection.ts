import { ScriptLoader } from '@bigcommerce/script-loader';

import { MutationObserverFactory } from '../../common/dom/mutation-observer';

import GoogleRecaptcha from './google-recaptcha';
import GoogleRecaptchaScriptLoader from './google-recaptcha-script-loader';

export default function createSpamProtection(scriptLoader: ScriptLoader) {
    return new GoogleRecaptcha(
        new GoogleRecaptchaScriptLoader(scriptLoader),
        new MutationObserverFactory()
    );
}
