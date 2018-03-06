import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { getAfterpay } from '../../../payment/payment-methods.mock';
import AfterpayScriptLoader from './afterpay-script-loader';

describe('AfterpayScriptLoader', () => {
    const scriptLoader = createScriptLoader();
    const afterpayScriptLoader = new AfterpayScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(scriptLoader, 'loadScript')
            .mockReturnValue(Promise.resolve(new Event('load')));
    });

    it('loads widget script', () => {
        const method = getAfterpay();

        afterpayScriptLoader.load(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//www.secure-afterpay.com.au/afterpay-async.js'
        );
    });

    it('loads sandbox widget script if in test mode', () => {
        const method = merge({}, getAfterpay(), { config: { testMode: true } });

        afterpayScriptLoader.load(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            '//www-sandbox.secure-afterpay.com.au/afterpay-async.js'
        );
    });
});
