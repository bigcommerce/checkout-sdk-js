import { createFormPoster, FormPoster } from '@bigcommerce/form-poster/';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getCart, getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createGooglePayPaymentProcessor, GooglePayPaymentProcessor, GooglePayStripeInitializer } from '../../../payment/strategies/googlepay';
import { getGooglePaymentDataMock } from '../../../payment/strategies/googlepay/googlepay.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import { getStripeCustomerInitializeOptions, Mode } from './googlepay-customer-mock';
import GooglePayCustomerStrategy from './googlepay-customer-strategy';

describe('GooglePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let customerInitializeOptions: CustomerInitializeOptions;
    let paymentProcessor: GooglePayPaymentProcessor;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
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
            new GooglePayStripeInitializer()
        );

        formPoster = createFormPoster();

        strategy = new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            paymentProcessor,
            formPoster
        );

        jest.spyOn(formPoster, 'postForm')
            .mockReturnValue(Promise.resolve());
        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(paymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        walletButton = document.createElement('a');
        walletButton.setAttribute('id', 'mockButton');
        jest.spyOn(paymentProcessor, 'createButton')
            .mockImplementation((onClick: (event: Event) => Promise<void>) => {
                walletButton.onclick = onClick;

                return walletButton;
            });

        container = document.createElement('div');
        container.setAttribute('id', 'googlePayCheckoutButton');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {
        describe('Payment method exist', () => {
            it('Creates the button', async () => {
                customerInitializeOptions = getStripeCustomerInitializeOptions();

                await strategy.initialize(customerInitializeOptions);

                expect(paymentProcessor.createButton).toHaveBeenCalled();
            });

            it('fails to initialize the strategy if no GooglePayCustomerInitializeOptions is provided ', () => {
                customerInitializeOptions = getStripeCustomerInitializeOptions(Mode.Incomplete);

                expect(() => strategy.initialize(customerInitializeOptions)).toThrow(InvalidArgumentError);
            });

            it('fails to initialize the strategy if no methodid is supplied', () => {
                customerInitializeOptions = getStripeCustomerInitializeOptions(Mode.UndefinedMethodId);

                expect(() => strategy.initialize(customerInitializeOptions)).toThrow(InvalidArgumentError);
            });

            it('fails to initialize the strategy if no valid container id is supplied', async () => {
                customerInitializeOptions = getStripeCustomerInitializeOptions(Mode.InvalidContainer);

                await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#deinitialize()', () => {
        let containerId: string;

        beforeAll(() => {
            customerInitializeOptions = getStripeCustomerInitializeOptions();
            containerId = customerInitializeOptions.googlepaystripe ?
                customerInitializeOptions.googlepaystripe.container : '';
        });

        it('successfully deinitializes the strategy', async () => {
            await strategy.initialize(customerInitializeOptions);

            const button = document.getElementById(containerId);

            expect(button).toHaveProperty('firstChild', walletButton);

            await strategy.deinitialize();

            expect(button).toHaveProperty('firstChild', null);
        });

        it('Validates if strategy is loaded before call deinitialize', async () => {
            await strategy.deinitialize();

            const button = document.getElementById(containerId);

            expect(button).toHaveProperty('firstChild', null);
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', async () => {
            customerInitializeOptions = getStripeCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getStripeCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('successfully signs out', async () => {
            const paymentId = {
                providerId: 'googlepaystripe',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

            const options = {
                methodId: 'googlepaystripe',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('googlepaystripe', options);
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('Returns state if no payment method exist', async () => {
            const paymentId = undefined;
            jest.spyOn(store, 'getState');

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            const options = {
                methodId: 'googlepaystripe',
            };

            expect(await strategy.signOut(options)).toEqual(store.getState());
            expect(store.getState).toHaveBeenCalledTimes(4);
        });
    });

    describe('#handleWalletButtonClick', () => {
        const googlePaymentDataMock = getGooglePaymentDataMock();

        beforeEach(() => {
            customerInitializeOptions = {
                methodId: 'googlepaystripe',
                googlepaystripe: {
                    container: 'googlePayCheckoutButton',
                },
            };

            jest.spyOn(paymentProcessor, 'displayWallet').mockResolvedValue(googlePaymentDataMock);
            jest.spyOn(paymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentProcessor, 'updateShippingAddress').mockReturnValue(Promise.resolve());
        });

        it('displays the wallet and updates the shipping address', async () => {
            await strategy.initialize(customerInitializeOptions);

            walletButton.click();

            await new Promise(resolve => process.nextTick(resolve));

            expect(paymentProcessor.displayWallet).toHaveBeenCalled();
            expect(paymentProcessor.handleSuccess).toHaveBeenCalledWith(googlePaymentDataMock);
            expect(paymentProcessor.updateShippingAddress).toHaveBeenCalledWith(googlePaymentDataMock.shippingAddress);
        });

        it('displays the wallet and does not update the shipping address if cart has digital products only', async () => {
            const cart = getCart();
            cart.lineItems.physicalItems = [];
            jest.spyOn(store.getState().cart, 'getCartOrThrow')
                .mockReturnValue(cart);

            await strategy.initialize(customerInitializeOptions);

            walletButton.click();

            await new Promise(resolve => process.nextTick(resolve));

            expect(paymentProcessor.displayWallet).toHaveBeenCalled();
            expect(paymentProcessor.handleSuccess).toHaveBeenCalledWith(googlePaymentDataMock);
            expect(paymentProcessor.updateShippingAddress).not.toHaveBeenCalled();
        });
    });
});
