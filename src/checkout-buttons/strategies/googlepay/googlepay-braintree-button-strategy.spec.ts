import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { PaymentMethod } from '../../../payment';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../../../payment/strategies/braintree';
import { createGooglePayPaymentProcessor, GooglePaymentData, GooglePayBraintreeInitializer, GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { getGooglePaymentDataMock } from '../../../payment/strategies/googlepay/googlepay.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';

import GooglePayButtonStrategy from './googlepay-button-strategy';
import { getCheckoutButtonOptions, getPaymentMethod, Mode } from './googlepay-button.mock';

describe('GooglePayCheckoutButtonStrategy', () => {
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let paymentMethod: PaymentMethod;
    let paymentProcessor: GooglePayPaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: GooglePayButtonStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
        paymentMethod = getPaymentMethod();

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

        paymentProcessor = createGooglePayPaymentProcessor(
            store,
            new GooglePayBraintreeInitializer(
                new BraintreeSDKCreator(
                    new BraintreeScriptLoader(createScriptLoader())
                )
            )
        );

        formPoster = createFormPoster();

        strategy = new GooglePayButtonStrategy(
            store,
            formPoster,
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
        container.setAttribute('id', 'googlePayCheckoutButton');
        walletButton = document.createElement('a');
        walletButton.setAttribute('id', 'mockButton');

        jest.spyOn(paymentProcessor, 'createButton')
            .mockReturnValue(walletButton);

        jest.spyOn(paymentProcessor, 'deinitialize');

        container.appendChild(walletButton);
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of GooglePayButtonStrategy', () => {
        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });

    describe('#initialize()', () => {

        describe('Payment method exist', () => {

            it('Creates the button', async () => {
                checkoutButtonOptions = getCheckoutButtonOptions();

                await strategy.initialize(checkoutButtonOptions);

                expect(paymentProcessor.createButton).toHaveBeenCalled();
            });

            it('Validates if strategy is been initialized', async () => {
                checkoutButtonOptions = getCheckoutButtonOptions();

                await strategy.initialize(checkoutButtonOptions);

                setTimeout(() => {
                    strategy.initialize(checkoutButtonOptions);
                }, 0);

                strategy.initialize(checkoutButtonOptions);

                expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
            });

            it('fails to initialize the strategy if no container id is supplied', async () => {
                checkoutButtonOptions = getCheckoutButtonOptions(Mode.UndefinedContainer);

                try {
                    await strategy.initialize(checkoutButtonOptions);
                } catch (e) {
                    expect(e).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('fails to initialize the strategy if no valid container id is supplied', async () => {
                checkoutButtonOptions = getCheckoutButtonOptions(Mode.InvalidContainer);

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
            checkoutButtonOptions = getCheckoutButtonOptions(Mode.GooglePayBraintree);
        });

        it('check if googlepay payment processor deinitialize is called', async () => {
            await strategy.initialize(checkoutButtonOptions);

            strategy.deinitialize();

            expect(paymentProcessor.deinitialize).toBeCalled();
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

    describe('#handleWalletButtonClick', () => {
        let googlePayOptions: CheckoutButtonInitializeOptions;
        let paymentData: GooglePaymentData;

        beforeEach(() => {
            googlePayOptions = getCheckoutButtonOptions(Mode.GooglePayBraintree);

            paymentData = getGooglePaymentDataMock();
        });

        it('handles wallet button event', async () => {
            jest.spyOn(paymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(paymentData));
            jest.spyOn(paymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentProcessor, 'updateShippingAddress').mockReturnValue(Promise.resolve());

            await strategy.initialize(googlePayOptions).then(() => {
                walletButton.click();
            });

            expect(paymentProcessor.initialize).toHaveBeenCalled();
        });
    });
});
