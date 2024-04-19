import GooglePayScriptLoader from '../google-pay-script-loader';

import createGooglePayScriptLoader from './create-google-pay-script-loader';

describe('createGooglePayScriptLoader', () => {
    it('instantiates google pay script loader', () => {
        const scriptLoader = createGooglePayScriptLoader();

        expect(scriptLoader).toBeInstanceOf(GooglePayScriptLoader);
    });
});
