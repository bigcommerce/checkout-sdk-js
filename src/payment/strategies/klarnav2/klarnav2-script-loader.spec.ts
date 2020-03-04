import { createScriptLoader } from '@bigcommerce/script-loader';

import KlarnaV2ScriptLoader from './klarnav2-script-loader';

describe('KlarnaV2ScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const klarnav2ScriptLoader = new KlarnaV2ScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(scriptLoader, 'loadScript').mockReturnValue(Promise.resolve(true));
    });

    it('loads widget script', () => {
        klarnav2ScriptLoader.load();

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            'https://x.klarnacdn.net/kp/lib/v1/api.js'
        );
    });
});
