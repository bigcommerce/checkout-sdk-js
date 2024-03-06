import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import AfterpayScriptLoader from './afterpay-script-loader';
import { getAfterpay } from './afterpay.mock';
import * as isAfterpayWindow from './is-afterpay-window';

describe('AfterpayScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const afterpayScriptLoader = new AfterpayScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(isAfterpayWindow, 'default').mockReturnValue(true);

        jest.spyOn(scriptLoader, 'loadScript').mockReturnValue(Promise.resolve(new Event('load')));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('loads widget script for AU & NZ', async () => {
        const method = getAfterpay();

        await afterpayScriptLoader.load(method, 'AU');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.afterpay.com/afterpay-async.js',
        );

        await afterpayScriptLoader.load(method, 'NZ');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.afterpay.com/afterpay-async.js',
        );
    });

    it('loads sandbox widget script if in test mode for AU & NZ', async () => {
        const method = merge({}, getAfterpay(), { config: { testMode: true } });

        await afterpayScriptLoader.load(method, 'AU');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal-sandbox.afterpay.com/afterpay-async.js',
        );

        await afterpayScriptLoader.load(method, 'NZ');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal-sandbox.afterpay.com/afterpay-async.js',
        );
    });

    it('loads widget script for US', async () => {
        const method = getAfterpay();

        await afterpayScriptLoader.load(method, 'US');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.afterpay.com/afterpay-async.js',
        );
    });

    it('loads sandbox widget script if in test mode for US', async () => {
        const method = merge({}, getAfterpay(), { config: { testMode: true } });

        await afterpayScriptLoader.load(method, 'US');

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//portal.sandbox.afterpay.com/afterpay-async.js',
        );
    });
});
