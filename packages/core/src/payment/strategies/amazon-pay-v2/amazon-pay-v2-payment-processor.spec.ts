import { createScriptLoader } from '@bigcommerce/script-loader';

import { getConfig, getConfigState } from '../../../../src/config/configs.mock';
import { getCart } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { getAmazonPayV2, getPaymentMethodsState } from '../../payment-methods.mock';

import { AmazonPayV2ButtonParams, AmazonPayV2PayOptions, AmazonPayV2Placement, AmazonPayV2SDK } from './amazon-pay-v2';
import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import { getAmazonPayV2ButtonParamsMock, getAmazonPayV2SDKMock, getPaymentMethodMockUndefinedLedgerCurrency, getPaymentMethodMockUndefinedMerchant } from './amazon-pay-v2.mock';

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
        let amazonPayV2ButtonParams: AmazonPayV2ButtonParams;

        beforeEach(() => {
            amazonPayV2ButtonParams = getAmazonPayV2ButtonParamsMock();
        });

        it('creates the html button element', async () => {
            await processor.initialize(getAmazonPayV2());
            processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(containerId, amazonPayV2ButtonParams);
        });

        it('throws an error when amazonPayV2SDK is not initialized', () => {
            expect(() => processor.createButton(containerId, amazonPayV2ButtonParams)).toThrow(NotInitializedError);
        });
    });

    describe('#renderAmazonPayButton', () => {
        let store: CheckoutStore;

        beforeAll(() => {
            const container = document.createElement('div');
            container.id = 'foo';
            document.body.appendChild(container);
        });

        beforeEach(() => {
            store = createCheckoutStore(getCheckoutStoreState());
        });

        it('should render an Amazon Pay button and validate if cart contains physical items', async () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock();
            expectedOptions.createCheckoutSession.url = `${getConfig().storeConfig.storeProfile.shopPath}/remote-checkout/amazonpay/payment-session`;
            expectedOptions.productType = AmazonPayV2PayOptions.PayOnly;

            const cartMock = getCart();
            cartMock.lineItems.physicalItems = [];

            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValueOnce(cartMock);

            await processor.initialize(getAmazonPayV2());
            processor.renderAmazonPayButton('foo', store.getState(), 'amazonpay', AmazonPayV2Placement.Checkout);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
        });

        it('should provide a relative URL to create a checkout session', async () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock();
            expectedOptions.createCheckoutSession.url = `/remote-checkout/amazonpay/payment-session`;

            const storeConfigMock = getConfig().storeConfig;
            storeConfigMock.checkoutSettings.features = {
                'INT-5826.amazon_relative_url': true,
            };

            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow')
                .mockReturnValueOnce(storeConfigMock);

            await processor.initialize(getAmazonPayV2());
            processor.renderAmazonPayButton('foo', store.getState(), 'amazonpay', AmazonPayV2Placement.Checkout);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith('#foo', expectedOptions);
        });

        describe('should fail...', () => {
            test('if an invalid containerId is provided', async () => {
                await processor.initialize(getAmazonPayV2());
                const renderAmazonPayButton = () => processor.renderAmazonPayButton('bar', store.getState(), 'amazonpay', AmazonPayV2Placement.Checkout);

                expect(renderAmazonPayButton).toThrowError(InvalidArgumentError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if there is no payment methods data', async () => {
                const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
                const state = { ...getCheckoutStoreState(), paymentMethods };
                store = createCheckoutStore(state);

                await processor.initialize(getAmazonPayV2());
                const renderAmazonPayButton = () => processor.renderAmazonPayButton('foo', store.getState(), 'amazonpay', AmazonPayV2Placement.Checkout);

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if there is no store config data', async () => {
                const config = { ...getConfigState(), data: undefined };
                const state = { ...getCheckoutStoreState(), config };
                store = createCheckoutStore(state);

                await processor.initialize(getAmazonPayV2());
                const renderAmazonPayButton = () => processor.renderAmazonPayButton('foo', store.getState(), 'amazonpay', AmazonPayV2Placement.Checkout);

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if merchantId is undefined', async () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getPaymentMethodMockUndefinedMerchant());

                await processor.initialize(getAmazonPayV2());
                const renderAmazonPayButton = () => processor.renderAmazonPayButton('foo', store.getState(), 'amazonpay', AmazonPayV2Placement.Checkout);

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });

            test('if ledgerCurrency is undefined', async () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(getPaymentMethodMockUndefinedLedgerCurrency());

                await processor.initialize(getAmazonPayV2());
                const renderAmazonPayButton = () => processor.renderAmazonPayButton('foo', store.getState(), 'amazonpay', AmazonPayV2Placement.Checkout);

                expect(renderAmazonPayButton).toThrowError(MissingDataError);
                expect(amazonPayV2SDKMock.Pay.renderButton).not.toHaveBeenCalled();
            });
        });
    });
});
