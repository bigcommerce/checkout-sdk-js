import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AmazonPayv2HostWindow, AmazonPayv2SDK } from './amazon-payv2';
import AmazonPayv2ScriptLoader from './amazon-payv2-script-loader';
import { getAmazonPayv2SDKMock, getPaymentMethodMock } from './amazon-payv2.mock';

describe('AmazonPayv2ScriptLoader', () => {
    let amazonPayv2ScriptLoader: AmazonPayv2ScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: AmazonPayv2HostWindow;

    beforeEach(() => {
        mockWindow = {} as AmazonPayv2HostWindow;
        scriptLoader = {} as ScriptLoader;
        amazonPayv2ScriptLoader = new AmazonPayv2ScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let amazonPayv2SDK: AmazonPayv2SDK;

        beforeEach(() => {
            amazonPayv2SDK = getAmazonPayv2SDKMock();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.amazon = amazonPayv2SDK;

                return Promise.resolve();
            });
        });

        it('loads the USA SDK if US region is passed on Payment Method', async () => {
            await amazonPayv2ScriptLoader.load(getPaymentMethodMock());

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-na.payments-amazon.com/checkout.js');
        });

        it('loads the Europe SDK if EU region is passed on Payment Method', async () => {
            await amazonPayv2ScriptLoader.load(getPaymentMethodMock('de'));

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-eu.payments-amazon.com/checkout.js');
        });

        it('loads the Japan SDK if JP region is passed on Payment Method', async () => {
            await amazonPayv2ScriptLoader.load(getPaymentMethodMock('jp'));

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-fe.payments-amazon.com/checkout.js');
        });

        it('returns the SDK from the window', async () => {
            const sdk = await amazonPayv2ScriptLoader.load(getPaymentMethodMock());

            expect(sdk).toBe(amazonPayv2SDK);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.amazon = undefined;

                return Promise.resolve();
            });

            await expect(amazonPayv2ScriptLoader.load(getPaymentMethodMock())).rejects.toThrow(PaymentMethodClientUnavailableError);
        });
    });
});
