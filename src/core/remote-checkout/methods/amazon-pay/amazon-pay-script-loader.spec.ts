import { merge } from 'lodash';
import { getAmazonPay } from '../../../payment/payment-methods.mock';
import AmazonPayScriptLoader from './amazon-pay-script-loader';
import ScriptLoader from '../../../../script-loader/script-loader';

describe('AmazonPayScriptLoader', () => {
    const scriptLoader = new ScriptLoader(document);
    const amazonPayScriptLoader = new AmazonPayScriptLoader(scriptLoader);

    beforeEach(() => {
        jest.spyOn(scriptLoader, 'loadScript')
            .mockReturnValue(Promise.resolve(new Event('load')));
    });

    it('loads widget script', () => {
        const method = getAmazonPay();

        amazonPayScriptLoader.loadWidget(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            `https://static-na.payments-amazon.com/OffAmazonPayments/us/js/Widgets.js?sellerId=${method.config.merchantId}`
        );
    });

    it('loads widget script for different region', () => {
        const method = merge({}, getAmazonPay(), { initializationData: { region: 'EU' } });

        amazonPayScriptLoader.loadWidget(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            `https://static-na.payments-amazon.com/OffAmazonPayments/eu/lpa/js/Widgets.js?sellerId=${method.config.merchantId}`
        );
    });

    it('loads sandbox widget script if in test mode', () => {
        const method = merge({}, getAmazonPay(), { config: { testMode: true } });

        amazonPayScriptLoader.loadWidget(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            `https://static-na.payments-amazon.com/OffAmazonPayments/us/sandbox/js/Widgets.js?sellerId=${method.config.merchantId}`
        );
    });
});
