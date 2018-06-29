import { createScriptLoader } from '@bigcommerce/script-loader';

import SquareScriptLoader from './square-script-loader';

describe('SquareScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const squareScriptLoader = new SquareScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(scriptLoader, 'loadScript').mockReturnValue(Promise.resolve(true));
    });

    it('loads widget script', () => {
        squareScriptLoader.load();

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//js.squareup.com/v2/paymentform'
        );
    });
});
