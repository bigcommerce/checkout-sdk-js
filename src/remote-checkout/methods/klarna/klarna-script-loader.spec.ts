import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import KlarnaScriptLoader from './klarna-script-loader';

describe('KlarnaScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const klarnaScriptLoader = new KlarnaScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(scriptLoader, 'loadScript').mockReturnValue(Promise.resolve(true));
    });

    it('loads widget script', () => {
        klarnaScriptLoader.load();

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//credit.klarnacdn.net/lib/v1/api.js'
        );
    });

    it('loads widget only once', () => {
        klarnaScriptLoader.load();
        klarnaScriptLoader.load();

        expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
    });
});
