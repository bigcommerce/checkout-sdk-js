import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeScriptLoader from './braintree-script-loader';
import { BRAINTREE_SDK_SCRIPTS_INTEGRITY } from './braintree-sdk-scripts-integrity';
import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './braintree-sdk-verison';
import BraintreeSDKVersionManager from './braintree-sdk-version-manager';
import {
    getBraintreeLocalPaymentMock,
    getBraintreePaypalMock,
    getClientMock,
    getDataCollectorMock,
    getFastlaneMock,
    getGooglePaymentMock,
    getHostedFieldsMock,
    getModuleCreatorMock,
    getPaypalCheckoutMock,
    getThreeDSecureMock,
    getVenmoCheckoutMock,
    getVisaCheckoutMock,
    getVisaCheckoutSDKMock,
} from './mocks';
import {
    BraintreeClientCreator,
    BraintreeDataCollector,
    BraintreeFastlane,
    BraintreeGooglePaymentCreator,
    BraintreeHostedFieldsCreator,
    BraintreeHostWindow,
    BraintreeLocalPaymentCreator,
    BraintreeModuleCreator,
    BraintreeModuleName,
    BraintreePaypalCheckoutCreator,
    BraintreePaypalCreator,
    BraintreeThreeDSecureCreator,
    BraintreeVenmoCheckoutCreator,
    BraintreeVisaCheckoutCreator,
} from './types';
import { VisaCheckoutSDK } from './visacheckout';

