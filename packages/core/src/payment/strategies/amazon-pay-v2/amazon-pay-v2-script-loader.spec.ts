import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';
import { getAmazonPayV2 as getPaymentMethodMock } from '../../payment-methods.mock';

import { AmazonPayV2HostWindow, AmazonPayV2SDK } from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import { getAmazonPayV2SDKMock } from './amazon-pay-v2.mock';

describe('AmazonPayV2ScriptLoader', () => {
    let amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: AmazonPayV2HostWindow;

    beforeEach(() => {
        mockWindow = {} as AmazonPayV2HostWindow;
        scriptLoader = {} as ScriptLoader;
        amazonPayV2ScriptLoader = new AmazonPayV2ScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let amazonPayV2SDK: AmazonPayV2SDK;

        beforeEach(() => {
            amazonPayV2SDK = getAmazonPayV2SDKMock();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.amazon = amazonPayV2SDK;

                return Promise.resolve();
            });
        });

        it('loads the USA SDK if US region is passed on Payment Method', async () => {
            await amazonPayV2ScriptLoader.load(getPaymentMethodMock());

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-na.payments-amazon.com/checkout.js');
        });

        it('loads the Europe SDK if EU region is passed on Payment Method', async () => {
            await amazonPayV2ScriptLoader.load(getPaymentMethodMock('de'));

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-eu.payments-amazon.com/checkout.js');
        });

        it('loads the Japan SDK if JP region is passed on Payment Method', async () => {
            await amazonPayV2ScriptLoader.load(getPaymentMethodMock('jp'));

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-fe.payments-amazon.com/checkout.js');
        });

        it('returns the SDK from the window', async () => {
            const sdk = await amazonPayV2ScriptLoader.load(getPaymentMethodMock());

            expect(sdk).toBe(amazonPayV2SDK);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.amazon = undefined;

                return Promise.resolve();
            });

            await expect(amazonPayV2ScriptLoader.load(getPaymentMethodMock())).rejects.toThrow(PaymentMethodClientUnavailableError);
        });
    });
});
