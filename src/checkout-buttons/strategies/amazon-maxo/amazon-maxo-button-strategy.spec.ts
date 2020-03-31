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
import { getAmazonMaxo, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonMaxoPaymentProcessor, AmazonMaxoPaymentProcessor } from '../../../payment/strategies/amazon-maxo';
import { getPaymentMethodMockUndefinedMerchant } from '../../../payment/strategies/amazon-maxo/amazon-maxo.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';

import AmazonMaxoButtonStrategy from './amazon-maxo-button-strategy';
import { getAmazonMaxoCheckoutButtonOptions, Mode } from './amazon-maxo-button.mock';

describe('AmazonMaxoButtonStrategy', () => {
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let paymentMethod: PaymentMethod;
    let paymentProcessor: AmazonMaxoPaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: AmazonMaxoButtonStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
        paymentMethod = getAmazonMaxo();

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

        paymentProcessor = createAmazonMaxoPaymentProcessor(store);

        formPoster = createFormPoster();

        strategy = new AmazonMaxoButtonStrategy(
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
        container.setAttribute('id', 'amazonmaxoCheckoutButton');
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
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions();

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalledWith(
                '#amazonmaxoCheckoutButton', {
                    checkoutLanguage: 'en_US',
                    createCheckoutSession: {url: 'https://store-k1drp8k8.bcapp.dev/remote-checkout/amazonmaxo/payment-session'},
                    ledgerCurrency: 'USD',
                    merchantId: 'checkout_amazonmaxo',
                    placement: 'Cart',
                    productType: 'PayAndShip',
                    region: 'us',
                    sandbox: true,
                });
        });

        it('fails to create button if not PaymentMethod is supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions();

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if config is not initialized', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(undefined);
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions();

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if merchantId is not supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getPaymentMethodMockUndefinedMerchant());
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions();

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('initialises the payment processor once', async () => {
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions();

            await strategy.initialize(checkoutButtonOptions);
            strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('fails to initialize the strategy if not container id is supplied', async () => {
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions(Mode.UndefinedContainer);

            await expect( strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if not a valid container id is supplied', async () => {
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions(Mode.InvalidContainer);

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#deinitialize()', () => {
        let checkoutButtonOptions: CheckoutButtonInitializeOptions;

        beforeEach(() => {
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions(Mode.Full);
            container = document.createElement('div');
        });

        afterEach(() => {
            document.body.appendChild(container);
        });

        it('succesfully deinitializes the strategy', async () => {
            await strategy.initialize(checkoutButtonOptions);

            await strategy.deinitialize();
            const button = document.getElementById(checkoutButtonOptions.containerId);

            if (button) {
                expect(button.firstChild).toBe(null);
            }
        });

        it('run deinitializes without calling initialize', async () => {
            await expect(strategy.deinitialize()).resolves.toBe(undefined);
        });
    });
});
