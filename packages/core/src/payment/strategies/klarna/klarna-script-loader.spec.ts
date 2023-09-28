import { createScriptLoader } from '@bigcommerce/script-loader';

import KlarnaScriptLoader from './klarna-script-loader';

describe('KlarnaScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const klarnaScriptLoader = new KlarnaScriptLoader(scriptLoader);

    it('loads widget script', () => {
        const loadScript = jest.spyOn(scriptLoader, 'loadScript');

        void klarnaScriptLoader.load();

        expect(loadScript).toHaveBeenCalledWith('//credit.klarnacdn.net/lib/v1/api.js');
    });
});
