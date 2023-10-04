import { createScriptLoader } from '@bigcommerce/script-loader';

import KlarnaV2ScriptLoader from './klarnav2-script-loader';

describe('KlarnaV2ScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const klarnav2ScriptLoader = new KlarnaV2ScriptLoader(scriptLoader);
    const loadScript = jest.spyOn(scriptLoader, 'loadScript');

    it('loads widget script', () => {
        klarnav2ScriptLoader.load();

        expect(loadScript).toHaveBeenCalledWith('https://x.klarnacdn.net/kp/lib/v1/api.js');
    });
});
