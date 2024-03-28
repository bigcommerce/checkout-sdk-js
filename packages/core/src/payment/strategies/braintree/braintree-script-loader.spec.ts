import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    BRAINTREE_SDK_ALPHA_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import { getConfig } from '../../../config/configs.mock';

import {
    BraintreeClientCreator,
    BraintreeDataCollector,
    BraintreeHostedFields,
    BraintreeHostWindow,
    BraintreeModuleCreator,
    BraintreeThreeDSecure,
    BraintreeVisaCheckout,
} from './braintree';
import BraintreeScriptLoader from './braintree-script-loader';
import {
    getClientMock,
    getDataCollectorMock,
    getHostedFieldsMock,
    getModuleCreatorMock,
    getThreeDSecureMock,
    getVisaCheckoutMock,
} from './braintree.mock';

describe('BraintreeScriptLoader', () => {
    let braintreeScriptLoader: BraintreeScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: BraintreeHostWindow;

    const storeConfig = getConfig().storeConfig;
    const storeConfigWithFeaturesOn = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            features: {
                ...storeConfig.checkoutSettings.features,
                'PROJECT-5505.PayPal_Accelerated_Checkout_v2_for_Braintree': true,
            },
        },
    };

    beforeEach(() => {
        mockWindow = { braintree: {} } as BraintreeHostWindow;
        scriptLoader = {} as ScriptLoader;
        braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
    });

    describe('#loadClient()', () => {
        let clientMock: BraintreeClientCreator;

        beforeEach(() => {
            clientMock = getModuleCreatorMock(getClientMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.client = clientMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the client', async () => {
            await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/client.min.js`,
            );
        });

        it('loads the client with braintree sdk alpha version', async () => {
            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/client.min.js`,
            );
        });

        it('returns the client from the window', async () => {
            const client = await braintreeScriptLoader.loadClient();

            expect(client).toBe(clientMock);
        });
    });

    describe('#load3DS()', () => {
        let threeDSecureMock: BraintreeModuleCreator<BraintreeThreeDSecure>;

        beforeEach(() => {
            threeDSecureMock = getModuleCreatorMock(getThreeDSecureMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.threeDSecure = threeDSecureMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the ThreeDSecure library', async () => {
            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/three-d-secure.min.js`,
            );
        });

        it('loads the ThreeDSecure library with braintree sdk alpha version', async () => {
            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/three-d-secure.min.js`,
            );
        });

        it('returns the ThreeDSecure from the window', async () => {
            const threeDSecure = await braintreeScriptLoader.load3DS();

            expect(threeDSecure).toBe(threeDSecureMock);
        });
    });

    describe('#loadDataCollector()', () => {
        let dataCollectorMock: BraintreeModuleCreator<BraintreeDataCollector>;

        beforeEach(() => {
            dataCollectorMock = getModuleCreatorMock(getDataCollectorMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.dataCollector = dataCollectorMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the data collector library', async () => {
            await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/data-collector.min.js`,
            );
        });

        it('loads the data collector library with braintree sdk alpha version', async () => {
            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/data-collector.min.js`,
            );
        });

        it('returns the data collector from the window', async () => {
            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(dataCollector).toBe(dataCollectorMock);
        });
    });

    describe('#loadVisaCheckout()', () => {
        let visaCheckoutMock: BraintreeModuleCreator<BraintreeVisaCheckout>;

        beforeEach(() => {
            visaCheckoutMock = getModuleCreatorMock(getVisaCheckoutMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.visaCheckout = visaCheckoutMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the VisaCheckout library', async () => {
            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/visa-checkout.min.js`,
            );
        });

        it('loads the VisaCheckout library with braintree sdk alpha version', async () => {
            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/visa-checkout.min.js`,
            );
        });

        it('returns the VisaCheckout from the window', async () => {
            const visaCheckout = await braintreeScriptLoader.loadVisaCheckout();

            expect(visaCheckout).toBe(visaCheckoutMock);
        });
    });

    describe('#loadHostedFields()', () => {
        let hostedFields: BraintreeModuleCreator<BraintreeHostedFields>;

        beforeEach(() => {
            hostedFields = getModuleCreatorMock(getHostedFieldsMock());

            scriptLoader.loadScript = jest.fn(() => {
                // tslint:disable-next-line:no-non-null-assertion
                mockWindow.braintree!.hostedFields = hostedFields;

                return Promise.resolve();
            });
        });

        it('loads hosted fields module', async () => {
            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/hosted-fields.min.js`,
            );
        });

        it('loads hosted fields module with braintree sdk alpha version', async () => {
            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/hosted-fields.min.js`,
            );
        });

        it('returns hosted fields from window', async () => {
            expect(await braintreeScriptLoader.loadHostedFields()).toBe(hostedFields);
        });
    });
});
