import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressActionType, BillingAddressRequestSender } from '../../../billing';
import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getMasterpass, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { Masterpass, MasterpassScriptLoader } from '../../../payment/strategies/masterpass';
import { getMasterpassScriptMock } from '../../../payment/strategies/masterpass/masterpass.mock';
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

import MasterpassCustomerStrategy from './masterpass-customer-strategy';

describe('MasterpassCustomerStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let container: HTMLDivElement;
    let customerActionCreator: CustomerActionCreator;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let masterpass: Masterpass;
    let masterpassScriptLoader: MasterpassScriptLoader;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;

    beforeEach(() => {
        paymentMethodMock = {
            ...getMasterpass(),
            initializationData: {
                checkoutId: 'checkoutId',
                allowedCardTypes: ['visa', 'amex', 'mastercard'],
                isMasterpassSrcEnabled: false,
            },
        };

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        jest.spyOn(store.getState().config, 'getStoreConfig')
            .mockReturnValue(getConfig().storeConfig);

        requestSender = createRequestSender();

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender)
        );

        masterpass = getMasterpassScriptMock();

        masterpassScriptLoader = new MasterpassScriptLoader(createScriptLoader());

        jest.spyOn(masterpassScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(masterpass));

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );

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

        strategy = new MasterpassCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            masterpassScriptLoader,
            billingAddressActionCreator,
            customerActionCreator
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of MasterpassCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(MasterpassCustomerStrategy);
    });

    describe('#initialize()', () => {
        let masterpassOptions: CustomerInitializeOptions;
        const masterpassScriptLoaderParams = {
            useMasterpassSrc: false,
            language: 'en_US',
            testMode: true,
            checkoutId: 'checkoutId',
        };

        beforeEach(() => {
            masterpassOptions = { methodId: 'masterpass', masterpass: { container: 'login' } };
        });

        it('loads masterpass script in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(masterpassScriptLoaderParams);
        });

        it('loads masterpass without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;
            masterpassScriptLoaderParams.testMode = false;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(masterpassScriptLoaderParams);
        });

        it('fails to initialize the strategy if no methodId is supplied', async () => {
            masterpassOptions = { methodId: undefined, masterpass: { container: 'login' } };
            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to initialize the strategy if no cart is supplied', async () => {
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(MissingDataError);
            }
        });

        it('fails to initialize the strategy if no checkoutId is supplied', async () => {
            paymentMethodMock.initializationData.checkoutId = undefined;
            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(MissingDataError);
            }
        });

        it('proceeds to checkout if masterpass button is clicked', async () => {
            jest.spyOn(masterpass, 'checkout');
            await strategy.initialize(masterpassOptions);
            if (masterpassOptions.masterpass) {
                const masterpassButton = document.getElementById(masterpassOptions.masterpass.container);
                if (masterpassButton) {
                    const btn = masterpassButton.firstChild as HTMLElement;
                    if (btn) {
                        btn.click();
                        expect(masterpass.checkout).toHaveBeenCalled();
                    }
                }
            }
        });
    });

    describe('#deinitialize()', () => {
        let masterpassOptions: CustomerInitializeOptions;

        beforeEach(() => {
            masterpassOptions = { methodId: 'masterpass', masterpass: { container: 'login' } };
        });

        it('successfully deinitializes the strategy', async () => {
            jest.spyOn(masterpass, 'checkout');
            await strategy.initialize(masterpassOptions);
            strategy.deinitialize();
            if (masterpassOptions.masterpass) {
                const masterpassButton = document.getElementById(masterpassOptions.masterpass.container);
                if (masterpassButton) {
                    expect(masterpassButton.firstChild).toBe(null);
                }
            }
            // Prevent "After Each" failure
            container = document.createElement('div');
            document.body.appendChild(container);
        });
    });

    describe('#continueAsGuest()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'masterpass', masterpass: { container: 'login' } });
        });

        it('runs default continue as guest flow', async () => {
            const credentials = { email: 'foo@bar.com' };
            const options = { methodId: 'masterpass' };
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
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'masterpass', masterpass: { container: 'login' } });
        });

        it('throws error if trying to sign in programmatically', () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            const paymentId = {
                providerId: 'masterpass',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

            await strategy.initialize({ methodId: 'masterpass', masterpass: { container: 'login' } });
        });

        it('throws error if trying to sign out programmatically', async () => {
            const options = {
                methodId: 'masterpass',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('masterpass', options);
            expect(store.dispatch).toHaveBeenCalled();
        });
    });

    describe('#signUp()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'masterpass', masterpass: { container: 'login' } });
        });

        it('runs default sign up customer flow', async () => {
            const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
            const options = { methodId: 'masterpass' };
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
});
