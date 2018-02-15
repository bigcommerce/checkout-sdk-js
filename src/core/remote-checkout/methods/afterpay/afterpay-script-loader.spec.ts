import { merge } from 'lodash';
import { getAfterpay } from '../../../payment/payment-methods.mock';
import AfterpayScriptLoader from './afterpay-script-loader';
import ScriptLoader from '../../../../script-loader/script-loader';

describe('AfterpayScriptLoader', () => {
    const scriptLoader = new ScriptLoader(document);
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