describe('BraintreeScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let mockWindow: BraintreeHostWindow;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let paymentIntegrationService: PaymentIntegrationService;

    const braintreeSdkDefaultScriptsIntegrity =
        BRAINTREE_SDK_SCRIPTS_INTEGRITY[BRAINTREE_SDK_DEFAULT_VERSION];
    const braintreeSdkStableScriptsIntegrity =
        BRAINTREE_SDK_SCRIPTS_INTEGRITY[BRAINTREE_SDK_STABLE_VERSION];

    beforeEach(() => {
        mockWindow = { braintree: {} } as BraintreeHostWindow;
        scriptLoader = {} as ScriptLoader;
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);

        jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValue(
            BRAINTREE_SDK_STABLE_VERSION,
        );
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

        it('loads the client with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/client.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity: braintreeSdkStableScriptsIntegrity[BraintreeModuleName.Client],
                    },
                },
            );
            expect(client).toBe(clientMock);
        });

        it('loads the client with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/client.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity: braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.Client],
                    },
                },
            );
            expect(client).toBe(clientMock);
        });

        it('loads the client throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadClient();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the client throw error if client does not exist in window.braintree', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {
                    braintree: {},
                } as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadClient();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

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

        it('loads fastlane module with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const fastlane = await braintreeScriptLoader.loadFastlane();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/fastlane.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity: braintreeSdkStableScriptsIntegrity[BraintreeModuleName.Fastlane],
                    },
                },
            );
            expect(fastlane).toBe(fastlaneCreatorMock);
        });

        it('loads fastlane module with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const fastlane = await braintreeScriptLoader.loadFastlane();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/fastlane.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.Fastlane],
                    },
                },
            );
            expect(fastlane).toBe(fastlaneCreatorMock);
        });

        it('loads the fastlane throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadFastlane();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the client throw error if fastlane does not exist in window.braintree', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {
                    braintree: {},
                } as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadFastlane();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

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

        it('loads PayPal checkout with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/paypal-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkStableScriptsIntegrity[BraintreeModuleName.PaypalCheckout],
                    },
                },
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads PayPal checkout with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/paypal-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.PaypalCheckout],
                    },
                },
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads PayPal checkout throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadPaypalCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads PayPal checkout throw error if client does not exist in window.paypalCheckout', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {
                    braintree: {},
                } as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadPaypalCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadPaypalCheckout();
            await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });

    describe('#loadLocalPayment', () => {
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

        it('loads local payment methods with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadLocalPayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/local-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkStableScriptsIntegrity[BraintreeModuleName.LocalPayment],
                    },
                },
            );
        });

        it('loads local payment methods with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadLocalPayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/local-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.LocalPayment],
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadLocalPayment();
            await braintreeScriptLoader.loadLocalPayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });

    describe('#loadGooglePayment', () => {
        let googlePayment: BraintreeGooglePaymentCreator;

        beforeEach(() => {
            googlePayment = getModuleCreatorMock(getGooglePaymentMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.googlePayment = googlePayment;
                }

                return Promise.resolve();
            });
        });

        it('loads google payment methods with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/google-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkStableScriptsIntegrity[BraintreeModuleName.GooglePayment],
                    },
                },
            );
        });

        it('loads google payment methods with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/google-payment.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.GooglePayment],
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadGooglePayment();
            await braintreeScriptLoader.loadGooglePayment();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
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

        it('loads braintree paypal payment methods with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadPaypal();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/paypal.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity: braintreeSdkStableScriptsIntegrity[BraintreeModuleName.Paypal],
                    },
                },
            );
        });

        it('loads braintree paypal payment methods with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadPaypal();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/paypal.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity: braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.Paypal],
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadPaypal();
            await braintreeScriptLoader.loadPaypal();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });

    describe('#load3DS', () => {
        let threeDSecure: BraintreeThreeDSecureCreator;

        beforeEach(() => {
            threeDSecure = getModuleCreatorMock(getThreeDSecureMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.threeDSecure = threeDSecure;
                }

                return Promise.resolve();
            });
        });

        it('loads threeDSecure methods with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/three-d-secure.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkStableScriptsIntegrity[BraintreeModuleName.ThreeDSecure],
                    },
                },
            );
        });

        it('loads threeDSecure methods with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/three-d-secure.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.ThreeDSecure],
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.load3DS();
            await braintreeScriptLoader.load3DS();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
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

        it('loads visaCheckout methods with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/visa-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkStableScriptsIntegrity[BraintreeModuleName.VisaCheckout],
                    },
                },
            );
        });

        it('loads visaCheckout methods with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/visa-checkout.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.VisaCheckout],
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadVisaCheckout();
            await braintreeScriptLoader.loadVisaCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
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

        it('loads hostedFields methods with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/hosted-fields.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkStableScriptsIntegrity[BraintreeModuleName.HostedFields],
                    },
                },
            );
        });

        it('loads hostedFields methods with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/hosted-fields.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.HostedFields],
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadHostedFields();
            await braintreeScriptLoader.loadHostedFields();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
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

        it('loads venmoCheckout methods with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadVenmoCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/venmo.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity: braintreeSdkStableScriptsIntegrity[BraintreeModuleName.Venmo],
                    },
                },
            );
        });

        it('loads venmoCheckout methods with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadVenmoCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/venmo.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity: braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.Venmo],
                    },
                },
            );
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadVenmoCheckout();
            await braintreeScriptLoader.loadVenmoCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
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

        it('loads the data collector library with stable version of braintree sdk', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_STABLE_VERSION}/js/data-collector.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkStableScriptsIntegrity[BraintreeModuleName.DataCollector],
                    },
                },
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library with default version of braintree sdk', async () => {
            jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValueOnce(
                BRAINTREE_SDK_DEFAULT_VERSION,
            );

            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );
            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${BRAINTREE_SDK_DEFAULT_VERSION}/js/data-collector.min.js`,
                {
                    async: true,
                    attributes: {
                        crossorigin: 'anonymous',
                        integrity:
                            braintreeSdkDefaultScriptsIntegrity[BraintreeModuleName.DataCollector],
                    },
                },
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadDataCollector();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('throws an error when load data collector module if client does not exist in window.dataCollector', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {
                    braintree: {},
                } as BraintreeHostWindow,
                braintreeSDKVersionManager,
            );

            try {
                await braintreeScriptLoader.loadDataCollector();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('does not load module if it is already in the window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

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
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

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
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

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
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                mockWindow,
                braintreeSDKVersionManager,
            );

            await braintreeScriptLoader.loadVisaCheckoutSdk();
            await braintreeScriptLoader.loadVisaCheckoutSdk();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });
});
