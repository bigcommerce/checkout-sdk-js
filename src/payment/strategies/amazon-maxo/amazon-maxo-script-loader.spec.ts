import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AmazonMaxoHostWindow, AmazonMaxoSDK } from './amazon-maxo';
import AmazonMaxoScriptLoader from './amazon-maxo-script-loader';
import { getAmazonMaxoSDKMock, getPaymentMethodMock } from './amazon-maxo.mock';

describe('AmazonMaxoScriptLoader', () => {
    let amazonMaxoScriptLoader: AmazonMaxoScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: AmazonMaxoHostWindow;

    beforeEach(() => {
        mockWindow = {} as AmazonMaxoHostWindow;
        scriptLoader = {} as ScriptLoader;
        amazonMaxoScriptLoader = new AmazonMaxoScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let amazonMaxoSDK: AmazonMaxoSDK;

        beforeEach(() => {
            amazonMaxoSDK = getAmazonMaxoSDKMock();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.amazon = amazonMaxoSDK;

                return Promise.resolve();
            });
        });

        it('loads the USA SDK if US region is passed on Payment Method', async () => {
            await amazonMaxoScriptLoader.load(getPaymentMethodMock());

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-na.payments-amazon.com/checkout.js');
        });

        it('loads the Europe SDK if EU region is passed on Payment Method', async () => {
            await amazonMaxoScriptLoader.load(getPaymentMethodMock('de'));

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-eu.payments-amazon.com/checkout.js');
        });

        it('loads the Japan SDK if JP region is passed on Payment Method', async () => {
            await amazonMaxoScriptLoader.load(getPaymentMethodMock('jp'));

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://static-fe.payments-amazon.com/checkout.js');
        });

        it('returns the SDK from the window', async () => {
            const sdk = await amazonMaxoScriptLoader.load(getPaymentMethodMock());

            expect(sdk).toBe(amazonMaxoSDK);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.amazon = undefined;

                return Promise.resolve();
            });

            await expect(amazonMaxoScriptLoader.load(getPaymentMethodMock())).rejects.toThrow(PaymentMethodClientUnavailableError);
        });
    });
});
