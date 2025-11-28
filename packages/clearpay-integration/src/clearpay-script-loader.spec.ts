import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

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

    it('loads https PROD widget script when experiment is enabled', () => {
        const method = getClearpay();
        const features = { 'PI-4555.clearpay_add_https_to_prod_script': true } as any;

        clearpayScriptLoader.load(method, features);

        expect(loadScript).toHaveBeenCalledWith('https://portal.clearpay.co.uk/afterpay-async.js');
    });

    it('throws an error when window is not set', async () => {
        const scriptLoader = {} as ScriptLoader;

        scriptLoader.loadScript = jest.fn(() => {
            return Promise.resolve();
        });

        const method = merge({}, getClearpay(), { config: { testMode: true } });
        const clearpayScriptLoader = new ClearpayScriptLoader(scriptLoader, {
            AfterPay: undefined,
        } as any);

        try {
            await clearpayScriptLoader.load(method);
        } catch (error) {
            expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
        }
    });
});
