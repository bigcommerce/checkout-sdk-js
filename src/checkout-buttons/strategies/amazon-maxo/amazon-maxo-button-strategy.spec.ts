import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { PaymentMethod } from '../../../payment';
import { getAmazonMaxo, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonMaxoPaymentProcessor, AmazonMaxoPaymentProcessor } from '../../../payment/strategies/amazon-maxo';
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

        checkoutActionCreator = checkoutActionCreator = new CheckoutActionCreator(
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

    it('creates an instance of AmazonMaxoButtonStrategy', () => {
        expect(strategy).toBeInstanceOf(AmazonMaxoButtonStrategy);
    });

    describe('#initialize()', () => {

        describe('Payment method exist', () => {

            it('Creates the button', async () => {
                checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions();

                await strategy.initialize(checkoutButtonOptions);

                expect(paymentProcessor.createButton).toHaveBeenCalled();
            });

            it('Validates if strategy is been initialized', async () => {
                checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions();

                await strategy.initialize(checkoutButtonOptions);

                setTimeout(() => {
                    strategy.initialize(checkoutButtonOptions);
                }, 0);

                strategy.initialize(checkoutButtonOptions);

                expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
            });

            it('fails to initialize the strategy if not container id is supplied', async () => {
                checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions(Mode.UndefinedContainer);

                try {
                    await strategy.initialize(checkoutButtonOptions);
                } catch (e) {
                    expect(e).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('fails to initialize the strategy if not a valid container id is supplied', async () => {
                checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions(Mode.InvalidContainer);

                try {
                    await strategy.initialize(checkoutButtonOptions);
                } catch (e) {
                    expect(e).toBeInstanceOf(InvalidArgumentError);
                }
            });

        });
    });

    describe('#deinitialize()', () => {
        let checkoutButtonOptions: CheckoutButtonInitializeOptions;

        beforeEach(() => {
            checkoutButtonOptions = getAmazonMaxoCheckoutButtonOptions(Mode.Full);
        });

        it('succesfully deinitializes the strategy', async () => {
            await strategy.initialize(checkoutButtonOptions);

            strategy.deinitialize();

            if (checkoutButtonOptions.containerId) {
                const button = document.getElementById(checkoutButtonOptions.containerId);

                if (button) {
                    expect(button.firstChild).toBe(null);
                }
            }

            container = document.createElement('div');
            document.body.appendChild(container);
        });

        it('Validates if strategy is loaded before call deinitialize', async () => {
            await strategy.deinitialize();

            if (checkoutButtonOptions.containerId) {
                const button = document.getElementById(checkoutButtonOptions.containerId);

                if (button) {
                    expect(button.firstChild).toBe(null);
                }
            }

            container = document.createElement('div');
            document.body.appendChild(container);
        });
    });
});
