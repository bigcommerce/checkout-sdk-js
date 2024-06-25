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
import {
    BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './sdk-verison';
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
            },
        },
    };

    const storeConfigWithFastlaneFeatureOn = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            features: {
                ...storeConfig.checkoutSettings.features,
                'PROJECT-5505.PayPal_Accelerated_Checkout_v2_for_Braintree': true,
                'PROJECT-6266.braintree_fastlane': true,
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
                            'sha384-5q9Kkv64ho8xutoRBtnaeRE1Ux47T6+LSRpsRmKrKSq7SiZOXn0Mv2XWXVQvCFJj',
                    },
                },
            );
            expect(client).toBe(clientMock);
        });

        it('loads the client with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/client.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-WFefLU7p2TWWSJ17dsTC2uZF0qylvIUEXI7ZaQiWiMPGHtvQlpjc53WirI93FZtv',
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
                undefined,
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
                            'sha384-sozUyB/9Y4TygM5npllDME7tGVRo9/4Fh1clHUiPI1F2Q922yyJsMtL5fcFtZHdT',
                    },
                },
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads PayPal checkout with Fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/paypal-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-M5Uymuf5O0lh9Dyu+4soyJzefD1uUsL3m3fakhOuIH6C/FXGvii+XHGSGwQwxeJJ',
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
                            'sha384-P4U+tVQc9ja0VB3w4O6kTlLtIsBPGgsnFQlEdMYVYlU5BF5QP1aoIUhbmLXi0ewT',
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

        it('loads local payment methods with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            await braintreeScriptLoader.loadBraintreeLocalMethods();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/local-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-76tfvCYa9NzY9D66qhNk0cwnecFNOIUw/G+uNE4AhOZ/+Nhej6Po/8zvoOElmE/1',
                    },
                },
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
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-4ePQT3gULIgtQDyvx+F4rXu9DcyWrOP1dxHCoCO8uESGC8BoDbPVAxDiugVawQjJ',
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

        it('loads google payment methods with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/google-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-p0G7HnR6D/f81mKyLqCkr9fEwbDWCwwK8lVZmaudReYXt7bGD3mVO0y9HFsZQhfQ',
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
                            'sha384-Kw2YNA/MLpnN7vkRO3LOCNB0ZrSgT0UZiucLokB06z+0591xAAWgcf9v8AKjCwCX',
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

        it('loads braintree paypal with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            await braintreeScriptLoader.loadPaypal();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/paypal.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-R9O45bWivOlvh5zNaZeRaL0Vie0i6RgNpcD+anBxCVV0Lasox0rsayskrWpOcckT',
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
                            'sha384-kBYpTT1+KcpIHYwnFE6XY3xQkdmazh9F4r9ufjh/cIFXAZFpP96XYNyW8PvHuiJ8',
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

        it('loads threeDSecure methods with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/three-d-secure.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-cs4wDHFa3sU5X2n8S/9qte1uPxRPy7Kp/KL14lYurOXbXxMZma0660Gfo0a6AUS1',
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
                            'sha384-XzzKn9jU+Lvx1tJscq9e+nMRNBybQnSgSTXn1/PS0v6JxOUQlgFIBjI9ER8CODFt',
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

        it('loads visaCheckout methods with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/visa-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-iMFvsiulnHPuXwzbm5r/DPdATPCPn6J4aVNyTheAvM3e5FLA1j/wZTCAYxM081cP',
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
                            'sha384-7I4A3VPyzQnBGG7F2aiC9We5tN3Py+cYyPWoqiQJaXCEIVLX2goBaku2lGhZXpyK',
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

        it('loads hostedFields methods with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/hosted-fields.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-0gdeYixIb/qimY4JRVwaybygpjWS7O4NtcwQPEJwFhx0nGBKE+NxbkQXOiTXY5QY',
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
                            'sha384-AfqcRXnzzimKHVeUXcJNlB6ti2rmN9UJaZrLFU21pj779Db0zIJtBMdVcwb64NEm',
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

        it('loads venmoCheckout methods with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            await braintreeScriptLoader.loadVenmoCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/venmo.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-prmYZ8RvB+/Nuld/7DbA6VfQ+vgDVSwR2Bos6s2FPhoOWf4fYW+YnYA0j9G4bS5/',
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
                            'sha384-MYeeYlFD7uDuhGi2ZmrRth4uLy52c+MmJhlrIeNsZCpstpX3qQJI389DB/a2137k',
                    },
                },
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library with braintree sdk fastlane compatible version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(storeConfigWithFastlaneFeatureOn);

            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION}/js/data-collector.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            'sha384-zpZXyctWw5HY7JwKnhbSRzkOnIkNv8hYoEEyMKkJnpoIT2BijSjiXkNxtSI6lig9',
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
