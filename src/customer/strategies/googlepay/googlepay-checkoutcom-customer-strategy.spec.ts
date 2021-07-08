import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster/';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressActionType, BillingAddressRequestSender } from '../../../billing';
import { getCart, getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createGooglePayPaymentProcessor, GooglePayCheckoutcomInitializer, GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { getGooglePaymentDataMock } from '../../../payment/strategies/googlepay/googlepay.mock';
import { getQuote } from '../../../quote/internal-quotes.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { GoogleRecaptcha, GoogleRecaptchaScriptLoader, GoogleRecaptchaWindow, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerRequestSender from '../../customer-request-sender';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import { getCheckoutcomCustomerInitializeOptions, Mode } from './googlepay-customer-mock';
import GooglePayCustomerStrategy from './googlepay-customer-strategy';

describe('GooglePayCustomerStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let container: HTMLDivElement;
    let customerActionCreator: CustomerActionCreator;
    let customerInitializeOptions: CustomerInitializeOptions;
    let formPoster: FormPoster;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
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
            new GooglePayCheckoutcomInitializer(requestSender)
        );

        formPoster = createFormPoster();

        googleRecaptchaMockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(createScriptLoader(), googleRecaptchaMockWindow);
        googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader, new MutationObserverFactory());

        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(createRequestSender()),
            new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
            ),
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(createRequestSender())
            )
        );

        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(createRequestSender()),
            new SubscriptionsActionCreator(
                new SubscriptionsRequestSender(createRequestSender())
            )
        );

        strategy = new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            paymentProcessor,
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
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
                customerInitializeOptions = getCheckoutcomCustomerInitializeOptions();

                await strategy.initialize(customerInitializeOptions);

                expect(paymentProcessor.createButton).toHaveBeenCalled();
            });

            it('fails to initialize the strategy if no GooglePayCustomerInitializeOptions is provided ', () => {
                customerInitializeOptions = getCheckoutcomCustomerInitializeOptions(Mode.Incomplete);

                expect(() => strategy.initialize(customerInitializeOptions)).toThrow(InvalidArgumentError);
            });

            it('fails to initialize the strategy if no methodid is supplied', () => {
                customerInitializeOptions = getCheckoutcomCustomerInitializeOptions(Mode.UndefinedMethodId);

                expect(() => strategy.initialize(customerInitializeOptions)).toThrow(InvalidArgumentError);
            });

            it('fails to initialize the strategy if no valid container id is supplied', async () => {
                customerInitializeOptions = getCheckoutcomCustomerInitializeOptions(Mode.InvalidContainer);

                await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#deinitialize()', () => {
        let containerId: string;

        beforeAll(() => {
            customerInitializeOptions = getCheckoutcomCustomerInitializeOptions();
            containerId = customerInitializeOptions.googlepaycheckoutcom ?
                customerInitializeOptions.googlepaycheckoutcom.container : '';
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

    describe('#continueAsGuest()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getCheckoutcomCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('runs default continue as guest flow', async () => {
            const credentials = { email: 'foo@bar.com' };
            const options = { methodId: 'googlepaycheckoutcom' };
            const action = of(createAction(BillingAddressActionType.ContinueAsGuestRequested, getQuote()));

            jest.spyOn(billingAddressActionCreator, 'continueAsGuest')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            const output = await strategy.continueAsGuest(credentials, options);

            expect(billingAddressActionCreator.continueAsGuest).toHaveBeenCalledWith(credentials, options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
            expect(output).toEqual(store.getState());
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', async () => {
            customerInitializeOptions = getCheckoutcomCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getCheckoutcomCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('successfully signs out', async () => {
            const paymentId = {
                providerId: 'googlepaycheckoutcom',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

            const options = {
                methodId: 'googlepaycheckoutcom',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('googlepaycheckoutcom', options);
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('Returns state if no payment method exist', async () => {
            const paymentId = undefined;
            jest.spyOn(store, 'getState');

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            const options = {
                methodId: 'googlepaycheckoutcom',
            };

            expect(await strategy.signOut(options)).toEqual(store.getState());
            expect(store.getState).toHaveBeenCalledTimes(4);
        });
    });

    describe('#signUp()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getCheckoutcomCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('runs default sign up customer flow', async () => {
            const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
            const options = { methodId: 'googlepaycheckoutcom' };
            const action = of(createAction(CustomerActionType.CreateCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'createCustomer')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            const output = await strategy.signUp(customerAccount, options);

            expect(customerActionCreator.createCustomer).toHaveBeenCalledWith(customerAccount, options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
            expect(output).toEqual(store.getState());
        });
    });

    describe('#handleWalletButtonClick', () => {
        const googlePaymentDataMock = getGooglePaymentDataMock();

        beforeEach(() => {
            customerInitializeOptions = {
                methodId: 'googlepaycheckoutcom',
                googlepaycheckoutcom: {
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
