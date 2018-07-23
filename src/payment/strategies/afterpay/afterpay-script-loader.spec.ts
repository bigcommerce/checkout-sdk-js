import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import { getAfterpay } from '../../payment-methods.mock';

import AfterpayScriptLoader from './afterpay-script-loader';

describe('AfterpayScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const afterpayScriptLoader = new AfterpayScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(scriptLoader, 'loadScript')
            .mockReturnValue(Promise.resolve(new Event('load')));
    });

    it('loads widget script for AU & NZ', () => {
        const method = getAfterpay();

        afterpayScriptLoader.load(method, 'AU');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.afterpay.com/afterpay-async.js'
        );

        afterpayScriptLoader.load(method, 'NZ');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.afterpay.com/afterpay-async.js'
        );
    });

    it('loads sandbox widget script if in test mode for AU & NZ', () => {
        const method = merge({}, getAfterpay(), { config: { testMode: true } });

        afterpayScriptLoader.load(method, 'AU');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal-sandbox.afterpay.com/afterpay-async.js'
        );

        afterpayScriptLoader.load(method, 'NZ');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal-sandbox.afterpay.com/afterpay-async.js'
        );
    });

    it('loads widget script for US', () => {
        const method = getAfterpay();

        afterpayScriptLoader.load(method, 'US');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.afterpay.com/afterpay-async.js'
        );
    });

    it('loads sandbox widget script if in test mode for US', () => {
        const method = merge({}, getAfterpay(), { config: { testMode: true } });

        afterpayScriptLoader.load(method, 'US');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.us-sandbox.afterpay.com/afterpay-async.js'
        );
    });
});
