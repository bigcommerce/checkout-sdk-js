import { createScriptLoader } from '@bigcommerce/script-loader';

import { getConfig, getConfigState } from '../../../../src/config/configs.mock';
import { getCart } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { getAmazonPayV2, getPaymentMethodsState } from '../../payment-methods.mock';

import { AmazonPayV2PayOptions, AmazonPayV2Placement, AmazonPayV2SDK, AmazonPayV2ButtonParameters, AmazonPayV2NewButtonParams, AmazonPayV2ButtonParams, AmazonPayV2CheckoutSessionConfig, AmazonPayV2Button } from './amazon-pay-v2';
import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import { getAmazonPayV2ButtonParamsMock, getAmazonPayV2Ph4ButtonParamsMock, getAmazonPayV2SDKMock, getPaymentMethodMockUndefinedLedgerCurrency, getPaymentMethodMockUndefinedMerchant } from './amazon-pay-v2.mock';

describe('AmazonPayV2PaymentProcessor', () => {
    let amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader;
    let processor: AmazonPayV2PaymentProcessor;
    let amazonPayV2SDKMock: AmazonPayV2SDK;

    beforeEach(() => {
        amazonPayV2ScriptLoader = new AmazonPayV2ScriptLoader(createScriptLoader());

        processor = new AmazonPayV2PaymentProcessor(
            amazonPayV2ScriptLoader
        );

        amazonPayV2SDKMock = getAmazonPayV2SDKMock();

        jest.spyOn(amazonPayV2ScriptLoader, 'load')
            .mockResolvedValue(amazonPayV2SDKMock);
    });

    it('creates an instance of AmazonPayV2PaymentProcessor', () => {
        expect(processor).toBeInstanceOf(AmazonPayV2PaymentProcessor);
    });

    describe('#initialize', () => {
        it('initializes processor successfully', async () => {
            const amazonMock = getAmazonPayV2();

            await processor.initialize(amazonMock);

            expect(amazonPayV2ScriptLoader.load).toHaveBeenCalledWith(amazonMock);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes processor successfully', async () => {
            const renderButton = () => processor.createButton('foo', getAmazonPayV2ButtonParamsMock());

            await processor.initialize(getAmazonPayV2());
            expect(renderButton).not.toThrow();

            await processor.deinitialize();
            expect(renderButton).toThrowError(NotInitializedError);
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

            await processor.initialize(getAmazonPayV2());

            processor.bindButton(buttonName, sessionId, 'changePayment');

            expect(amazonPayV2SDKMock.Pay.bindChangeAction).toHaveBeenCalledWith(`#${buttonName}`, bindOptions);
        });

        it('does not bind the button if the processor is not initialized previously', () => {
            expect(() => processor.bindButton(buttonName, sessionId, 'changePayment')).toThrow(NotInitializedError);
        });
    });

    describe('#signOut', () => {
        it('signs out succesfully', async () => {
            await processor.initialize(getAmazonPayV2());
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

        it('creates the html button element', async () => {
            await processor.initialize(getAmazonPayV2());
            processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(`#${containerId}`, amazonPayV2ButtonParams);
        });

        it('throws an error when amazonPayV2SDK is not initialized', () => {
            expect(() => processor.createButton(containerId, amazonPayV2ButtonParams)).toThrow(NotInitializedError);
        });
    });

    describe('#prepareCheckout', () => {
        const containerId = 'amazonpay-container';
        let amazonPayV2ButtonParams: Required<AmazonPayV2NewButtonParams>;
        let createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>;

        beforeEach(async () => {
            amazonPayV2ButtonParams = getAmazonPayV2Ph4ButtonParamsMock() as Required<AmazonPayV2NewButtonParams>;
            const { publicKeyId, createCheckoutSessionConfig: signedPayload } = amazonPayV2ButtonParams;

            createCheckoutSessionConfig = {
                publicKeyId,
                ...signedPayload,
            };
        });

        describe('should initiate checkout successfully:', () => {
            beforeEach(async () => {
                await processor.initialize(getAmazonPayV2());
                processor.createButton(containerId, amazonPayV2ButtonParams);
            });

            test('onClick is called to define custom actions', () => {
                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (amazonPayV2SDKMock.Pay.renderButton as jest.Mock).mock.results[0].value;

                expect(amazonPayV2Button.onClick).toHaveBeenCalledTimes(1);
            })

            test('config does not include publicKeyId because it has an environment prefix', () => {
                const expectedConfig = {
                    createCheckoutSessionConfig: amazonPayV2ButtonParams.createCheckoutSessionConfig,
                };

                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (amazonPayV2SDKMock.Pay.renderButton as jest.Mock).mock.results[0].value;
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });

            test('config includes publicKeyId because it does not have an environment prefix', async () => {
                const expectedConfig = {
                    createCheckoutSessionConfig,
                };

                createCheckoutSessionConfig.publicKeyId = 'foo';
                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (amazonPayV2SDKMock.Pay.renderButton as jest.Mock).mock.results[0].value;
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });
        });

        it('throws an error when amazonPayV2Button is not initialized', () => {
            expect(() => processor.prepareCheckout(createCheckoutSessionConfig)).toThrow(NotInitializedError);
        });
    });

    describe('#renderAmazonPayButton', () => {
        const CONTAINER_ID = 'foo';
        const renderAmazonPayButton = (containerId = CONTAINER_ID, decoupleCheckoutInitiation = false) => {
            processor.renderAmazonPayButton({
                checkoutState: store.getState(),
                containerId,
                decoupleCheckoutInitiation,
                methodId: 'amazonpay',
                placement: AmazonPayV2Placement.Checkout,
            });
        };

        let store: CheckoutStore;

        beforeAll(() => {
            const container = document.createElement('div');
            container.id = CONTAINER_ID;
            document.body.appendChild(container);
        });

        beforeEach(async () => {
            store = createCheckoutStore(getCheckoutStoreState());
            await processor.initialize(getAmazonPayV2());
        });

        it('should render an Amazon Pay button and validate if cart contains physical items', () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock() as AmazonPayV2ButtonParams;
            expectedOptions.createCheckoutSession.url = `${getConfig().storeConfig.storeProfile.shopPath}/remote-checkout/amazonpay/payment-session`;
            expectedOptions.productType = AmazonPayV2PayOptions.PayOnly;

            const cartMock = getCart();
            cartMock.lineItems.physicalItems = [];

            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValueOnce(cartMock);

            renderAmazonPayButton();

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
        });

        it('should provide a relative URL to create a checkout session', () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock() as AmazonPayV2ButtonParams;
            expectedOptions.createCheckoutSession.url = `/remote-checkout/amazonpay/payment-session`;

            const storeConfigMock = getConfig().storeConfig;
            storeConfigMock.checkoutSettings.features = {
                'INT-5826.amazon_relative_url': true,
            };

            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow')
                .mockReturnValueOnce(storeConfigMock);

            renderAmazonPayButton()

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
        });

        describe('should use the new button params from API Version 2:', () => {
            beforeEach(() => {
                const storeConfigMock = getConfig().storeConfig;
                storeConfigMock.checkoutSettings.features = {
                    'PROJECT-3483.amazon_pay_ph4': true,
                };

                jest.spyOn(store.getState().config, 'getStoreConfigOrThrow')
                    .mockReturnValueOnce(storeConfigMock);
            });

            test('publicKeyId has an environment prefix', () => {
                const expectedOptions = getAmazonPayV2Ph4ButtonParamsMock();

                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
            });

            test('publicKeyId does not have an environment prefix', () => {
                const expectedOptions = getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;
                const createCheckoutSessionConfig = expectedOptions.createCheckoutSessionConfig as Required<AmazonPayV2NewButtonParams>['createCheckoutSessionConfig'];
                delete expectedOptions.publicKeyId;
                expectedOptions.sandbox = true;
                expectedOptions.createCheckoutSessionConfig = {
                    ...createCheckoutSessionConfig,
                    publicKeyId: 'foo',
                };

                const amazonPayV2Mock = getAmazonPayV2();
                amazonPayV2Mock.initializationData.publicKeyId = 'foo';

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValueOnce(amazonPayV2Mock);

                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
            });

            test('estimatedOrderAmount is not set if there is no total', () => {
                const expectedOptions = getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;
                delete expectedOptions.estimatedOrderAmount;

                jest.spyOn(store.getState().checkout, 'getCheckout')
                    .mockReturnValueOnce(undefined);

                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
            });

            test('estimatedOrderAmount is not set if there is no currency code', () => {
                const expectedOptions = getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;
                delete expectedOptions.estimatedOrderAmount;

                jest.spyOn(store.getState().cart, 'getCart')
                    .mockReturnValueOnce(undefined);

                renderAmazonPayButton();

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
            });

            test('createCheckoutSessionConfig is not set if decoupleCheckoutInitiation is true', () => {
                const expectedOptions = getAmazonPayV2Ph4ButtonParamsMock() as AmazonPayV2NewButtonParams;
                delete expectedOptions.createCheckoutSessionConfig;

                renderAmazonPayButton(CONTAINER_ID, true);

                expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
            });
        });

        describe('should fail...', () => {
            test('if an invalid containerId is provided', () => {
                const renderAmazonPayButtonToAnInvalidContainer = () => renderAmazonPayButton('bar');

                expect(renderAmazonPayButtonToAnInvalidContainer).toThrowError(InvalidArgumentError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if there is no payment methods data', () => {
                const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
                const state = { ...getCheckoutStoreState(), paymentMethods };
                store = createCheckoutStore(state);

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if there is no store config data', () => {
                const config = { ...getConfigState(), data: undefined };
                const state = { ...getCheckoutStoreState(), config };
                store = createCheckoutStore(state);

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if merchantId is undefined', () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getPaymentMethodMockUndefinedMerchant());

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if ledgerCurrency is undefined', () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getPaymentMethodMockUndefinedLedgerCurrency());

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });
        });
    });
});
