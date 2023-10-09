import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getConfig } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    BraintreeClientCreator,
    BraintreeConnect,
    BraintreeDataCollector,
    BraintreeHostWindow,
    BraintreeLocalPaymentCreator,
    BraintreeModuleCreator,
    BraintreePaypalCheckoutCreator,
    BraintreeThreeDSecureCreator,
    GooglePayCreator,
} from './braintree';
import BraintreeScriptLoader from './braintree-script-loader';
import {
    getBraintreeLocalPaymentMock,
    getClientMock,
    getConnectMock,
    getDataCollectorMock,
    getGooglePayMock,
    getModuleCreatorMock,
    getPaypalCheckoutMock,
} from './mocks/braintree.mock';
import { BRAINTREE_SDK_ALPHA_VERSION, BRAINTREE_SDK_STABLE_VERSION } from './sdk-verison';

describe('BraintreeScriptLoader', () => {
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
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/client.min.js`,
            );
            expect(client).toBe(clientMock);
        });

        it('loads the client with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/client.min.js`,
            );
            expect(client).toBe(clientMock);
        });

        it('loads the client throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadClient();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the client throw error if client does not exist in window.braintree', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadClient();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#loadConnect()', () => {
        let connectCreatorMock: BraintreeModuleCreator<BraintreeConnect>;

        beforeEach(() => {
            connectCreatorMock = getModuleCreatorMock(getConnectMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.connect = connectCreatorMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the connect', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const connect = await braintreeScriptLoader.loadConnect();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/connect.min.js`,
            );
            expect(connect).toBe(connectCreatorMock);
        });

        it('loads the connect with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            const connect = await braintreeScriptLoader.loadConnect();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/connect.min.js`,
            );
            expect(connect).toBe(connectCreatorMock);
        });

        it('loads the connect throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadConnect();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the client throw error if connect does not exist in window.braintree', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadConnect();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#loadPaypalCheckout', () => {
        let paypalCheckoutMock: BraintreePaypalCheckoutCreator;

        beforeEach(() => {
            paypalCheckoutMock = getPaypalCheckoutMock();
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.paypalCheckout = paypalCheckoutMock;
                }

                return Promise.resolve();
            });
        });

        it('loads PayPal checkout', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/paypal-checkout.min.js`,
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads PayPal checkout with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/paypal-checkout.min.js`,
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads PayPal checkout throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadPaypalCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads PayPal checkout throw error if client does not exist in window.paypalCheckout', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadPaypalCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#loadBraintreeLocalMethods', () => {
        let localPayment: BraintreeLocalPaymentCreator;

        beforeEach(() => {
            localPayment = getModuleCreatorMock(getBraintreeLocalPaymentMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.localPayment = localPayment;
                }

                return Promise.resolve();
            });
        });

        it('loads local payment methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadBraintreeLocalMethods();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/local-payment.min.js`,
            );
        });

        it('loads local payment methods with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadBraintreeLocalMethods();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/local-payment.min.js`,
            );
        });
    });

    describe('#loadGooglePayment', () => {
        let googlePayment: GooglePayCreator;

        beforeEach(() => {
            googlePayment = getModuleCreatorMock(getGooglePayMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.googlePayment = googlePayment;
                }

                return Promise.resolve();
            });
        });

        it('loads google payment methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/google-payment.min.js`,
            );
        });

        it('loads google payment methods with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/google-payment.min.js`,
            );
        });
    });

    describe('#load3DS', () => {
        let threeDSecure: BraintreeThreeDSecureCreator;

        beforeEach(() => {
            threeDSecure = getModuleCreatorMock(getGooglePayMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.threeDSecure = threeDSecure;
                }

                return Promise.resolve();
            });
        });

        it('loads threeDSecure methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/three-d-secure.min.js`,
            );
        });

        it('loads threeDSecure methods with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/three-d-secure.min.js`,
            );
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
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/data-collector.min.js`,
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_ALPHA_VERSION}/js/data-collector.min.js`,
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadDataCollector();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the data collector library throw error if client does not exist in window.dataCollector', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadDataCollector();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
