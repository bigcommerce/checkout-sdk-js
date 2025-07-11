import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    PaymentIntegrationSelectors,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    getCheckout,
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    AmazonPayV2Button,
    AmazonPayV2ButtonParameters,
    AmazonPayV2ButtonParams,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2NewButtonParams,
    AmazonPayV2PayOptions,
    AmazonPayV2Placement,
    AmazonPayV2Price,
    AmazonPayV2SDK,
    InternalCheckoutSelectors,
} from './amazon-pay-v2';
import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import {
    getAmazonPayBaseButtonParamsMock,
    getAmazonPayV2,
    getAmazonPayV2ButtonParamsMock,
    getAmazonPayV2Ph4ButtonParamsMock,
    getAmazonPayV2SDKMock,
    getPaymentMethodMockUndefinedLedgerCurrency,
    getPaymentMethodMockUndefinedMerchant,
} from './mocks/amazon-pay-v2.mock';

describe('AmazonPayV2PaymentProcessor', () => {
    let amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader;
    let processor: AmazonPayV2PaymentProcessor;
    let amazonPayV2SDKMock: AmazonPayV2SDK;
    let amazonPayV2Mock: PaymentMethod<AmazonPayV2InitializeOptions>;

    beforeEach(() => {
        amazonPayV2ScriptLoader = new AmazonPayV2ScriptLoader(createScriptLoader());

        processor = new AmazonPayV2PaymentProcessor(amazonPayV2ScriptLoader);

        amazonPayV2SDKMock = getAmazonPayV2SDKMock();

        jest.spyOn(amazonPayV2ScriptLoader, 'load').mockResolvedValue(amazonPayV2SDKMock);

        jest.spyOn(document, 'createElement');

        amazonPayV2Mock = getAmazonPayV2();
    });

    afterEach(() => {
        jest.spyOn(document, 'createElement').mockRestore();
    });

    it('creates an instance of AmazonPayV2PaymentProcessor', () => {
        expect(processor).toBeInstanceOf(AmazonPayV2PaymentProcessor);
    });

    describe('#initialize', () => {
        it('initializes processor successfully', async () => {
            await processor.initialize(amazonPayV2Mock);

            expect(amazonPayV2ScriptLoader.load).toHaveBeenCalledWith(amazonPayV2Mock);
            expect(document.createElement).toHaveBeenCalledTimes(1);
        });

        it('should reuse already created container', async () => {
            await processor.initialize(amazonPayV2Mock);
            await processor.initialize(amazonPayV2Mock);

            expect(document.createElement).toHaveBeenCalledTimes(1);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes processor successfully', async () => {
            await processor.initialize(amazonPayV2Mock);

            const deinitialize = processor.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should remove the button parent container from the DOM', async () => {
            const grandparentContainer = document.createElement('div');
            const parentContainer = grandparentContainer.appendChild(document.createElement('div'));

            jest.spyOn(document, 'createElement').mockReturnValueOnce(parentContainer);

            await processor.initialize(amazonPayV2Mock);
            await processor.deinitialize();

            expect(grandparentContainer.contains(parentContainer)).toBe(false);
        });
    });

    describe('#bindButton', () => {
        const sessionId = 'ACB123';
        const buttonName = 'bindableButton';

        it('bind the button successfully', async () => {
            const bindOptions = {
                amazonCheckoutSessionId: sessionId,
                changeAction: 'changePayment',
            };

            await processor.initialize(amazonPayV2Mock);
            processor.bindButton(buttonName, sessionId, 'changePayment');

            expect(amazonPayV2SDKMock.Pay.bindChangeAction).toHaveBeenCalledWith(
                `#${buttonName}`,
                bindOptions,
            );
        });

        it('throws an error when amazonPayV2SDK is not initialized', () => {
            const bindButton = () => processor.bindButton(buttonName, sessionId, 'changePayment');

            expect(bindButton).toThrow(NotInitializedError);
        });
    });

    describe('#signOut', () => {
        it('signs out succesfully', async () => {
            await processor.initialize(amazonPayV2Mock);

            await processor.signout();

            expect(amazonPayV2SDKMock.Pay.signout).toHaveBeenCalled();
        });
    });

    describe('#createButton', () => {
        const containerId = 'amazonpay-container';
        let amazonPayV2ButtonParams: AmazonPayV2ButtonParameters;

        beforeEach(() => {
            amazonPayV2ButtonParams = getAmazonPayV2ButtonParamsMock();
        });

        it('should render the Amazon Pay button to an HTML container element', async () => {
            await processor.initialize(amazonPayV2Mock);

            processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                `#${containerId}`,
                amazonPayV2ButtonParams,
            );
        });

        it('should render the Amazon Pay button to an HTML container element without microtext', async () => {
            await processor.initialize(amazonPayV2Mock);
            amazonPayV2ButtonParams = getAmazonPayV2ButtonParamsMock(true);

            processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                `#${containerId}`,
                amazonPayV2ButtonParams,
            );
        });

        it('throws an error when amazonPayV2SDK is not initialized', () => {
            const createButton = () => processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(createButton).toThrow(NotInitializedError);
        });
    });

    describe('#prepareCheckout', () => {
        const containerId = 'amazonpay-container';
        let amazonPayV2ButtonParams: Required<AmazonPayV2NewButtonParams>;
        let createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>;

        beforeEach(() => {
            amazonPayV2ButtonParams =
                getAmazonPayV2Ph4ButtonParamsMock() as Required<AmazonPayV2NewButtonParams>;

            const { publicKeyId, createCheckoutSessionConfig: signedPayload } =
                amazonPayV2ButtonParams;

            createCheckoutSessionConfig = {
                publicKeyId,
                ...signedPayload,
            };
        });

        describe('should initiate checkout successfully:', () => {
            beforeEach(async () => {
                await processor.initialize(amazonPayV2Mock);
                processor.createButton(containerId, amazonPayV2ButtonParams);
            });

            test('onClick is called to define custom actions', () => {
                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;

                expect(amazonPayV2Button.onClick).toHaveBeenCalledTimes(1);
            });

            test('config does not include publicKeyId because it has an environment prefix', () => {
                const expectedConfig = {
                    createCheckoutSessionConfig:
                        amazonPayV2ButtonParams.createCheckoutSessionConfig,
                };

                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;
                // eslint-disable-next-line  @typescript-eslint/no-unsafe-member-access
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });

            test('config includes publicKeyId because it does not have an environment prefix', () => {
                const expectedConfig = {
                    createCheckoutSessionConfig,
                };

                createCheckoutSessionConfig.publicKeyId = 'foo';
                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;
                // eslint-disable-next-line  @typescript-eslint/no-unsafe-member-access
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });
        });

        it('throws an error when amazonPayV2Button is not initialized', () => {
            const prepareCheckout = () => processor.prepareCheckout(createCheckoutSessionConfig);

            expect(prepareCheckout).toThrow(NotInitializedError);
        });
    });

    describe('#prepareCheckoutWithCreationRequestConfig', () => {
        const containerId = 'amazonpay-container';
        let amazonPayV2ButtonParams: Required<AmazonPayV2NewButtonParams>;
        let createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>;
        let estimatedOrderAmount: AmazonPayV2Price;
        let productType: AmazonPayV2PayOptions;

        beforeEach(() => {
            amazonPayV2ButtonParams =
                getAmazonPayV2Ph4ButtonParamsMock() as Required<AmazonPayV2NewButtonParams>;

            const { publicKeyId, createCheckoutSessionConfig: signedPayload } =
                amazonPayV2ButtonParams;

            createCheckoutSessionConfig = {
                publicKeyId,
                ...signedPayload,
            };

            estimatedOrderAmount = amazonPayV2ButtonParams.estimatedOrderAmount;
            productType = amazonPayV2ButtonParams.productType;
        });

        describe('should initiate checkout successfully:', () => {
            beforeEach(async () => {
                await processor.initialize(amazonPayV2Mock);
                processor.createButton(containerId, amazonPayV2ButtonParams);
            });

            test('onClick is called to define custom actions', () => {
                processor.prepareCheckoutWithCreationRequestConfig(() =>
                    Promise.resolve({
                        createCheckoutSessionConfig,
                        estimatedOrderAmount,
                        productType,
                    }),
                );

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;

                expect(amazonPayV2Button.onClick).toHaveBeenCalledTimes(1);
            });

            test('config does not include publicKeyId because it has an environment prefix', async () => {
                const expectedConfig = {
                    createCheckoutSessionConfig:
                        amazonPayV2ButtonParams.createCheckoutSessionConfig,
                    estimatedOrderAmount,
                    productType,
                };

                processor.prepareCheckoutWithCreationRequestConfig(() => {
                    return Promise.resolve({
                        createCheckoutSessionConfig,
                        estimatedOrderAmount,
                        productType,
                    });
                });

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;
                // eslint-disable-next-line  @typescript-eslint/no-unsafe-member-access
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                await customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });

            test('config includes publicKeyId because it does not have an environment prefix', async () => {
                const expectedConfig = {
                    createCheckoutSessionConfig,
                    estimatedOrderAmount,
                    productType,
                };

                createCheckoutSessionConfig.publicKeyId = 'foo';
                processor.prepareCheckoutWithCreationRequestConfig(() =>
                    Promise.resolve(expectedConfig),
                );

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;
                // eslint-disable-next-line  @typescript-eslint/no-unsafe-member-access
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                await customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });
        });
    });

    describe('#renderAmazonPayButton', () => {
        const CONTAINER_ID = 'container_passed_by_the_client';
        let checkoutState: InternalCheckoutSelectors;

        const getCheckoutStateMock = () => {
            return {
                cart: { getCart: jest.fn(() => getCart()) },
                checkout: { getCheckout: jest.fn(() => getCheckout()) },
                config: { getStoreConfigOrThrow: jest.fn(() => getConfig().storeConfig) },
                paymentMethods: { getPaymentMethodOrThrow: jest.fn(() => getAmazonPayV2()) },
            } as InternalCheckoutSelectors;
        };

        const stateMock = new PaymentIntegrationServiceMock().getState();
        const getPaymentIntegrationSelectorsMock = () =>
            ({
                ...stateMock,
                getCart: jest.fn(() => getCart()),
                getCheckout: jest.fn(() => getCheckout()),
                getStoreConfigOrThrow: jest.fn(() => getConfig().storeConfig),
                getPaymentMethodOrThrow: jest.fn(() => getAmazonPayV2()),
            } as PaymentIntegrationSelectors);

        const renderAmazonPayButton = (
            containerId = CONTAINER_ID,
            decoupleCheckoutInitiation = false,
            checkoutStateMock?: InternalCheckoutSelectors | PaymentIntegrationSelectors,
        ) =>
            processor.renderAmazonPayButton({
                checkoutState: checkoutStateMock || checkoutState,
                containerId,
                decoupleCheckoutInitiation,
                methodId: 'amazonpay',
                placement: AmazonPayV2Placement.Checkout,
            });
        const expectedContainerId = expect.stringMatching(
            /^#amazonpay_button_parent_container_[0-9a-f]{4}$/,
        );

        beforeAll(() => {
            const container = document.createElement('div');

            container.id = CONTAINER_ID;
            document.body.appendChild(container);
        });

        beforeEach(() => {
            checkoutState = getCheckoutStateMock();
        });

        it('should return the buttonParentContainer', async () => {
            const parentContainer = document.createElement('div');

            jest.spyOn(document, 'createElement').mockReturnValueOnce(parentContainer);

            await processor.initialize(amazonPayV2Mock);

            const amazonPayButton = renderAmazonPayButton(CONTAINER_ID, false);

            expect(amazonPayButton).toBe(parentContainer);
        });

        it('should return the buttonParentContainer with Payment integration service', async () => {
            const parentContainer = document.createElement('div');
            const checkoutStateMock = getPaymentIntegrationSelectorsMock();

            jest.spyOn(document, 'createElement').mockReturnValueOnce(parentContainer);

            await processor.initialize(amazonPayV2Mock);

            const amazonPayButton = renderAmazonPayButton(CONTAINER_ID, false, checkoutStateMock);

            expect(amazonPayButton).toBe(parentContainer);
        });

        it('should render an Amazon Pay button and validate if cart contains physical items', async () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock() as AmazonPayV2ButtonParams;

            expectedOptions.createCheckoutSession.url = `${
                getConfig().storeConfig.storeProfile.shopPath
            }/remote-checkout/amazonpay/payment-session`;
            expectedOptions.productType = AmazonPayV2PayOptions.PayOnly;

            const cartMock = getCart();

            cartMock.lineItems.physicalItems = [];

            jest.spyOn(checkoutState.cart, 'getCart').mockReturnValueOnce(cartMock);

            await processor.initialize(amazonPayV2Mock);
            renderAmazonPayButton();

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                expectedContainerId,
                expectedOptions,
            );
        });

        describe('should use the new button params from API Version 2:', () => {
            beforeEach(() => {
                const storeConfigMock = getConfig().storeConfig;

                storeConfigMock.checkoutSettings.features = {
                    'PROJECT-3483.amazon_pay_ph4': true,
                };

                jest.spyOn(checkoutState.config, 'getStoreConfigOrThrow').mockReturnValueOnce(
                    storeConfigMock,
                );
            });

            test('should return the correct basic amazon config for Buy Now flow', async () => {
                const expectedOptions =
                    getAmazonPayBaseButtonParamsMock() as AmazonPayV2ButtonParams;

                const storeConfigMock = getConfig().storeConfig;

                jest.spyOn(checkoutState.config, 'getStoreConfigOrThrow').mockReturnValueOnce(
                    storeConfigMock,
                );

                await processor.initialize(amazonPayV2Mock);
                processor.updateBuyNowFlowFlag(true);
                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                    expectedContainerId,
                    expectedOptions,
                );
            });

            test('publicKeyId has an environment prefix', async () => {
                const expectedOptions = getAmazonPayV2Ph4ButtonParamsMock();

                await processor.initialize(amazonPayV2Mock);
                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                    expectedContainerId,
                    expectedOptions,
                );
            });

            test('publicKeyId does not have an environment prefix', async () => {
                const expectedOptions =
                    getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;
                const createCheckoutSessionConfig =
                    expectedOptions.createCheckoutSessionConfig as Required<AmazonPayV2NewButtonParams>['createCheckoutSessionConfig'];

                delete expectedOptions.publicKeyId;
                expectedOptions.sandbox = true;
                expectedOptions.createCheckoutSessionConfig = {
                    ...createCheckoutSessionConfig,
                    publicKeyId: 'foo',
                };

                amazonPayV2Mock = getAmazonPayV2();

                amazonPayV2Mock.initializationData = {
                    ...amazonPayV2Mock.initializationData,
                    publicKeyId: 'foo',
                };

                jest.spyOn(
                    checkoutState.paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValueOnce(amazonPayV2Mock);

                await processor.initialize(amazonPayV2Mock);
                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                    expectedContainerId,
                    expectedOptions,
                );
            });

            test('estimatedOrderAmount is not set if there is no total', async () => {
                const expectedOptions =
                    getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;

                delete expectedOptions.estimatedOrderAmount;

                jest.spyOn(checkoutState.checkout, 'getCheckout').mockReturnValueOnce(undefined);

                await processor.initialize(amazonPayV2Mock);
                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                    expectedContainerId,
                    expectedOptions,
                );
            });

            test('estimatedOrderAmount is not set if there is no currency code', async () => {
                const expectedOptions =
                    getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;

                delete expectedOptions.estimatedOrderAmount;

                jest.spyOn(checkoutState.cart, 'getCart').mockReturnValueOnce(undefined);

                await processor.initialize(amazonPayV2Mock);
                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                    expectedContainerId,
                    expectedOptions,
                );
            });

            test('createCheckoutSessionConfig is not set if decoupleCheckoutInitiation is true', async () => {
                const expectedOptions =
                    getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;

                delete expectedOptions.createCheckoutSessionConfig;

                await processor.initialize(amazonPayV2Mock);
                renderAmazonPayButton(CONTAINER_ID, true);

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                    expectedContainerId,
                    expectedOptions,
                );
            });
        });

        describe('should fail...', () => {
            test('if an invalid containerId is provided', async () => {
                const renderResult = renderAmazonPayButton('bar');

                await processor.initialize(amazonPayV2Mock);

                expect(renderResult).toBeUndefined();

                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if buttonParentContainer is not initialized', () => {
                expect(renderAmazonPayButton).toThrow(NotInitializedError);
            });

            test('if there is no payment methods data', async () => {
                jest.spyOn(
                    checkoutState.paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockImplementation(() => {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                });

                await processor.initialize(amazonPayV2Mock);

                expect(renderAmazonPayButton).toThrow(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if there is no store config data', async () => {
                jest.spyOn(checkoutState.config, 'getStoreConfigOrThrow').mockImplementation(() => {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                });

                await processor.initialize(amazonPayV2Mock);

                expect(renderAmazonPayButton).toThrow(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if merchantId is undefined', async () => {
                jest.spyOn(checkoutState.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                    getPaymentMethodMockUndefinedMerchant(),
                );

                await processor.initialize(amazonPayV2Mock);

                expect(renderAmazonPayButton).toThrow(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if ledgerCurrency is undefined', async () => {
                jest.spyOn(checkoutState.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                    getPaymentMethodMockUndefinedLedgerCurrency(),
                );

                await processor.initialize(amazonPayV2Mock);

                expect(renderAmazonPayButton).toThrow(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });
        });
    });

    describe('#isPh4Enabled', () => {
        describe('should return TRUE if...', () => {
            test('3483.PH4 is ON, 6885.PH4_US_OLY is OFF, and country is US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': true,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'US');

                expect(isPh4Enabled).toBe(true);
            });

            test('3483.PH4 is ON, 6885.PH4_US_OLY is OFF, and country is not US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': true,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'FOO');

                expect(isPh4Enabled).toBe(true);
            });

            test('3483.PH4 is ON, 6885.PH4_US_OLY is ON, and country is US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': true,
                    'INT-6885.amazon_pay_ph4_us_only': true,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'US');

                expect(isPh4Enabled).toBe(true);
            });
        });

        describe('should return FALSE if...', () => {
            test('3483.PH4 is OFF, 6885.PH4_US_OLY is OFF, and country is US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': false,
                    'INT-6885.amazon_pay_ph4_us_only': false,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'US');

                expect(isPh4Enabled).toBe(false);
            });

            test('3483.PH4 is OFF, 6885.PH4_US_OLY is OFF, and country is not US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': false,
                    'INT-6885.amazon_pay_ph4_us_only': false,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'FOO');

                expect(isPh4Enabled).toBe(false);
            });

            test('3483.PH4 is OFF, 6885.PH4_US_OLY is ON, and country is US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': false,
                    'INT-6885.amazon_pay_ph4_us_only': true,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'US');

                expect(isPh4Enabled).toBe(false);
            });

            test('3483.PH4 is OFF, 6885.PH4_US_OLY is ON, and country is not US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': false,
                    'INT-6885.amazon_pay_ph4_us_only': true,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'FOO');

                expect(isPh4Enabled).toBe(false);
            });

            test('3483.PH4 is ON, 6885.PH4_US_OLY is ON, and country is not US', () => {
                const features = {
                    'PROJECT-3483.amazon_pay_ph4': true,
                    'INT-6885.amazon_pay_ph4_us_only': true,
                };

                const isPh4Enabled = processor.isPh4Enabled(features, 'FOO');

                expect(isPh4Enabled).toBe(false);
            });
        });
    });
});
