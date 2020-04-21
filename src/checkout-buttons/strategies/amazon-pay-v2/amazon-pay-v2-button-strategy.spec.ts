import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { PaymentMethod } from '../../../payment';
import { getAmazonPayV2, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonPayV2PaymentProcessor, AmazonPayV2PaymentProcessor } from '../../../payment/strategies/amazon-pay-v2';
import { getPaymentMethodMockUndefinedMerchant } from '../../../payment/strategies/amazon-pay-v2/amazon-pay-v2.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';

import AmazonPayV2ButtonStrategy from './amazon-pay-v2-button-strategy';
import { getAmazonPayV2CheckoutButtonOptions, Mode } from './amazon-pay-v2-button.mock';

describe('AmazonPayV2ButtonStrategy', () => {
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let paymentMethod: PaymentMethod;
    let paymentProcessor: AmazonPayV2PaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: AmazonPayV2ButtonStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
        paymentMethod = getAmazonPayV2();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender))
        );

        paymentProcessor = createAmazonPayV2PaymentProcessor(store);

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

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethod);

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
        it('Creates the button', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalledWith(
                '#amazonpayCheckoutButton', {
                    checkoutLanguage: 'en_US',
                    createCheckoutSession: {url: 'https://store-k1drp8k8.bcapp.dev/remote-checkout/amazonpay/payment-session'},
                    ledgerCurrency: 'USD',
                    merchantId: 'checkout_amazonpay',
                    placement: 'Cart',
                    productType: 'PayAndShip',
                    region: 'us',
                    sandbox: true,
                });
        });

        it('Creates the button and validates if cart contains physical items', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue({...store.getState().cart.getCart(), lineItems : {physicalItems: []}});

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalledWith(
                '#amazonpayCheckoutButton', {
                    checkoutLanguage: 'en_US',
                    createCheckoutSession: {url: 'https://store-k1drp8k8.bcapp.dev/remote-checkout/amazonpay/payment-session'},
                    ledgerCurrency: 'USD',
                    merchantId: 'checkout_amazonpay',
                    placement: 'Cart',
                    productType: 'PayOnly',
                    region: 'us',
                    sandbox: true,
                });
        });

        it('fails to create button if not PaymentMethod is supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if config is not initialized', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(undefined);
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if merchantId is not supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getPaymentMethodMockUndefinedMerchant());
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('initialises the payment processor once', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions();

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('fails to initialize the strategy if not container id is supplied', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.UndefinedContainer);

            await expect( strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if not a valid container id is supplied', async () => {
            checkoutButtonOptions = getAmazonPayV2CheckoutButtonOptions(Mode.InvalidContainer);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
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
