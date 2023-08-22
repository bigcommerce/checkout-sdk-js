import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeClientCreator,
    BraintreeDataCollector,
    BraintreeModuleCreator,
    HostWindow,
} from './apple-pay';
import ApplePayScriptLoader from './apple-pay-script-loader';
import {
    getBraintreeClientMock,
    getBraintreeDataCollectorMock,
    getModuleCreatorMock,
} from './mocks/apple-pay-method.mock';

const VERSION = '3.95.0';
const ALPHA_VERSION = '3.95.0-connect-alpha.11';

describe('BraintreeScriptLoader', () => {
    let applePayScriptLoader: ApplePayScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: HostWindow;

    const initializationData = {
        isAcceleratedCheckoutEnabled: true,
    };

    beforeEach(() => {
        mockWindow = { braintree: {} } as HostWindow;
        scriptLoader = {} as ScriptLoader;
        applePayScriptLoader = new ApplePayScriptLoader(scriptLoader, mockWindow);
    });

    describe('#loadBraintreeClient()', () => {
        let clientMock: BraintreeClientCreator;

        beforeEach(() => {
            clientMock = getModuleCreatorMock(getBraintreeClientMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.client = clientMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the client', async () => {
            await applePayScriptLoader.loadBraintreeClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${VERSION}/js/client.min.js`,
            );
        });

        it('returns the client from the window', async () => {
            const client = await applePayScriptLoader.loadBraintreeClient();

            expect(client).toBe(clientMock);
        });
    });

    describe('#loadBraintreeDataCollector()', () => {
        let dataCollectorMock: BraintreeModuleCreator<BraintreeDataCollector>;

        beforeEach(() => {
            dataCollectorMock = getModuleCreatorMock(getBraintreeDataCollectorMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.dataCollector = dataCollectorMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the data collector library', async () => {
            await applePayScriptLoader.loadBraintreeDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${VERSION}/js/data-collector.min.js`,
            );
        });

        it('loads the data collector library with braintree sdk alpha version', async () => {
            applePayScriptLoader.initialize(initializationData);

            await applePayScriptLoader.loadBraintreeDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${ALPHA_VERSION}/js/data-collector.min.js`,
            );
        });

        it('returns the data collector from the window', async () => {
            const dataCollector = await applePayScriptLoader.loadBraintreeDataCollector();

            expect(dataCollector).toBe(dataCollectorMock);
        });
    });
});
