import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getAmazonPayV2, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonPayV2PaymentProcessor, AmazonPayV2PaymentProcessor, AmazonPayV2Placement } from '../../../payment/strategies/amazon-pay-v2';
import { getAmazonPayV2ButtonParamsMock, getPaymentMethodMockUndefinedMerchant } from '../../../payment/strategies/amazon-pay-v2/amazon-pay-v2.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';

import AmazonPayV2ButtonStrategy from './amazon-pay-v2-button-strategy';
import { getAmazonPayV2CheckoutButtonOptions, Mode } from './amazon-pay-v2-button.mock';

describe('AmazonPayV2ButtonStrategy', () => {
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let paymentProcessor: AmazonPayV2PaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: AmazonPayV2ButtonStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());

        requestSender = createRequestSender();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );

        paymentProcessor = createAmazonPayV2PaymentProcessor();

        formPoster = createFormPoster();

        strategy = new AmazonPayV2ButtonStrategy(
            store,
            checkoutActionCreator,
            paymentProcessor
        );

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(paymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(formPoster, 'postForm')
            .mockReturnValue(Promise.resolve());

        container = document.createElement('div');
        container.setAttribute('id', 'amazonpayCheckoutButton');
        walletButton = document.createElement('a');
        walletButton.setAttribute('id', 'mockButton');

        jest.spyOn(paymentProcessor, 'createButton')
            .mockReturnValue(walletButton);

        container.appendChild(walletButton);
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {
        it('creates the button', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalledWith(
                '#amazonpayCheckoutButton',
                getAmazonPayV2ButtonParamsMock()
            );
        });

        it('creates the button and validates if cart contains physical items', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue({...store.getState().cart.getCart(), lineItems : {physicalItems: []}});

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalledWith(
                '#amazonpayCheckoutButton',
                getAmazonPayV2ButtonParamsMock()
            );
        });

        it('fails to initialize the strategy if there is no payment method data', async () => {
            const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
            const state = { ...getCheckoutStoreState(), paymentMethods };
            store = createCheckoutStore(state);
            strategy = new AmazonPayV2ButtonStrategy(
                store,
                checkoutActionCreator,
                paymentProcessor
            );

            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if there is no store config data', async () => {
            const config = { ...getConfigState(), data: undefined };
            const state = { ...getCheckoutStoreState(), config };
            store = createCheckoutStore(state);

            jest.spyOn(store, 'dispatch')
                .mockReturnValue(Promise.resolve(store.getState()));

            strategy = new AmazonPayV2ButtonStrategy(
                store,
                checkoutActionCreator,
                paymentProcessor
            );

            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if merchantId is not provided', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(getPaymentMethodMockUndefinedMerchant());
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('initialises the payment processor once', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('fails to initialize the strategy if containerId is not provided', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedContainer);

            await expect( strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to create button if not a valid containerId is provided', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.InvalidContainer);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('loads the checkout and creates the button if amazonpay is not provided', async () => {
            const expectedOptions = getAmazonPayV2ButtonParamsMock();
            expectedOptions.createCheckoutSession.url = `${getConfig().storeConfig.storeProfile.shopPath}/remote-checkout/amazonpay/payment-session`;
            expectedOptions.placement = AmazonPayV2Placement.Cart;

            jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout');

            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

            await strategy.initialize(checkoutButtonOptions);

            expect(checkoutActionCreator.loadDefaultCheckout).toBeCalled();
            expect(paymentProcessor.createButton).toHaveBeenCalledWith('#amazonpayCheckoutButton', expectedOptions);
        });

        it('fails to initialize the strategy if methodId is not provided', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedMethodId);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to create button if ledgerCurrency is not provided', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue({ ...getAmazonPayV2(), initializationData: { ledgerCurrency: '' } });
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if shopPath is not provided', async () => {
            const storeConfig = getConfig().storeConfig;
            storeConfig.storeProfile.shopPath = '';
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow')
                .mockReturnValue(storeConfig);
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedAmazonPay);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });
    });

    describe('#deinitialize()', () => {
        let checkoutButtonOptions: CheckoutButtonInitializeOptions;

        beforeEach(() => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.Full);
            container = document.createElement('div');
        });

        afterEach(() => {
            document.body.appendChild(container);
        });

        it('succesfully deinitializes the strategy', async () => {
            await strategy.initialize(checkoutButtonOptions);

            await strategy.deinitialize();
            const button = document.getElementById(checkoutButtonOptions.containerId);

            expect(button).toBe(null);
        });

        it('run deinitializes without calling initialize', async () => {
            await expect(strategy.deinitialize()).resolves.toBe(undefined);
        });
    });
});
