import { createScriptLoader } from '@bigcommerce/script-loader';

import SquareScriptLoader from './square-script-loader';

describe('SquareScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const squareScriptLoader = new SquareScriptLoader(scriptLoader);

    beforeEach(() => {
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(scriptLoader, 'loadScript').mockReturnValue(Promise.resolve(true));
    });

    it('loads widget script', () => {
        squareScriptLoader.load(false);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith('//js.squareup.com/v2/paymentform');
    });

    it('loads widget script when true is passed to load', () => {
        squareScriptLoader.load(true);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//js.squareupsandbox.com/v2/paymentform',
        );
    });
});
