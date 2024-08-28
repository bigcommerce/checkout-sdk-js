import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getConfig } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeScriptLoader from './braintree-script-loader';
import {
    getBraintreeLocalPaymentMock,
    getBraintreePaypalMock,
    getClientMock,
    getDataCollectorMock,
    getFastlaneMock,
    getGooglePayMock,
    getHostedFieldsMock,
    getModuleCreatorMock,
    getPaypalCheckoutMock,
    getVenmoCheckoutMock,
    getVisaCheckoutMock,
    getVisaCheckoutSDKMock,
} from './mocks';
import { BRAINTREE_SDK_LATEST_STABLE_VERSION, BRAINTREE_SDK_STABLE_VERSION } from './sdk-verison';
import {
    BraintreeClientCreator,
    BraintreeDataCollector,
    BraintreeFastlane,
    BraintreeHostedFieldsCreator,
    BraintreeHostWindow,
    BraintreeLocalPaymentCreator,
    BraintreeModuleCreator,
    BraintreePaypalCheckoutCreator,
    BraintreePaypalCreator,
    BraintreeThreeDSecureCreator,
    BraintreeVenmoCheckoutCreator,
    BraintreeVisaCheckoutCreator,
    GooglePayCreator,
} from './types';
import { VisaCheckoutSDK } from './visacheckout';

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
                'PAYPAL-4489.braintree_sdk_version_update': true,
            },
        },
    };

    const storeConfigWithBraintreeSdkLatestVersionFeature = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            features: {
                ...storeConfig.checkoutSettings.features,
                'PAYPAL-4489.braintree_sdk_version_update': false,
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
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-3yDEuTgH/1oa552vNZ1Z9Z0UnaOsDuHatxP1RmgpdD8/ecN3YMcikbI1DM6QQVHv',
                    },
                },
            );
            expect(client).toBe(clientMock);
        });

        it('loads braintree client module with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/client.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-26BXDNnJI23JYRyFBj4xe4sVNrUSSiSSu11kxVXNM/vEPONm4LuL00w6ZaTgQewt',
                    },
                },
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

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadClient();
            await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });

    describe('#loadFastlane()', () => {
        let fastlaneCreatorMock: BraintreeModuleCreator<BraintreeFastlane>;

        beforeEach(() => {
            fastlaneCreatorMock = getModuleCreatorMock(getFastlaneMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.fastlane = fastlaneCreatorMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the fastlane', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const fastlane = await braintreeScriptLoader.loadFastlane();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/fastlane.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-MunHz5V8FY0J9AOHGkmEjphvIKAI4WokwrT6w/NP9mwfBHhcq3LmDi7q1tIe1Aqk',
                    },
                },
            );
            expect(fastlane).toBe(fastlaneCreatorMock);
        });

        it('loads braintree fastlane module with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            const fastlane = await braintreeScriptLoader.loadFastlane();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/fastlane.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-9oGsZMRZwpGtDEDYa/dFt76dECqj1xAni9gIKgc3KfMIiRnR73nEeeUDLiBzxhFa',
                    },
                },
            );
            expect(fastlane).toBe(fastlaneCreatorMock);
        });

        it('loads the fastlane throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadFastlane();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the client throw error if fastlane does not exist in window.braintree', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadFastlane();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadFastlane();
            await braintreeScriptLoader.loadFastlane();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });

    describe('#loadPaypalCheckout', () => {
        let paypalCheckoutMock: BraintreePaypalCheckoutCreator;

        beforeEach(() => {
            paypalCheckoutMock = getModuleCreatorMock(getPaypalCheckoutMock());
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
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-kjA0K5UAS3wbxKm4CoMez5lxIYvzCQ+t/xtk0QiVIBIAhbXbV2YlWfr8uHJSY+tV',
                    },
                },
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads braintree paypal checkout module with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/paypal-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-B+vzbZwnQtzWBthpkT4TXKUibO65tyeK7eCxSvpblgprTep2+IAXB2Cxxjrn710O',
                    },
                },
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

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadPaypalCheckout();
            await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
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
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-/qKkzoquZWHgtiDkGqoBqyTMvVJd58HFDo+6iH/wLfKPE6M4aUIr9XG/eReN0a0H',
                    },
                },
            );
        });

        it('loads local payment methods with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            await braintreeScriptLoader.loadBraintreeLocalMethods();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/local-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-LIvOEMkIVEwVuYBdVOQc1AC5YbGGlwyfUheS0ACK218D2STuVYQlZ4FyEPowAEfT',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadBraintreeLocalMethods();
            await braintreeScriptLoader.loadBraintreeLocalMethods();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
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
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-VdxBDsfslfvtDeGPAsXn88I9d2JmBCpdwrFaFO3+TiMA8j4/a4HU+BcviiXAptNV',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadGooglePayment();
            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('loads google payment methods with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/google-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-WKDJl8mqoP82qZpMGH6AbZxnvXnSW8ILV4M64CyMLiugGMwu7LyP89wjCkHqsiBe',
                    },
                },
            );
        });
    });

    describe('#loadPaypal', () => {
        let braintreePaypal: BraintreePaypalCreator;

        beforeEach(() => {
            braintreePaypal = getModuleCreatorMock(getBraintreePaypalMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.paypal = braintreePaypal;
                }

                return Promise.resolve();
            });
        });

        it('loads braintree paypal payment methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadPaypal();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/paypal.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-HQ2o1BVFyVrkOzwU5aiPfSIa3ZhtHabNmBVf44kuw/+spM1L/6p7NbZXq4U5y4db',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadPaypal();
            await braintreeScriptLoader.loadPaypal();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('loads braintree paypal with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            await braintreeScriptLoader.loadPaypal();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/paypal.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-uyAGL1/3+XJAHnGoNy4eCoXdzJ4f7Ilzp+6w9PNnEjs6DCCz9WMyJjMN1gzc78U+',
                    },
                },
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
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-nMqWo4zVYzGRrIh05fZ2bDOygNZVPHGlltJXuXoNw5WTPh8mUG9uCp7aBqtmm/e/',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.load3DS();
            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('loads threeDSecure methods with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/three-d-secure.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-VQUlpGHzsGvs5XeiGFip7EXRsvoHWEXDVmgCacfbyieZI9mdBOqq3NSoyo28OCOB',
                    },
                },
            );
        });
    });

    describe('#loadVisaCheckout', () => {
        let visaCheckout: BraintreeVisaCheckoutCreator;

        beforeEach(() => {
            visaCheckout = getModuleCreatorMock(getVisaCheckoutMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.visaCheckout = visaCheckout;
                }

                return Promise.resolve();
            });
        });

        it('loads visaCheckout methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/visa-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-WMsHC0Xqz6BN+fUfCghOBd9U0ZkrXDafAq1IZapnh1Z4iWtY86zJlG08lCaB4xF6',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadVisaCheckout();
            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('loads visaCheckout methods with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/visa-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-yx7mADfzTN0T43Q6rlH49LIg1EJ0iUZgBp/EczX9LXsUGkySgxrD+nWHQRBkyfoT',
                    },
                },
            );
        });
    });

    describe('#loadHostedFields', () => {
        let hostedFields: BraintreeHostedFieldsCreator;

        beforeEach(() => {
            hostedFields = getModuleCreatorMock(getHostedFieldsMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.hostedFields = hostedFields;
                }

                return Promise.resolve();
            });
        });

        it('loads hostedFields methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/hosted-fields.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-a87dK5DmKr/rtH//0rV44/rzz9Kl6AvNp5mMy8IYonT/f0ik5bUtX8bl/qeGOaSx',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadHostedFields();
            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('loads hostedFields methods with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/hosted-fields.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-VvYBACfSu0Cr/J32uKmxG7AXcNOJE1AzIIL3kbikyS7YKp5fz5Is+NzNP/lyauNy',
                    },
                },
            );
        });
    });

    describe('#loadVenmoCheckout', () => {
        let venmoCheckout: BraintreeVenmoCheckoutCreator;

        beforeEach(() => {
            venmoCheckout = getModuleCreatorMock(getVenmoCheckoutMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.venmo = venmoCheckout;
                }

                return Promise.resolve();
            });
        });

        it('loads venmoCheckout methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadVenmoCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/venmo.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-d76HNGG5/6M30cuphYSP4hiRYVyFckvx/GV6Lc4u52JUxnJKPNAaGVXntJKHxVWX',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadVenmoCheckout();
            await braintreeScriptLoader.loadVenmoCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('loads venmoCheckout methods with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            await braintreeScriptLoader.loadVenmoCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/venmo.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-QX4rPjoj1ZDhuG0aSyKs56lEKDqTMTcjYxUHY1SzO5VZDsqIE2NTkqot7KNSCyov',
                    },
                },
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
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-LHGVkS5dEY+LZmubY35YxkuLcNa5Ltw4vZOfCeRmVsCGQMjsvqdxZo4fBXNwf8fI',
                    },
                },
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library with latest braintree sdk version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithBraintreeSdkLatestVersionFeature);

            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_LATEST_STABLE_VERSION}/js/data-collector.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-1bo9JDz+Kscthc085cCKWur8CLwUoBpoNyxsDi7932mCl0zFq3A5mv+FQLw9GHpV',
                    },
                },
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

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFeaturesOn);

            await braintreeScriptLoader.loadDataCollector();
            await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });

    describe('#loadVisaCheckoutSdk', () => {
        let visaCheckoutSdk: VisaCheckoutSDK;

        beforeEach(() => {
            visaCheckoutSdk = getVisaCheckoutSDKMock();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.V = visaCheckoutSdk;

                return Promise.resolve();
            });
        });

        it('loads loadVisaCheckoutSdk methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadVisaCheckoutSdk();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-1f1csvP3ZFxg4dILH1GaY4LHlZ0oX7Rk83rxmLlwbnIi4TM0NYzXoev1VoEiVDS6',
                    },
                },
            );
        });

        it('loads loadVisaCheckoutSdk in sandbox mode', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadVisaCheckoutSdk(true);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-0eu1s1GtqzXlL9DtLgmwzC5WWlEH/ADRM0n38cVQkvtT+W/gey96rcb1LwuUOPDm',
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadVisaCheckoutSdk();
            await braintreeScriptLoader.loadVisaCheckoutSdk();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });
});
