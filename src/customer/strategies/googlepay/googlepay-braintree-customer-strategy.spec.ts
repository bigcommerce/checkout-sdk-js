import { createFormPoster, FormPoster } from '@bigcommerce/form-poster/';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { PaymentMethod } from '../../../payment';
import { getPaymentMethod, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../../../payment/strategies/braintree';
import { createGooglePayPaymentProcessor, GooglePayBraintreeInitializer, GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { getGooglePaymentDataMock } from '../../../payment/strategies/googlepay/googlepay.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import { getBraintreeCustomerInitializeOptions, Mode } from './googlepay-customer-mock';
import GooglePayCustomerStrategy from './googlepay-customer-strategy';

describe('GooglePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let customerInitializeOptions: CustomerInitializeOptions;
    let paymentMethod: PaymentMethod;
    let paymentProcessor: GooglePayPaymentProcessor;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
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

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender)
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

        strategy = new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            paymentProcessor,
            formPoster
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

        container.appendChild(walletButton);
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of GooglePayCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });

    describe('#initialize()', () => {

        describe('Payment method exist', () => {

            it('Creates the button', async () => {
                customerInitializeOptions = getBraintreeCustomerInitializeOptions();

                await strategy.initialize(customerInitializeOptions);

                expect(paymentProcessor.createButton).toHaveBeenCalled();
            });

            it('fails to initialize the strategy if no GooglePayCustomerInitializeOptions is provided ', async () => {
                customerInitializeOptions = getBraintreeCustomerInitializeOptions(Mode.Incomplete);

                try {
                    await strategy.initialize(customerInitializeOptions);
                } catch (e) {
                    expect(e).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('fails to initialize the strategy if no methodid is supplied', async () => {
                customerInitializeOptions = getBraintreeCustomerInitializeOptions(Mode.UndefinedMethodId);

                try {
                    await strategy.initialize(customerInitializeOptions);
                } catch (e) {
                    expect(e).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('fails to initialize the strategy if no valid container id is supplied', async () => {
                customerInitializeOptions = getBraintreeCustomerInitializeOptions(Mode.InvalidContainer);

                try {
                    await strategy.initialize(customerInitializeOptions);
                } catch (e) {
                    expect(e).toBeInstanceOf(InvalidArgumentError);
                }
            });
        });
    });

    describe('#deinitialize()', () => {
        let customerInitializeOptions: CustomerInitializeOptions;

        beforeEach(() => {
            customerInitializeOptions = getBraintreeCustomerInitializeOptions();
        });

        it('succesfully deinitializes the strategy', async () => {
            await strategy.initialize(customerInitializeOptions);

            strategy.deinitialize();

            if (customerInitializeOptions.googlepaybraintree) {
                const button = document.getElementById(customerInitializeOptions.googlepaybraintree.container);

                if (button) {
                    expect(button.firstChild).toBe(null);
                }
            }

            // Prevent "After Each" failure
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        it('Validates if strategy is loaded before call deinitialize', async () => {
            await strategy.deinitialize();

            if (customerInitializeOptions.googlepaybraintree) {
                const button = document.getElementById(customerInitializeOptions.googlepaybraintree.container);

                if (button) {
                    expect(button.firstChild).toBe(null);
                }
            }

            // Prevent "After Each" failure
            container = document.createElement('div');
            document.body.appendChild(container);
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', async () => {
            customerInitializeOptions = getBraintreeCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getBraintreeCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('throws error if trying to sign out programmatically', async () => {
            const paymentId = {
                providerId: 'googlepaybraintree',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

            const options = {
                methodId: 'googlepaybraintree',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('googlepaybraintree', options);
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('Returns state if no payment method exist', async () => {
            const paymentId = undefined;
            jest.spyOn(store, 'getState');

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            const options = {
                methodId: 'googlepaybraintree',
            };

            await strategy.signOut(options);

            expect(store.getState).toHaveBeenCalledTimes(3);
        });
    });

    describe('#handleWalletButtonClick', () => {
        let googlePayOptions: CustomerInitializeOptions;

        beforeEach(() => {
            googlePayOptions = {
                methodId: 'googlepaybraintree',
                googlepaybraintree: {
                    container: 'googlePayCheckoutButton',
                },
            };
        });

        it('handles wallet button event', async () => {
            jest.spyOn(paymentProcessor, 'displayWallet').mockReturnValue(Promise.resolve(getGooglePaymentDataMock()));
            jest.spyOn(paymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentProcessor, 'updateShippingAddress').mockReturnValue(Promise.resolve());

            await strategy.initialize(googlePayOptions).then(() => {
                walletButton.click();
            });

            expect(paymentProcessor.initialize).toHaveBeenCalled();
        });
    });
});
