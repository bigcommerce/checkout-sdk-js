import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import ClearpayScriptLoader from './clearpay-script-loader';
import { getClearpay } from './clearpay.mock';

describe('ClearpayScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const clearpayScriptLoader = new ClearpayScriptLoader(scriptLoader);
    const loadScript = jest.spyOn(scriptLoader, 'loadScript');

    it('loads widget script', () => {
        const method = getClearpay();

        clearpayScriptLoader.load(method);

        expect(loadScript).toHaveBeenCalledWith('//portal.clearpay.co.uk/afterpay-async.js');
    });

    it('loads sandbox widget script if in test mode', () => {
        const method = merge({}, getClearpay(), { config: { testMode: true } });

        clearpayScriptLoader.load(method);

        expect(loadScript).toHaveBeenCalledWith(
            '//portal.sandbox.clearpay.co.uk/afterpay-async.js',
        );
    });
});
