import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import { getClearpay } from '../../payment-methods.mock';

import ClearpayScriptLoader from './clearpay-script-loader';

describe('ClearpayScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const clearpayScriptLoader = new ClearpayScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(scriptLoader, 'loadScript')
            .mockReturnValue(Promise.resolve(new Event('load')));
    });

    it('loads widget script', () => {
        const method = getClearpay();

        clearpayScriptLoader.load(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.clearpay.co.uk/afterpay-async.js'
        );
    });

    it('loads sandbox widget script if in test mode', () => {
        const method = merge({}, getClearpay(), { config: { testMode: true } });

        clearpayScriptLoader.load(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.sandbox.clearpay.co.uk/afterpay-async.js'
        );
    });
});
